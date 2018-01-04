/*jslint esnext:true, browser:true, debug:true*/
class Lzw {
	constructor() {

	}
	static init() {

	}
	static encode(s) {
		var dict, data, out, currChar, phrase, code, i, n;
		dict = {};
		data = (s + "").split("");
		out = [];
		phrase = data[0];
		code = 256;
		for (i = 1, n = data.length; i < n; i += 1) {
			currChar=data[i];
			if (dict[phrase + currChar] !== null) {
				phrase += currChar;
			} else {
				out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
				dict[phrase + currChar] = code;
				code += 1;
				phrase=currChar;
			}
		}
		out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
		for (i = 0, n = out.length; i < n; i += 1) {
			out[i] = String.fromCharCode(out[i]);
		}
		return out.join("");
	}
	// Decompress an LZW-encoded string
	static decode(s) {
		var dict = {};
		var data = (s + "").split("");
		var currChar = data[0];
		var oldPhrase = currChar;
		var out = [currChar];
		var code = 256;
		var phrase;
		for (var i=1; i<data.length; i += 1) {
			var currCode = data[i].charCodeAt(0);
			if (currCode < 256) {
				phrase = data[i];
			} else {
				phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
			}
			out.push(phrase);
			currChar = phrase.charAt(0);
			dict[code] = oldPhrase + currChar;
			code += 1;
			oldPhrase = phrase;
		}
		return out.join("");
	}
}
Lzw.init();
