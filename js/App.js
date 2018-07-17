/*jslint esnext:true, browser:true, debug:true*/
/*global Horaire, LZString*/
/*
Classe DOM permettant la manipulation et la création d'éléments
*/
class DOM {
	constructor() {

	}
	init() {

	}
	static init() {

	}
	static createElement(name, content, attributes, events) {
		var resultat, id, classes;
		attributes = attributes || {};
		id = name.match(/#[a-zA-Z0-9\_\-]+/);
		if (id) {
			attributes.id = id[0].substr(1);
			name = name.replace(id[0], '');
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
	createElement() {
		return DOM.createElement.apply(this, arguments);
	}
	static createElementIn(parentNode) {
		var args, element;
		args = Array.prototype.slice.call(arguments, 1);
		element = this.createElement.apply(this, args);
		parentNode.appendChild(element);
		return element;
	}
	createElementIn() {
		return DOM.createElementIn.apply(this, arguments);
	}
	static setClasses(element, classes) {
		var i, n;
		for (i = 0, n = classes.length; i < n; i += 1) {
			element.classList.add(classes[i]);
		}
		return this;
	}
	setClasses() {
		return DOM.setClasses.apply(this, arguments);
	}
	static setAttributes(element, attributes) {
		var k;
		if (!attributes) {
			return this;
		}
		for (k in attributes) {
			element.setAttribute(k, attributes[k]);
		}
		return this;
	}
	setAttributes() {
		return DOM.setAttributes.apply(this, arguments);
	}
	static applyStyle(element, props) {
		var k;
		if (!props) {
			return this;
		}
		for (k in props) {
			element.style[k] = props[k];
		}
		return this;
	}
	applyStyle() {
		return DOM.applyStyle.apply(this, arguments);
	}
	static appendContent(element, content) {
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
	appendContent() {
		return DOM.appendContent.apply(this, arguments);
	}
	static addEventListeners(element, evts) {
		var k;
		if (!evts) {
			return this;
		}
		for (k in evts) {
			element.addEventListener(k, evts[k]);
		}
		return this;
	}
	addEventListeners() {
		return DOM.addEventListeners.apply(this, arguments);
	}
	applyProperties(props) {
		return this.constructor.applyProperties(this, props);
	}
	static applyProperties(obj, props) {
		var p;
		if (!props) {
			return obj;
		}
		for (p in props) {
			obj[p] = props[p];
		}
		return obj;
	}
	static form_wrap(field, l) {
		var champ, i, n;
		champ = this.createElement('div.champ');
		if (l !== undefined) {
			champ.appendChild(this.createElement('label', l, {'for': field.getAttribute('id')}));
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
	form_wrap() {
		return DOM.form_wrap.apply(this, arguments);
	}
}
DOM.init();

/*
Classe App gérant l'application
*/
class App {
	static ajouterScript(url) {
		var resultat = document.createElement("script");
		resultat.setAttribute("src", this.urlScript(url + ".js"));
		document.head.appendChild(resultat);
		return resultat;
	}
	static ajouterLink(url, media) {
		var resultat = document.createElement("link");
		resultat.setAttribute("rel", "stylesheet");
		if (media) {
			resultat.setAttribute("media", media);
		}
		resultat.setAttribute("href", this.urlPage("css/" + url + ".css"));
		document.head.appendChild(resultat);
		return resultat;
	}
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
	static load() {
		if (window.json) {
			this.horaire = Horaire.fromArray(window.json);
		} else {
			this.horaire = new Horaire();
		}
		this.horaire.afficher();
	}
	static encoder(str) {
		return LZString.compressToEncodedURIComponent(str);
		//		var resultat = str;
		//		resultat = Lzw.encode(resultat);
		//		resultat = encodeURIComponent(resultat);
		//		resultat = unescape(resultat);
		//		resultat = btoa(resultat);
		//		resultat = resultat.replace(/=/g,"").replace(/\+/g, "-").replace(/\//g, "_");
	}
	static decoder(str) {
		return LZString.decompressFromEncodedURIComponent(str);
		//		var resultat = str;
		//		resultat = resultat.replace(/\_/g,"/").replace(/\-/g, "+");
		//		resultat = atob(resultat);
		//		resultat = escape(resultat);
		//		resultat = decodeURIComponent(resultat);
		//		resultat = Lzw.decode(resultat);
		//		fct(resultat);
		//		return this;
	}
	static urlPage(fic) {
		if (!fic) {
			return this.pathPage;
		} else {
			return this.pathPage + "/" + fic;
		}
	}
	static urlScript(fic) {
		if (!fic) {
			return this.pathScript;
		} else {
			return this.pathScript + "/" + fic;
		}
	}
	static setPaths() {
		var dossierPage = window.location.href.split("/").slice(0, -1);
		this.pathPage = dossierPage.join("/");
		var src = document.head.lastChild.getAttribute("src").split("/").slice(0, -1);
		if (src.length === 0 || !src[0].startsWith("http")) {
			src = dossierPage.concat(src).filter(x => x !== ".");
			let idx;
			while (idx = src.indexOf(".."), idx > -1) {
				src.splice(idx - 1, 2);
			}
		}
		this.pathScript = src.join("/");
	}
	static init() {
		this.MODE_AFFICHAGE = 0;
		this.MODE_EDITION = 1;
		this.MODE_IMPRESSION = 2;
		this.MODE_FRAME = 3;
		this.setPaths();
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
//		this.ajouterScript("dom");
		this.ajouterScript("Horaire");
		this.ajouterScript("Plage");
		this.data = {};
		return;
	}
}
App.init();
