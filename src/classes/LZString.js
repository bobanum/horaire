/* jslint esnext:true, browser:true */
// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
export default class LZString {
	static init() {
		// private property
		this.keyStrBase64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		this.keyStrUriSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$';
		this.baseReverseDic = {};
	}

	static getBaseValue(alphabet, character) {
		if (!this.baseReverseDic[alphabet]) {
			this.baseReverseDic[alphabet] = {};
			for (var i = 0; i < alphabet.length; i += 1) {
				this.baseReverseDic[alphabet][alphabet.charAt(i)] = i;
			}
		}
		return this.baseReverseDic[alphabet][character];
	}

	static compressToBase64(input) {
		if (input === null) {
			return '';
		}
		var res = this._compress(input, 6, function (a) {
			return LZString.keyStrBase64.charAt(a);
		});
		switch (res.length % 4) { // To produce valid Base64
		case 0:
			return res;
		case 1:
			return res + '===';
		case 2:
			return res + '==';
		case 3:
			return res + '=';
		default: // When could this happen ?
		}
	}
	static decompressFromBase64(input) {
		if (input === null) {
			return '';
		}
		if (input === '') {
			return null;
		}
		return this._decompress(input.length, 32, function (index) {
			return LZString.getBaseValue(LZString.keyStrBase64, input.charAt(index));
		});
	}

	static compressToUTF16(input) {
		if (input === null) {
			return '';
		}
		return LZString._compress(input, 15, function (a) {
			return LZString.f(a + 32);
		}) + ' ';
	}

	static decompressFromUTF16(compressed) {
		if (compressed === null) {
			return '';
		}
		if (compressed === '') {
			return null;
		}
		return LZString._decompress(compressed.length, 16384, function (index) {
			return compressed.charCodeAt(index) - 32;
		});
	}

	// compress into uint8array (UCS-2 big endian format)
	static compressToUint8Array(uncompressed) {
		var compressed = LZString.compress(uncompressed);
		var buf = new Uint8Array(compressed.length * 2); // 2 bytes per character

		for (var i = 0, TotalLen = compressed.length; i < TotalLen; i += 1) {
			var current_value = compressed.charCodeAt(i);
			buf[i * 2] = current_value >>> 8;
			buf[i * 2 + 1] = current_value % 256;
		}
		return buf;
	}

	// decompress from uint8array (UCS-2 big endian format)
	static decompressFromUint8Array(compressed) {
		if (compressed === null || compressed === undefined) {
			return LZString.decompress(compressed);
		} else {
			var buf = new Array(compressed.length / 2); // 2 bytes per character
			for (var i = 0, TotalLen = buf.length; i < TotalLen; i += 1) {
				buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
			}

			var result = [];
			buf.forEach(function (c) {
				result.push(LZString.f(c));
			});
			return this.decompress(result.join(''));
		}
	}

	// compress into a string that is already URI encoded
	static compressToEncodedURIComponent(input) {
		if (input === null) {
			return '';
		}
		return this._compress(input, 6, function (a) {
			return this.keyStrUriSafe.charAt(a);
		});
	}

	// decompress from an output of compressToEncodedURIComponent
	static decompressFromEncodedURIComponent(input) {
		if (input === null) {
			return '';
		}
		if (input === '') {
			return null;
		}
		input = input.replace(/ /g, '+');
		return this._decompress(input.length, 32, function (index) {
			return this.getBaseValue(this.keyStrUriSafe, input.charAt(index));
		});
	}

