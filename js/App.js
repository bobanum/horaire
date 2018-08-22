/*jslint esnext:true, browser:true, debug:true*/
import DOM from "./DOM.js";
import Horaire from "./Horaire.js";
import LZString from "./LZString.js";
/**
Classe App gérant l'application
*/
export default class App {
	static afficher(horaire) {
		if (this.mode === this.MODE_EDITION) {
			document.body.appendChild(this.dom_interface(horaire.dom));
		} else {
			document.body.appendChild(horaire.dom);
		}
		return this;
	}
	static dom_interface(contenu) {
		var resultat, panneau;
		resultat = DOM.createElement("div.interface");
		panneau = resultat.appendChild(DOM.createElement("header", "<h1><img src=\"images/logo.svg\"/>La maison des horaires</h1>"));
		panneau.style.gridArea = "h";
		panneau = resultat.appendChild(DOM.createElement("footer", "<p>&copy;</p>"));
		panneau.style.gridArea = "f";
		panneau = this.dom_panneau(contenu, resultat);
		panneau.style.gridArea = "g";
		panneau = this.dom_panneau(this.dom_options(), resultat);
		panneau.style.gridArea = "o";
		panneau = this.dom_panneau(this.dom_status(), resultat);
		panneau.style.gridArea = "c";
		return resultat;
	}
	static dom_panneau(contenu, conteneur) {
		var resultat;
		resultat = DOM.createElement("section.panneau");
		if (conteneur) {
			conteneur.appendChild(resultat);
		}
		if (contenu) {
			resultat.appendChild(contenu);
		}
		return resultat;
	}
	static dom_options() {
		var resultat;
		resultat = DOM.createElement("div#options", this.horaire.dom_form());
		return resultat;
	}
	static dom_status() {
		var resultat, form;
		resultat = DOM.createElement("div#status");
		form = DOM.createElementIn(resultat, "form");
		form.obj = this;
		form.appendChild(this.dom_status_options());
		form.appendChild(this.dom_code());
		//		form.appendChild(this.htmlIframe());
		return resultat;
	}
	static dom_status_options() {
		var resultat, div;
		resultat = DOM.createElement("div.boutons");
		div = DOM.createElementIn(resultat, "div");
		DOM.createElementIn(div, "input", null, {
			"type": "button",
			"value": "JSON"
		}, this.evt.btn_json);
		//		DOM.createElementIn(div, "input", null, {"type": "button", "value":"JSON Compressé"}, this.evt.btn_jsoncompresse);
		DOM.createElementIn(div, "input", null, {
			"type": "button",
			"value":"Array"
		}, this.evt.btn_array);
		DOM.createElementIn(div, "input", null, {
			"type": "button",
			"value": "Compressé"
		}, this.evt.btn_arraycompresse);
		DOM.createElementIn(div, "input", null, {
			"type": "button",
			"value": "Adresse"
		}, this.evt.btn_adresse);
		DOM.createElementIn(div, "input", null, {
			"type": "button",
			"value": "Lien"
		}, this.evt.btn_lien);
		DOM.createElementIn(div, "input", null, {
			"type": "button",
			"value": "iFrame"
		}, this.evt.btn_iframe);
		div = DOM.createElementIn(resultat, "div");
		DOM.createElementIn(div, "input", null, {
			"type": "button",
			"value": "Visionner"
		}, this.evt.btn_visionner);
		return resultat;
	}
	static dom_code() {
		var resultat = DOM.createElement("textarea#code", null, {
			"cols": "60",
			rows: "10",
			"placeholder": "Code (Cliquez sur un bouton ci-dessus pour mettre à jour)"
		}, this.evt.code);
		resultat.horaire = this;
		return resultat;
	}
	/**
	 * Ajoute un élément script pointant vers l'URL donnée
	 * @param   {string}      url Le chemin ver le fichier script
	 * @returns {HTMLElement} L'élément script créé
	 */
	static ajouterScript(url, module = true) {
		var resultat = document.createElement("script");
		if (url.slice(-3) !== ".js") {
			url += ".js";
		}
		resultat.setAttribute("src", this.url_script(url));
		if (module) {
			resultat.setAttribute("type", "module");
		}
		document.head.appendChild(resultat);
		return resultat;
	}
	/**
	 * Ajoute une balise link pointant vers l'URL donnée
	 * @param   {string}      url   Le chemin ver le fichier script
	 * @param   {string}      media La valeur de l'attribut media (optionnel)
	 * @returns {HTMLElement} L'élément link créé
	 */
	static ajouterLink(url, media) {
		var resultat = document.createElement("link");
		resultat.setAttribute("rel", "stylesheet");
		if (media) {
			resultat.setAttribute("media", media);
		}
		if (url.slice(-4) !== ".css") {
			url += ".css";
		}
		resultat.setAttribute("href", this.url_css(url));
		document.head.appendChild(resultat);
		return resultat;
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
		var resultat;
		if (url instanceof Array) {
			resultat = Promise.all(url.map(u=>this.loadJson(u)));
		} else {
			resultat = new Promise(function (resolve, reject) {
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
		return resultat;
	}
	/**
	 * Event onload de l'application
	 */
	static load() {
		console.log("loadApp");
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
	/**
	 * Retourne une chaine LZW décompressée (ou un objet json correspondant)
	 * @param   {string} str La chaine compressée
	 * @returns {string} L'objet ou la chaine décompressée
	 */
	static decoder(str) {
		var resultat = LZString.decompressFromEncodedURIComponent(str);
		if (typeof resultat === "string") {
			try {
				return JSON.parse(resultat);
			} catch (e) {
				return resultat;
			}
		}
	}
	/**
	 * Retourne le url absolu d'un fichier relatif à la racine de l'application
	 * @param   {string} fic Le fichier à pointer
	 * @returns {string} Un url absolu
	 */
	static url_app(fic) {
//		var resultat = this.path.app;
		var resultat = ".";
		if (fic) {
			return resultat + "/" + fic;
		}
		return resultat;
	}
	/**
	 * Retourne le url absolu d'un fichier relatif à la page ayant intégré le script App.js
	 * @param   {string} fic Le fichier à pointer
	 * @returns {string} Un url absolu
	 */
	static url_page(fic) {
		var resultat = this.path.page;
		if (fic) {
			return resultat + "/" + fic;
		}
		return resultat;
	}
	/**
	 * Retourne le url absolu d'un fichier relatif à l'emplacement du script App.js
	 * @param   {string} fic Le fichier à pointer
	 * @returns {string} Un url absolu
	 */
	static url_script(fic) {
		var resultat = this.url_app("js");
		if (fic) {
			resultat += "/" + fic;
		}
		return resultat;
	}
	/**
	 * Retourne le url absolu d'un fichier relatif à l'emplacement du script App.js
	 * @param   {string} fic Le fichier à pointer
	 * @returns {string} Un url absolu
	 */
	static url_css(fic) {
		var resultat = this.url_app("css");
		if (fic) {
			resultat += "/" + fic;
		}
		return resultat;
	}
	/**
	 * Retourne un objet générique contenant les données d'une adresse donnée ou de l'adresse de la page
	 * @param   {string} url L'adresse à analyser
	 * @returns {object} Un objet des données
	 */
	static search_parse(url) {
		var resultat, donnees;
		url = url || location.search;
		url = url.split("?").slice(1).join("?");
		if (!url) {
			return resultat;
		}
		donnees = url.split("&");
		resultat = {};
		donnees.forEach((d) => {
			var parts = d.split("=");
			resultat[parts[0]] = parts.slice(1).join("=");
		});
		return resultat;
	}
	/**
	 * Retourne une url contenant les données fournies
	 * @param   {object} obj Un objet générique des données à afficher
	 * @param   {string} url = "" Une URL optionnelle à placer devant les données
	 * @returns {string} L'url désirée
	 */
	static search_stringify(obj, url = "") {
		var resultat = [];
		for (let k in obj) {
			if (obj[k] === "") {
				resultat.push(k);
			} else {
				resultat.push(k + "=" + obj[k]);
			}
		}
		resultat = resultat.join("&");
		if (resultat === "") {
			return url;
		} else {
			return url + "?" + resultat;
		}
	}
	/**
	 * Définit les adresse du script et de la page. Est appelé par le init.
	 */
	static setPaths() {
		var dossierPage = window.location.href.split("/").slice(0, -1);
		this.path = {};
		this.toString = ()=>this.app;
		this.path.page = dossierPage.join("/");
		var src = document.head.lastElementChild.getAttribute("src").split("/").slice(0, -1);
		if (src.length === 0 || !src[0].startsWith("http")) {
			src = dossierPage.concat(src).filter(x => x !== ".");
			let idx;
			while (idx = src.indexOf(".."), idx > -1) {
				src.splice(idx - 1, 2);
			}
		}
		this.path.app = src.slice(0,-1).join("/");
//		this.path.script = src.join("/");
	}
	static setEvents() {
		this.evt = {
			btn_array: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.horaire.toArray(true);
					ta = document.getElementById("code");
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_arraycompresse: {
				click: function () {
					var resultat, ta;
					ta = document.getElementById("code");
//					ta.innerHTML = "";
					resultat = this.form.obj.horaire.toArray(true);
//					resultat = this.form.obj.horaire.toJson(true);
					resultat = App.encoder(resultat);
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_json: {
				click: function (e) {
					var resultat, ta;
					if (e.shiftKey) {
						ta = document.getElementById("code");
						resultat = JSON.parse(ta.value);
						resultat = Horaire.fromJson(resultat);
						resultat = resultat.toUrl();
						resultat = resultat.replace("index.html", "edition.html");
						window.location = resultat;
					} else {
						resultat = this.form.obj.horaire.toJson(true);
						ta = document.getElementById("code");
						ta.innerHTML = resultat;
						ta.select();
					}
				}
			},
			btn_jsoncompresse: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.horaire.toJson(true);
					ta = document.getElementById("code");
					ta.innerHTML = App.encoder(resultat);
					ta.innerHTML = "App.encoder(resultat)";
					ta.select();
				}
			},
			btn_adresse: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.horaire.toUrl();
					ta = document.getElementById("code");
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_lien: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.horaire.html_lien();
					ta = document.getElementById("code");
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_iframe: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.horaire.html_iframe();
					ta = document.getElementById("code");
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_visionner: {
				click: function () {
					var resultat;
					resultat = this.form.obj.horaire.toUrl();
					window.open(resultat);
				}
			}
		};
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
		data = App.search_parse(location.href);
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
		if (data.h) {
			window.localStorage.json_horaire = data.h;
			delete data.h;
			if (data.edition !== undefined) {
				window.location.href = App.search_stringify(data, location.origin + location.pathname);
			}
		}
//		this.setPaths();
		this.setEvents();
		window.addEventListener("load", function() {
			App.load();
		});
		this.ajouterLink("horaire", "all");
//		this.ajouterScript("lz-string");
//		this.ajouterScript("Horaire");
//		this.ajouterScript("Plage");
		this.data = {};
		return;
	}
}
App.init();
