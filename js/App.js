import Schedule from "./Schedule.js";
import LZString from "./LZString.js";
/**
Classe App gérant l'application
*/
export default class App {
	static afficher(horaire) {
		if (this.mode === this.MODE_EDITION) {
			this.DOM.interface(horaire.dom)
		} else {
			document.body.appendChild(horaire.dom);
		}
		return this;
	}
	static DOM = {
		panneau: (content) => {
			const result = document.createElement("section");
			result.classList.add("panneau");
			if (content) {
				result.appendChild(content);
			}
			return result;
		},
		options: () => {
			const result = document.createElement("div");
			result.id = "options";
			result.appendChild(this.horaire.DOM.FORM.main());
			return result;
		},
		status: () => {
			const result = document.createElement("div");
			result.id = "status";
			const form = document.createElement("form");
			result.appendChild(form);
			form.obj = this;
			form.appendChild(this.DOM.status_options());
			form.appendChild(this.DOM.code());
			//		form.appendChild(this.htmlIframe());
			return result;
		},
		header: () => {
			const result = document.createElement("header");
			const h1 = document.createElement("h1");
			const img = document.createElement("img");
			img.src = "images/logo.svg";
			h1.appendChild(img);
			h1.appendChild(document.createTextNode("La maison des horaires"));
			result.appendChild(h1);
			return result;
		},
		footer: () => {
			const result = document.createElement("footer");
			const p = document.createElement("p");
			p.innerHTML = "&copy;";
			result.appendChild(p);
			result.style.gridArea = "footer";
			return result;
		},

		interface: (content) => {
			const main = document.querySelector(".interface > main");
			main.appendChild(this.DOM.panneau(document.createElement("div"))).style.gridArea = "preview";
			main.appendChild(this.DOM.panneau(this.DOM.options())).style.gridArea = "options";
			main.appendChild(this.DOM.panneau(this.DOM.status())).style.gridArea = "status";
			return main;
		},
		status_options: () => {
			const result = document.createElement("div");
			result.classList.add("boutons");
			result.appendChild(this.DOM.resultsButtons());
			const div = document.createElement("div");
			div.classList.add("output");
			result.appendChild(div);

			div.appendChild(this.DOM.svgButton('json', this.evt.btn_json));
			div.appendChild(this.DOM.svgButton('array', this.evt.btn_array));
			div.appendChild(this.DOM.svgButton('zip', this.evt.btn_arraycompresse));
			div.appendChild(this.DOM.svgButton('url', this.evt.btn_adresse));
			div.appendChild(this.DOM.svgButton('link', this.evt.btn_lien));
			div.appendChild(this.DOM.svgButton('iframe', this.evt.btn_iframe));
			return result;
		},
		resultsButtons: () => {
			const result = document.createElement("div");
			result.classList.add("results");
			result.appendChild(this.DOM.svgButton('visionner', this.evt.btn_visionner));
			result.appendChild(this.DOM.svgButton('pagesimple2', this.evt.btn_imprimer));
			result.appendChild(this.DOM.svgButton('tetebeche', this.evt.btn_tetebeche));
			result.appendChild(this.DOM.svgButton('quatre', this.evt.btn_quatre));
			result.appendChild(this.DOM.svgButton('six', this.evt.btn_six));
			result.appendChild(this.DOM.svgButton('neuf', this.evt.btn_neuf));
			return result;
		},
		code: () => {
			const result = document.createElement("textarea");
			result.id = "code";
			result.setAttribute("cols", "60");
			result.setAttribute("rows", "3");
			result.setAttribute("placeholder", "Code (Cliquez sur un bouton ci-dessus pour mettre à jour)");
			result.addEventListener("click", this.evt.code);
			return result;
		},
		svgButton: (icon, evt) => {
			const result = document.createElement("button");
			result.classList.add("icon");
			result.setAttribute("type", "button");
			result.addEventListener("click", evt);
			const svg = result.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
			const use = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "use"));
			use.setAttribute("href", "img/icons.svg#" + icon);
			return result;
		},
	};
	static ajouterBoutonPage(conteneur, icon, evt) {
		const contenu = this.DOM.svgButton(icon, evt);
		const btn = document.createElement("button");
		btn.appendChild(contenu);
		btn.classList.add("icon");
		btn.setAttribute("type", "button");
		btn.addEventListener("click", evt);
		conteneur.appendChild(btn);
		return btn;
	}
	/**
	 * Ajoute un élément script pointant vers l'URL donnée
	 * @param   {string}  url Le chemin vers le fichier script
	 * @returns {Promise} Une promesse résolue après le chargement du script
	 */
	static ajouterScript(url, module = true) {
		return new Promise(resolve => {
			var script = document.createElement("script");
			if (url.slice(-3) !== ".js") {
				url += ".js";
			}
			script.setAttribute("src", this.url_script(url));
			if (module) {
				script.setAttribute("type", "module");
			}
			script.addEventListener("load", resolve);
			document.head.appendChild(script);
		});
	}
	/**
	 * Ajoute une balise link pointant vers l'URL donnée
	 * @param   {string}      url   Le chemin ver le fichier script
	 * @param   {string}      media La valeur de l'attribut media (optionnel)
	 * @returns {HTMLElement} L'élément link créé
	 */
	static ajouterLink(url, media) {
		var result = document.createElement("link");
		result.setAttribute("rel", "stylesheet");
		if (media) {
			result.setAttribute("media", media);
		}
		if (url.slice(-4) !== ".css") {
			url += ".css";
		}
		result.setAttribute("href", this.url_css(url));
		document.head.appendChild(result);
		return result;
	}
	/**
	 * Callback appelé lors de la récupération d'un json
	 * @callback loadJsonCallback
	 * @param {object} json	Le json recu
	 * @param {object} xhr	L'objet xhr utilisé pour l'appel (au cas où)
	 */
	/**
	 * Charge un fichier json et execute le callback avec le résultat
	 * @param   {string}           url            L'url enant au fichier
	 * @param   {loadJsonCallback} callback       La fonction a appeler lorsque le json est récupéré
	 * @param   {object}           [thisArg=this] L'objet représenté par this dans le callback
	 * @returns {XMLHttpRequest}   L'objet xhr utilisé pour la récupération
	 */
	static loadJson(url) {
		var result;
		if (url instanceof Array) {
			result = Promise.all(url.map(u => this.loadJson(u)));
		} else {
			result = new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open("get", url);
				xhr.responseType = "json";
				xhr.addEventListener("load", function () {
					resolve(this.response);
				});
				xhr.addEventListener("error", function () {
					reject(this);
				});
				xhr.send(null);
			});
		}
		return result;
	}
	/**
	 * Event onload de l'application
	 */
	static load() {
		// console.log("loadApp");
		return Promise.resolve();
		//		if (this.json) {
		//			this.horaire = Horaire.fromArray(this.json);
		//		} else {
		//			this.horaire = new Horaire();
		//		}
		//		this.afficher(this.horaire);
	}
	/**
	 * Retourne la version encodée et compressée de la chaine donnée
	 * @param   {string|object} str La chaine ou l'objet à encoder
	 * @returns {string}           Une chaine LZW
	 */
	static encoder(str) {
		if (typeof str === "string") {
			return LZString.compressToEncodedURIComponent(str);
		} else if (str.toString) {
			return this.encoder(str.toString());
		} else {
			return this.encoder(JSON.stringify(str));
		}
	}
	static saveHoraire(horaire) {
		var horaires = window.localStorage.json_horaires || "{}";
		horaires = JSON.parse(horaires);
		horaires[horaire.titre] = horaire.base64;
		window.localStorage.json_horaires = JSON.stringify(horaires);
	}
	static loadHoraire(titre) {
		var horaires = window.localStorage.json_horaires || "{}";
		horaires = JSON.parse(horaires);
		var result = horaires[this.titre];
		result = Schedule.fromBase64(result);
		return result;
	}
	/**
	 * Retourne une chaine LZW décompressée (ou un objet json correspondant)
	 * @param   {string} str La chaine compressée
	 * @returns {string} L'objet ou la chaine décompressée
	 */
	static decoder(str) {
		var result = LZString.decompressFromEncodedURIComponent(str);
		if (typeof result === "string") {
			try {
				return JSON.parse(result);
			} catch (e) {
				return result;
			}
		}
	}
	/**
	 * Retourne le url absolu d'un fichier relatif à la racine de l'application
	 * @param   {string} fic Le fichier à pointer
	 * @returns {string} Un url absolu
	 */
	static url_app(fic) {
		//		var result = this.path.app;
		var result = ".";
		if (fic) {
			return result + "/" + fic;
		}
		return result;
	}
	/**
	 * Retourne le url absolu d'un fichier relatif à la page ayant intégré le script App.js
	 * @param   {string} fic Le fichier à pointer
	 * @returns {string} Un url absolu
	 */
	static url_page(fic) {
		var result = this.path.page;
		if (fic) {
			return result + "/" + fic;
		}
		return result;
	}
	/**
	 * Retourne le url absolu d'un fichier relatif à l'emplacement du script App.js
	 * @param   {string} fic Le fichier à pointer
	 * @returns {string} Un url absolu
	 */
	static url_script(fic) {
		var result = this.url_app("js");
		if (fic) {
			result += "/" + fic;
		}
		return result;
	}
	/**
	 * Retourne le url absolu d'un fichier relatif à l'emplacement du script App.js
	 * @param   {string} fic Le fichier à pointer
	 * @returns {string} Un url absolu
	 */
	static url_css(fic) {
		var result = this.url_app("css");
		if (fic) {
			result += "/" + fic;
		}
		return result;
	}
	/**
	 * Retourne un objet générique contenant les données d'une adresse donnée ou de l'adresse de la page
	 * @param   {string} url L'adresse à analyser
	 * @returns {object} Un objet des données
	 */
	static search_parse(url) {
		var result, donnees;
		url = url || location.search;
		url = url.split("?").slice(1).join("?");
		result = {};
		if (!url) {
			return result;
		}
		donnees = url.split("&");
		donnees.forEach((d) => {
			var parts = d.split("=");
			result[parts[0]] = parts.slice(1).join("=");
		});
		return result;
	}
	/**
	 * Retourne une url contenant les données fournies
	 * @param   {object} obj Un objet générique des données à afficher
	 * @param   {string} url = "" Une URL optionnelle à placer devant les données
	 * @returns {string} L'url désirée
	 */
	static search_stringify(obj, url = "") {
		var result = [];
		if (url === ".") {
			url = location.origin + location.pathname;
		}
		for (let k in obj) {
			if (obj[k] === "") {
				result.push(k);
			} else {
				result.push(k + "=" + obj[k]);
			}
		}
		result = result.join("&");
		if (result === "") {
			return url;
		} else {
			return url + "?" + result;
		}
	}
	/**
	 * Définit les adresse du script et de la page. Est appelé par le init.
	 */
	static setPaths() {
		var dossierPage = window.location.href.split("/").slice(0, -1);
		this.path = {};
		this.toString = () => this.app;
		this.path.page = dossierPage.join("/");
		var src = document.head.lastElementChild.getAttribute("src").split("/").slice(0, -1);
		if (src.length === 0 || !src[0].startsWith("http")) {
			src = dossierPage.concat(src).filter(x => x !== ".");
			let idx;
			while (idx = src.indexOf(".."), idx > -1) {
				src.splice(idx - 1, 2);
			}
		}
		this.path.app = src.slice(0, -1).join("/");
		//		this.path.script = src.join("/");
	}
	static setEvents() {
		this.evt = {
			btn_array: {
				click: function () {
					var result, ta;
					result = this.form.obj.horaire.toArray(true);
					ta = document.getElementById("code");
					ta.innerHTML = result;
					ta.select();
				}
			},
			btn_arraycompresse: {
				click: function () {
					var result, ta;
					ta = document.getElementById("code");
					//					ta.innerHTML = "";
					result = this.form.obj.horaire.toArray(true);
					//					result = this.form.obj.horaire.toJson(true);
					result = App.encoder(result);
					ta.innerHTML = result;
					ta.select();
				}
			},
			btn_json: {
				click: function (e) {
					var result, ta;
					if (e.shiftKey) {
						ta = document.getElementById("code");
						result = JSON.parse(ta.value);
						result = this.Horaire.fromJson(result);
						result = result.toUrl();
						result = result.replace("index.html", "edition.html");
						window.location = result;
					} else {
						result = this.form.obj.horaire.toJson(true);
						ta = document.getElementById("code");
						ta.innerHTML = result;
						ta.select();
					}
				}
			},
			btn_jsoncompresse: {
				click: function () {
					var result, ta;
					result = this.form.obj.horaire.toJson(true);
					ta = document.getElementById("code");
					ta.innerHTML = App.encoder(result);
					ta.innerHTML = "App.encoder(result)";
					ta.select();
				}
			},
			btn_adresse: {
				click: function () {
					var result, ta;
					result = this.form.obj.horaire.toUrl();
					ta = document.getElementById("code");
					ta.innerHTML = result;
					ta.select();
				}
			},
			btn_lien: {
				click: function () {
					var result, ta;
					result = this.form.obj.horaire.html_lien();
					ta = document.getElementById("code");
					ta.innerHTML = result;
					ta.select();
				}
			},
			btn_iframe: {
				click: function () {
					var result, ta;
					result = this.form.obj.horaire.html_iframe();
					ta = document.getElementById("code");
					ta.innerHTML = result;
					ta.select();
				}
			},
			btn_visionner: {
				click: function () {
					var result;
					result = this.form.obj.horaire.toUrl();
					window.open(result);
				}
			},
			btn_imprimer: {
				click: function () {
					var result;
					result = this.form.obj.horaire.toUrl();
					result = result.replace("?", "?page&");
					window.open(result);
				}
			},
			btn_tetebeche: {
				click: function () {
					var result;
					result = this.form.obj.horaire.toUrl();
					result = result.replace("?", "?tetebeche&");
					window.open(result);
				}
			},
			btn_quatre: {
				click: function () {
					var result;
					result = this.form.obj.horaire.toUrl();
					result = result.replace("?", "?quatre&");
					window.open(result);
				}
			},
			btn_six: {
				click: function () {
					var result;
					result = this.form.obj.horaire.toUrl();
					result = result.replace("?", "?six&");
					window.open(result);
				}
			},
			btn_neuf: {
				click: function () {
					var result;
					result = this.form.obj.horaire.toUrl();
					result = result.replace("?", "?neuf&");
					window.open(result);
				}
			},
		};
	}
	static loadPage(url) {
		window.addEventListener("load", function () {
			document.body.parentNode.classList.remove("affichage");
			document.body.parentNode.classList.add("impression");
			document.body.parentNode.classList.add("pagesimple");
			var page = document.body.appendChild(document.createElement("div"));
			page.classList.add("page");
			var iframe = page.appendChild(document.createElement("iframe"));
			iframe.setAttribute("src", url);
		});
	}
	static loadTetebeche(url) {
		window.addEventListener("load", function () {
			document.body.parentNode.classList.remove("affichage");
			document.body.parentNode.classList.add("impression");
			document.body.parentNode.classList.add("tetebeche");
			var page = document.body.appendChild(document.createElement("div"));
			page.classList.add("page");
			var iframe = page.appendChild(document.createElement("iframe"));
			iframe.setAttribute("src", url);
			page.appendChild(iframe.cloneNode(true));
		});
	}
	static loadQuatre(url) {
		window.addEventListener("load", function () {
			document.body.parentNode.classList.remove("affichage");
			document.body.parentNode.classList.add("impression");
			document.body.parentNode.classList.add("quatre");
			var page = document.body.appendChild(document.createElement("div"));
			page.classList.add("page");
			var iframe = page.appendChild(document.createElement("iframe"));
			iframe.setAttribute("src", url);
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
		});
	}
	static loadSix(url) {
		window.addEventListener("load", function () {
			document.body.parentNode.classList.remove("affichage");
			document.body.parentNode.classList.add("impression");
			document.body.parentNode.classList.add("six");
			var page = document.body.appendChild(document.createElement("div"));
			page.classList.add("page");
			var iframe = page.appendChild(document.createElement("iframe"));
			iframe.setAttribute("src", url);
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
		});
	}
	static loadNeuf(url) {
		window.addEventListener("load", function () {
			document.body.parentNode.classList.remove("affichage");
			document.body.parentNode.classList.add("impression");
			document.body.parentNode.classList.add("neuf");
			var page = document.body.appendChild(document.createElement("div"));
			page.classList.add("page");
			var iframe = page.appendChild(document.createElement("iframe"));
			iframe.setAttribute("src", url);
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
			page.appendChild(iframe.cloneNode(true));
		});
	}
	/**
	 * Initialise les variables statiques et evenements. Analyse l'adresse pour les propriétés de l'horaire.
	 */
	static init() {
		this.MODE_AFFICHAGE = 0;
		this.MODE_EDITION = 1;
		this.MODE_IMPRESSION = 2;
		this.MODE_FRAME = 3;
		var data;
		this.ajouterLink("horaire", "all");
		data = this.search_parse(location.href);
		if (location.href.match(/edition\.html/) || data.edition !== undefined) {
			this.mode = this.MODE_EDITION;
			document.documentElement.classList.add("edition");
		} else if (location.href.match(/impression\.html/)) {
			this.mode = this.MODE_IMPRESSION;
			document.documentElement.classList.add("impression");
		} else if (window.self !== window.top) {
			this.mode = this.MODE_FRAME;
			document.documentElement.classList.add("frame");
		} else {
			this.mode = this.MODE_AFFICHAGE;
			document.documentElement.classList.add("affichage");
		}
		if (data.tetebeche !== undefined) {
			delete data.tetebeche;
			this.loadTetebeche(App.search_stringify(data, "."));
			return;
		}
		if (data.page !== undefined) {
			delete data.page;
			this.loadPage(App.search_stringify(data, "."));
			return;
		}
		if (data.quatre !== undefined) {
			delete data.quatre;
			this.loadQuatre(App.search_stringify(data, "."));
			return;
		}
		if (data.six !== undefined) {
			delete data.six;
			this.loadSix(App.search_stringify(data, "."));
			return;
		}
		if (data.neuf !== undefined) {
			delete data.neuf;
			this.loadNeuf(App.search_stringify(data, "."));
			return;
		}
		if (data.h) {
			//Si on a des données dans l'adresse, on met dans localstorage 
			//et on redirige lors de l'édition.
			App.json_horaire = data.h;
			if (data.edition !== undefined) {
				window.localStorage.json_horaire = data.h;
				delete data.h;
				window.location.href = App.search_stringify(data, ".");
				return;
			}
		} else if (window.localStorage.json_horaire) {
			App.json_horaire = window.localStorage.json_horaire;
		} else {
			delete window.localStorage.json_horaire;
		}
		this.setEvents();
		Promise.all([
			new Promise(resolve => window.addEventListener("load", resolve)),
		]).then(() => {
			return App.load();
		}).then(() => {
			return Schedule.load();
		}).then(() => {
			// console.log("fini");
		});
		this.data = {};
		return;
	}
}
App.init();
