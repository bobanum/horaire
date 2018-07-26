/*jslint esnext:true, browser:true, debug:true*/
/*global Horaire, LZString*/
/**
Classe DOM permettant la manipulation et la création d'éléments
*/
class DOM {
	/**
	 * Constructeur
	 */
	constructor() {
		this._dom = null;
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
			this._dom.obj = this;
		}
		return this._dom;
	}
	dom_creer() {
		throw "La methode 'dim_creer' doit être surchargée.";
	}
	/**
	 * Retourne un élément DOM avec un certain contenu, attributs et evenements
	 * @param   {string}             name       La signature emmet de la balise "#", "." et "[]" reconnu
	 * @param   {string|HTMLElement} content    Le contenu de la balise
	 * @param   {object}             attributes	La liste des attributs. A préceance sur le name
	 * @param   {object}             events     Les événements à appliquer
	 * @returns {HTMLElement}        L'élément créé
	 */
	createElement(name, content, attributes, events) {
		var resultat, classes;
		attributes = attributes || {};
		for (let id; id = name.match(/#[a-zA-Z0-9\_\-]+/), id;) {
			attributes.id = id[0].substr(1);
			name = name.replace(id[0], '');
		}
		for (let attr; attr = name.match(/#\[s[^\]]+\]/), attr;) {
			let parts = attr.split("=");
			let k = attr.shift();
			if (attributes[k] !== undefined) {
				continue;
			}
			if (parts.length === 0) {
				attributes[k] = "";
			} else {
				attributes[k] = parts.join("=");
			}
			name = name.replace(attr[0], '');
		}
		classes = name.split('.');
		name = classes.shift();
		resultat = document.createElement(name);
		this.setAttributes(resultat, attributes);
		this.setClasses(resultat, classes);
		this.appendContent(resultat, content);
		this.addEventListeners(resultat, events);
		return resultat;
	}
	/**
	 * Créée un élément comme enfant d'un élément
	 * @param   {HTMLElement} parentNode L'élément dans lequel mettre le nouvel élément.
	 * @returns {HTMLElement} L'élément créé
	 */
	createElementIn(parentNode) {
		var args, element;
		args = Array.from(arguments).slice(1);
		element = this.createElement.apply(this, args);
		parentNode.appendChild(element);
		return element;
	}
	/**
	 * Ajoute des classes à un élément HTML
	 * @param   {object}   element L'élément HTML auquel ajouter les classes
	 * @param   {string[]} classes Un tableau de classes
	 * @returns this
	 */
	setClasses(element, classes) {
		var i, n;
		for (i = 0, n = classes.length; i < n; i += 1) {
			element.classList.add(classes[i]);
		}
		return this;
	}
	/**
	 * Règles les attributs donnés à l'objet
	 * @param   {HTMLElement} element    L'élément HTML à modifier
	 * @param   {object}      attributes Un objet contenant les attributs
	 * @returns this
	 */
	setAttributes(element, attributes) {
		var k;
		if (!attributes) {
			return this;
		}
		for (k in attributes) {
			element.setAttribute(k, attributes[k]);
		}
		return this;
	}
	/**
	 * Transfere les propriétés d'un objet à l'autre de facon récursive (ou non)
	 * @param {object}  from        L'objet qui contient les propriétés
	 * @param {object}  to          L'objet qui recoit les propriétés
	 * @param {integer} recursif=-1 Niveau de récursivité: <0|true=infini; 0|false=non récursif, remplace par l'objet eventuel; >0=nombre de fois (niveaux) ou appliquer la récursivité
	 */
	copierProps(from, to, recursif = true) {
		recursif = (recursif === false) ? 0 : (recursif === true) ? -1 : recursif;
		for (let k in from) {
			let val = from[k];
			if (typeof val !== "object") {
				to[k] = val;
			} else if (recursif === 0) {
				to[k] = val;
			} else {
				if (!to[k]) {
					to[k] = {};
				}
				this.copierProps(val, to[k], recursif - 1);
			}
		}
	}
	/**
	 * Ajoute des propriétés CSS à un élément
	 * @param   {HTMLElement} element L'élément HTML à modifier
	 * @param   {object}      props   Un objet de css {nom: valeur}
	 * @returns this
	 */
	applyStyle(element, props) {
		var k;
		if (!props) {
			return this;
		}
		for (k in props) {
			element.style[k] = props[k];
		}
		return this;
	}
	/**
	 * Ajoute un contenu à un élément
	 * @param   {HTMLElement} element L'élément à modifier
	 * @param   {Mixed}       content Le contenu à ajouter
	 * @returns this
	 */
	appendContent(element, content) {
		var i, n;
		if (!content) {
			return this;
		}
		if (content instanceof HTMLElement) {
			element.appendChild(content);
		} else if (content instanceof Array) {
			for (i = 0, n = content.length; i < n; i += 1) {
				this.appendContent(element, content[i]);
			}
		} else {
			element.innerHTML = content.toString();
		}
		return this;
	}
	/**
	 * Ajoute des événements à un objet HTML
	 * @param   {HTMLElement} element L'élément HTML à modifier
	 * @param   {object}      evts    Un objet de fonction {nomEvent: fonction}
	 * @returns this
	 */
	addEventListeners(element, evts) {
		var k;
		if (!evts) {
			return this;
		}
		for (k in evts) {
			element.addEventListener(k, evts[k]);
		}
		return this;
	}
	/**
	 * Retourne le champ final (div) incluant label et le champ
	 * @param   {HTMLElement} field Le champ à envelopper
	 * @param   {string}      label Le label à apposer au champ
	 * @returns {HTMLElement} Le div.champ
	 */
	form_wrap(field, label) {
		var champ, i, n;
		champ = this.createElement('div.champ');
		if (label !== undefined) {
			champ.appendChild(this.createElement('label', label, {'for': field.getAttribute('id')}));
		}
		if (field instanceof Array) {
			for (i = 0, n = field.length; i < n; i += 1) {
				champ.appendChild(this.createElement('span', field[i]));
			}
		} else {
			champ.appendChild(this.createElement('span', field));
		}
		return champ;
	}
	/**
	 * Ajoute un élément style dans le head pour gérer les nouvelles règles
	 * @returns this
	 */
	static initStylesheet() {
		var stylesheet = document.head.appendChild(document.createElement("style"));
		stylesheet.setAttribute("data-objet", this.name);
		stylesheet.appendChild(document.createTextNode(''));
		return stylesheet.sheet;
	}
	/**
	 * Règle les propriété de classe et les événements
	 */
	static init() {
		["createElement", "createElementIn", "setClasses", "setAttributes",
		 "copierProps", "applyStyle", "appendContent", "addEventListeners"]
			.forEach(m=>this[m]=this.prototype[m]);
	}
}
DOM.init();

/**
Classe App gérant l'application
*/
class App {
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
		//		DOM.createElementIn(div, "input", null, {"type": "button", "value":"Array"}, this.evt.btn_array);
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
	static ajouterScript(url) {
		var resultat = document.createElement("script");
		if (url.slice(-3) !== ".js") {
			url += ".js";
		}
		resultat.setAttribute("src", this.url_script(url));
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
	static loadJson(url, callback, thisArg) {
		thisArg = thisArg || this;
		var xhr = new XMLHttpRequest();
		xhr.open("get", url);
		xhr.obj = thisArg;
		xhr.responseType = "json";
		xhr.addEventListener("load", function () {
			callback.call(thisArg, this.response, this);
		});
		xhr.send(null);
		return xhr;
	}
	/**
	 * Event onload de l'application
	 */
	static load() {
		if (this.json) {
			this.horaire = Horaire.fromArray(this.json);
		} else {
			this.horaire = new Horaire();
		}
		this.afficher(this.horaire);
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
		var resultat = this.path.app;
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
	 * Définit les adresse du script et de la page. Est appelé par le init.
	 */
	static setPaths() {
		var dossierPage = window.location.href.split("/").slice(0, -1);
		this.path = {};
		this.toString = ()=>this.app;
		this.path.page = dossierPage.join("/");
		var src = document.head.lastChild.getAttribute("src").split("/").slice(0, -1);
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
					ta.innerHTML = "";
					resultat = this.form.obj.horaire.toArray(true);
					ta.innerHTML += "(" + resultat.length + ") " + resultat + "\n----\n";
					resultat = App.encoder(resultat);
					ta.innerHTML += "(" + resultat.length + ") " + resultat + "\n----\n";
					resultat = this.form.obj.horaire.toJson(true);
					ta.innerHTML += "(" + resultat.length + ") " + resultat + "\n----\n";
					resultat = App.encoder(resultat);
					ta.innerHTML += "(" + resultat.length + ") " + resultat + "\n----\n";
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
		this.setPaths();
		this.setEvents();
		if (location.href.match(/edition\.html/)) {
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
		window.addEventListener("load", function() {
			App.load();
		});
		this.ajouterLink("horaire", "all");
		this.ajouterScript("lz-string");
		this.ajouterScript("Horaire");
		this.ajouterScript("Plage");
		this.data = {};
		return;
	}
}
App.init();
