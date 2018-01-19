/*jslint esnext:true, browser:true, debug:true*/
/*global Horaire*/
/*
Classe App gérant l'application
*/
class App {
	static load() {
		var h;
		if (window.json) {
			h = Horaire.fromArray(window.json);
		} else {
			h = new Horaire();
		}
		if (location.href.match(/edition\.html/)) {
			this.mode = this.MODE_EDITION;
			document.body.parentNode.classList.add("edition");
		} else if (location.href.match(/impression\.html/)) {
			this.mode = this.MODE_IMPRESSION;
			document.body.parentNode.classList.add("impression");
		} else if (window.self !== window.top) {
			this.mode = this.MODE_FRAME;
			document.body.parentNode.classList.add("frame");
		} else {
			this.mode = this.MODE_AFFICHAGE;
			document.body.parentNode.classList.add("affichage");
		}
		h.afficher();
	}
	static init() {
//		debugger;
		this.MODE_AFFICHAGE = 0;
		this.MODE_EDITION = 1;
		this.MODE_IMPRESSION = 2;
		this.MODE_FRAME = 3;

		this.scriptUrl = this.getScriptUrl();
		this.rootUrl = this.getRootUrl();
		this.ajouterLink("horaire", "all");
		this.ajouterScript("lz-string");
		this.ajouterScript("dom");
		this.ajouterScript("horaire");
		this.ajouterScript("plage");
		this.data = {};
		window.addEventListener("load", function() {
			App.load();
		});
		return;
	}
	static ajouterScript(url) {
		var resultat = document.createElement("script");
		resultat.setAttribute("src", this.scriptUrl + "/" + url + ".js");
		document.head.appendChild(resultat);
		return resultat;
	}
	static ajouterLink(url, media) {
		var resultat = document.createElement("link");
		resultat.setAttribute("rel", "stylesheet");
		if (media) {
			resultat.setAttribute("media", media);
		}
		resultat.setAttribute("href", this.rootUrl + "/css/" + url + ".css");
		document.head.appendChild(resultat);
		return resultat;
	}
	static getScriptUrl() {
		var src = document.head.lastElementChild.src;
		src = src.split(/\//);
		if (src.length === 1) {
			return "./";
		}
		src = src.slice(0,-1).join("/");
		return src;
	}
	static getRootUrl() {
		var resultat = window.location.href.split("/").slice(0,-1).join("/");
		return resultat;
	}
}
App.init();
