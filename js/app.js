/*jslint esnext:true, browser:true, debug:true*/
/*global Horaire, LZString*/
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
		this.ajouterScript("dom");
		this.ajouterScript("horaire");
		this.ajouterScript("plage");
		this.data = {};
		return;
	}
}
App.init();