	static compress(uncompressed) {
		return this._compress(uncompressed, 16, function (a) {
			return String.fromCharCode(a);
		});
	}
	static _compress(uncompressed, bitsPerChar, getCharFromInt) {
		if (uncompressed === null) {
			return '';
		}
		var value;
		var context_dictionary = {};
		var context_dictionaryToCreate = {};
		var context_c = '';
		var context_wc = '';
		var context_w = '';
		var context_enlargeIn = 2; // Compensate for the first entry which should not count
		var context_dictSize = 3;
		var context_numBits = 2;
		var context_data = [];
		var context_data_val = 0;
		var context_data_position = 0;

		for (let ii = 0, n = uncompressed.length; ii < n; ii += 1) {
			context_c = uncompressed.charAt(ii);
			if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
				context_dictionary[context_c] = context_dictSize++;
				context_dictionaryToCreate[context_c] = true;
			}

			context_wc = context_w + context_c;
			if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
				context_w = context_wc;
			} else {
				if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
					if (context_w.charCodeAt(0) < 256) {
						for (let i = 0; i < context_numBits; i += 1) {
							context_data_val = (context_data_val << 1);
							if (context_data_position === bitsPerChar - 1) {
								context_data_position = 0;
								context_data.push(getCharFromInt.call(this, context_data_val));
								context_data_val = 0;
							} else {
								context_data_position++;
							}
						}
						value = context_w.charCodeAt(0);
						for (let i = 0; i < 8; i += 1) {
							context_data_val = (context_data_val << 1) | (value & 1);
							if (context_data_position === bitsPerChar - 1) {
								context_data_position = 0;
								context_data.push(getCharFromInt.call(this, context_data_val));
								context_data_val = 0;
							} else {
								context_data_position++;
							}
							value = value >> 1;
						}
					} else {
						value = 1;
						for (let i = 0; i < context_numBits; i += 1) {
							context_data_val = (context_data_val << 1) | value;
							if (context_data_position === bitsPerChar - 1) {
								context_data_position = 0;
								context_data.push(getCharFromInt.call(this, context_data_val));
								context_data_val = 0;
							} else {
								context_data_position++;
							}
							value = 0;
						}
						value = context_w.charCodeAt(0);
						for (let i = 0; i < 16; i += 1) {
							context_data_val = (context_data_val << 1) | (value & 1);
							if (context_data_position === bitsPerChar - 1) {
								context_data_position = 0;
								context_data.push(getCharFromInt.call(this, context_data_val));
								context_data_val = 0;
							} else {
								context_data_position++;
							}
							value = value >> 1;
						}
					}
					context_enlargeIn--;
					if (context_enlargeIn === 0) {
						context_enlargeIn = Math.pow(2, context_numBits);
						context_numBits++;
					}
					delete context_dictionaryToCreate[context_w];
				} else {
					value = context_dictionary[context_w];
					for (let i = 0; i < context_numBits; i += 1) {
						context_data_val = (context_data_val << 1) | (value & 1);
						if (context_data_position === bitsPerChar - 1) {
							context_data_position = 0;
							context_data.push(getCharFromInt.call(this, context_data_val));
							context_data_val = 0;
						} else {
							context_data_position++;
						}
						value = value >> 1;
					}
				}
				context_enlargeIn--;
				if (context_enlargeIn === 0) {
					context_enlargeIn = Math.pow(2, context_numBits);
					context_numBits++;
				}
				// Add wc to the dictionary.
				context_dictionary[context_wc] = context_dictSize++;
				context_w = String(context_c);
			}
		}

		// Output the code for w.
		if (context_w !== '') {
			if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
				if (context_w.charCodeAt(0) < 256) {
					for (let i = 0; i < context_numBits; i += 1) {
						context_data_val = (context_data_val << 1);
						if (context_data_position === bitsPerChar - 1) {
							context_data_position = 0;
							context_data.push(getCharFromInt.call(this, context_data_val));
							context_data_val = 0;
						} else {
							context_data_position++;
						}
					}
					value = context_w.charCodeAt(0);
					for (let i = 0; i < 8; i += 1) {
						context_data_val = (context_data_val << 1) | (value & 1);
						if (context_data_position === bitsPerChar - 1) {
							context_data_position = 0;
							context_data.push(getCharFromInt.call(this, context_data_val));
							context_data_val = 0;
						} else {
							context_data_position++;
						}
						value = value >> 1;
					}
				} else {
					value = 1;
					for (let i = 0; i < context_numBits; i += 1) {
						context_data_val = (context_data_val << 1) | value;
						if (context_data_position === bitsPerChar - 1) {
							context_data_position = 0;
							context_data.push(getCharFromInt.call(this, context_data_val));
							context_data_val = 0;
						} else {
							context_data_position++;
						}
						value = 0;
					}
					value = context_w.charCodeAt(0);
					for (let i = 0; i < 16; i += 1) {
						context_data_val = (context_data_val << 1) | (value & 1);
						if (context_data_position === bitsPerChar - 1) {
							context_data_position = 0;
							context_data.push(getCharFromInt.call(this, context_data_val));
							context_data_val = 0;
						} else {
							context_data_position++;
						}
						value = value >> 1;
					}
				}
				context_enlargeIn--;
				if (context_enlargeIn === 0) {
					context_enlargeIn = Math.pow(2, context_numBits);
					context_numBits++;
				}
				delete context_dictionaryToCreate[context_w];
			} else {
				value = context_dictionary[context_w];
				for (let i = 0; i < context_numBits; i += 1) {
					context_data_val = (context_data_val << 1) | (value & 1);
					if (context_data_position === bitsPerChar - 1) {
						context_data_position = 0;
						context_data.push(getCharFromInt.call(this, context_data_val));
						context_data_val = 0;
					} else {
						context_data_position++;
					}
					value = value >> 1;
				}
			}
			context_enlargeIn--;
			if (context_enlargeIn === 0) {
				context_enlargeIn = Math.pow(2, context_numBits);
				context_numBits++;
			}
		}

		// Mark the end of the stream
		value = 2;
		for (let i = 0; i < context_numBits; i += 1) {
			context_data_val = (context_data_val << 1) | (value & 1);
			if (context_data_position === bitsPerChar - 1) {
				context_data_position = 0;
				context_data.push(getCharFromInt.call(this, context_data_val));
				context_data_val = 0;
			} else {
				context_data_position++;
			}
			value = value >> 1;
		}

		// Flush the last char
		while (true) {
			context_data_val = (context_data_val << 1);
			if (context_data_position === bitsPerChar - 1) {
				context_data.push(getCharFromInt.call(this, context_data_val));
				break;
			} else {
				context_data_position++;
			}
		}
		return context_data.join('');
	}

	static decompress(compressed) {
		if (compressed === null) {
			return '';
		}
		if (compressed === '') {
			return null;
		}
		return LZString._decompress(compressed.length, 32768, function (index) {
			return compressed.charCodeAt(index);
		});
	}

	static _decompress(length, resetValue, getNextValue) {
		var dictionary = [];
		var enlargeIn = 4;
		var dictSize = 4;
		var numBits = 3;
		var entry = '';
		var result = [];
		var w;
		var bits; var resb; var maxpower; var power;
		var c;
		var data = {
			val: getNextValue.call(this, 0),
			position: resetValue,
			index: 1
		};

		for (let i = 0; i < 3; i += 1) {
			dictionary[i] = i;
		}

		bits = 0;
		maxpower = Math.pow(2, 2);
		power = 1;
		while (power !== maxpower) {
			resb = data.val & data.position;
			data.position >>= 1;
			if (data.position === 0) {
				data.position = resetValue;
				data.val = getNextValue.call(this, data.index++);
			}
			bits |= (resb > 0 ? 1 : 0) * power;
			power <<= 1;
		}

		switch (bits) {
		case 0:
			bits = 0;
			maxpower = Math.pow(2, 8);
			power = 1;
			while (power !== maxpower) {
				resb = data.val & data.position;
				data.position >>= 1;
				if (data.position === 0) {
					data.position = resetValue;
					data.val = getNextValue.call(this, data.index++);
				}
				bits |= (resb > 0 ? 1 : 0) * power;
				power <<= 1;
			}
			c = String.fromCharCode(bits);
			break;
		case 1:
			bits = 0;
			maxpower = Math.pow(2, 16);
			power = 1;
			while (power !== maxpower) {
				resb = data.val & data.position;
				data.position >>= 1;
				if (data.position === 0) {
					data.position = resetValue;
					data.val = getNextValue.call(this, data.index++);
				}
				bits |= (resb > 0 ? 1 : 0) * power;
				power <<= 1;
			}
			c = String.fromCharCode(bits);
			break;
		case 2:
			return '';
		}
		dictionary[3] = c;
		w = c;
		result.push(c);
		while (true) {
			if (data.index > length) {
				return '';
			}

			bits = 0;
			maxpower = Math.pow(2, numBits);
			power = 1;
			while (power !== maxpower) {
				resb = data.val & data.position;
				data.position >>= 1;
				if (data.position === 0) {
					data.position = resetValue;
					data.val = getNextValue.call(this, data.index++);
				}
				bits |= (resb > 0 ? 1 : 0) * power;
				power <<= 1;
			}

			switch ((c = bits)) {
			case 0:
				bits = 0;
				maxpower = Math.pow(2, 8);
				power = 1;
				while (power !== maxpower) {
					resb = data.val & data.position;
					data.position >>= 1;
					if (data.position === 0) {
						data.position = resetValue;
						data.val = getNextValue.call(this, data.index++);
					}
					bits |= (resb > 0 ? 1 : 0) * power;
					power <<= 1;
				}

				dictionary[dictSize++] = String.fromCharCode(bits);
				c = dictSize - 1;
				enlargeIn--;
				break;
			case 1:
				bits = 0;
				maxpower = Math.pow(2, 16);
				power = 1;
				while (power !== maxpower) {
					resb = data.val & data.position;
					data.position >>= 1;
					if (data.position === 0) {
						data.position = resetValue;
						data.val = getNextValue.call(this, data.index++);
					}
					bits |= (resb > 0 ? 1 : 0) * power;
					power <<= 1;
				}
				dictionary[dictSize++] = String.fromCharCode(bits);
				c = dictSize - 1;
				enlargeIn--;
				break;
			case 2:
				return result.join('');
			}

			if (enlargeIn === 0) {
				enlargeIn = Math.pow(2, numBits);
				numBits++;
			}

			if (dictionary[c]) {
				entry = dictionary[c];
			} else {
				if (c === dictSize) {
					entry = w + w.charAt(0);
				} else {
					return null;
				}
			}
			result.push(entry);

			// Add w+entry[0] to the dictionary.
			dictionary[dictSize++] = w + entry.charAt(0);
			enlargeIn--;

			w = entry;

			if (enlargeIn === 0) {
				enlargeIn = Math.pow(2, numBits);
				numBits++;
			}
		}
	}
}
LZString.init();
// console.log(LZString.decompressFromEncodedURIComponent(LZString.compressToEncodedURIComponent("fdsbjfnbjgnvjkdnvdkjnkgfjbnx")));
//
// if (typeof window.define === 'function' && window.define.amd) {
//	window.define(function () {
//		return LZString;
//	});
// } else if (typeof module !== 'undefined' && module !== null) {
//	module.exports = LZString;
// } else if (typeof angular !== 'undefined' && angular !== null) {
//	angular.module('LZString', [])
//		.factory('LZString', function () {
//			return LZString;
//		});
// }
