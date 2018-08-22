/*jslint esnext:true, browser:true, debug:false*/
/*global App */
import DOM from "./DOM.js";
//import App from "./App.js";
import Plage from "./Plage.js";
/**
 * Classe Horaire représentant une grille horaire
 * @todo Ajouter annuler
 * @todo Ne pas exporter si valeurs par défaut??? pas sur
 * @todo Form pour données globales (titre, nbjours...)
 * @todo Éliminer les variables globales (json, horaire, etc.)
 *       @todo Bouton annuler ou ok
 * @property titre {string}	Le titre de la grille (private)
 * @property jours {string[]}	Les jours (colonnes)
 * @property heureDebut {integer}	L'heure du début de l'horaire
 * @property nbPeriodes {integer}	Le nombre de périodes (rangées)
 * @property dureePeriode {integer}	La durée dechaque période
 * @property pause {integer}	La pause à intercaler entre les périodes
 * @property hauteur {integer}	La hauteur en pouces de la zone horaire
 * @property _plages {Plage[]} Les plages actuellement dans l'horaire
 */
export default class Horaire extends DOM {
	/**
	 * Constructeur
	 */
	constructor() {
		super();
		this._titre = "Horaire";
		this._plages = [];
		this._grille_dom = null;
	}
	get titre() {
		return this._titre;
	}
	set titre(titre) {
		var dom;
		this._titre = titre;
		dom = document.getElementById("affichage_titre");
		if (dom) {
			dom.parentNode.replaceChild(this.dom_caption(), dom);
		}
	}
	get grille_dom() {
		if (!this._grille_dom) {
			this._grille_dom = this.dom_grille();
		}
		return this._grille_dom;
	}
	get grille() {
		if (typeof this._grille === "string") {
			return Horaire.grilles[this._grille];
		} else if (typeof this._grille === "undefined") {
			return Horaire.grilles[Horaire.grille_defaut];
		} else {
			return this._grille;
		}
	}
	set grille(val) {
		this.setGrille(val);
	}
	/**
	 * Détermine la grille à utiliser et retourne une promesse résolue après chargement au json au besoin
	 * @param   {Array|array[]|object|string} val La grille à utiliser
	 * @returns {Promise}                     Une promesse résolue après chargement au json au besoin
	 */
	setGrille(val) {
		//TODO Rassembler en une seule promesse
		var promesse;
		if (!val) {
			return Promise.resolve(false);
		}
		if (val instanceof Array) {
			promesse = Promise.resolve(this.grilleFromArray(val));
		}else if (typeof val === "object") {
			promesse = Promise.resolve(val);
		}else if (Horaire.grilles[val]) {
			promesse = Promise.resolve(Horaire.grilles[val]);
		} else {
			promesse = App.loadJson(Horaire.url_grille(val)).then(grille=>{
				Horaire.grilles[val] = grille;
				return grille;
			});
		}
		return promesse.then(grille => {
			this._grille = this._grille || {};
			DOM.copierProps(grille, this._grille);
			this.appliquerGrille(grille);
			//TODO Voir à ne pas changer le theme (si choisi) si on change de grille
			if (grille.theme) {
				return this.setTheme(grille.theme);
			}
		});
	}
	get theme() {
		if (!this._theme) {
			return this.grille.theme;
		} else if (typeof this._theme === "string") {
			return Horaire.themes[this._theme];
		} else {
			return this._theme;
		}
	}
	set theme(val) {
		this.setTheme(val);
	}
	setTheme(val) {
		var promesse;
		if (!val) {
			return Promise.resolve(false);
		}
		if (typeof val === "object") {
			promesse = Promise.resolve(val);
		} else if (Horaire.themes[val]) {
			promesse = Promise.resolve(Horaire.themes[val]);
		} else {
			promesse = App.loadJson(Horaire.url_theme(val)).then(theme=>{
				Horaire.themes[val] = theme;
				return theme;
			});
		}
		promesse.then(theme => {
			this._theme = theme;
			return this.appliquerTheme(this.theme);
		});
	}
	get nbJours() {
		return this._grille.jours.length;
	}
	get jours() {
		return this.grille.jours;
	}
	set jours(val) {
		this.grille.jours = val;
	}
	get heureDebut() {
		return this.grille.heureDebut;
	}
	set heureDebut(val) {
		this.grille.heureDebut = val;
	}
	get dureePeriode() {
		return this.grille.dureePeriode;
	}
	set dureePeriode(val) {
		this.grille.dureePeriode = val;
	}
	get nbPeriodes() {
		return this.grille.nbPeriodes;
	}
	set nbPeriodes(val) {
		this.grille.nbPeriodes = val;
	}
	get pause() {
		return this.grille.pause;
	}
	set pause(val) {
		this.grille.pause = val;
	}
	get hauteur() {
		return this.grille.hauteur;
	}
	set hauteur(val) {
		this.grille.hauteur = val;
	}
	get types() {
		return this._grille.typesPlages;
	}
	static url_grille(nom) {
		return "json/grille_" + nom + ".json";
	}
	static url_theme(nom) {
		return "json/theme_" + nom + ".json";
	}
	/**
	 * Retourne l'élément HTML de l'horaire
	 * @returns {HTMLElement} Un élément dom#horaire
	 */
	dom_creer() {
		var resultat;
		resultat = this.createElement("div#horaire", this.dom_caption());
		//		resultat.style.height = this.hauteur + "in";
		resultat.appendChild(this.grille_dom);
		return resultat;
	}
	/**
	 * Retourne la zone d'affichage du titre
	 * @returns {HTMLElement} Un élément div.caption#affichage_titre
	 */
	dom_caption() {
		var caption;
		caption = this.createElement("div.caption#affichage_titre");
		var parties = this._titre.split("|");
		parties.forEach(function (t) {
			this.createElementIn(caption, "span", t);
		}, this);
		return caption;
	}
	/**
	 * Retourne l'élément HTML représentant la grille
	 * @returns {HTMLElement} Un élément div.grille
	 */
	dom_grille() {
		var resultat;
		resultat = this.createElement("div.grille");
		var gridTemplate = [
			"1.6em",
			"repeat(" + this.nbPeriodes + ", 1fr)",
			"/",
			"6ch",
			"repeat(" + this.nbJours + ", 1fr)",
			"6ch"
		];
		resultat.style.gridTemplate = gridTemplate.join(" ");
		//TODO Déplacer vers la classe App
		if (App.mode === App.MODE_EDITION) {
			resultat.classList.add("modif");
		}
		this.dom_grille_ajouterJours(resultat);
		this.dom_grille_ajouterHeures(resultat);
		this.dom_grille_ajouterCases(resultat);
		return resultat;
	}
	/**
	 * Ajoute la rangee des jours
	 * @param   {HTMLElement} grille La grille
	 * @returns {Horaire}     this
	 */
	dom_grille_ajouterJours(grille) {
		grille.appendChild(this.dom_case("jour", 1, 1));
		grille.appendChild(this.dom_case("jour", 1, this.nbJours + 2));
//		for (i = 0, n = this.jours.length; i < n; i += 1) {
//			plage = grille.appendChild(this.dom_case("jour", 1, i + 2));
//			plage.innerHTML = this.jours[i];
//		}
		this.jours.forEach((j, i)=>{
			var plage = grille.appendChild(this.dom_case("jour", 1, i + 2));
			plage.innerHTML = j;

		});
		return this;
	}
	/**
	 * Ajoute les cases dans la grille
	 * @param   {HTMLElement} grille La grille
	 * @returns {Horaire}     this
	 */
	dom_grille_ajouterCases(grille) {
		var plage;
		for (let i = 0, n = this.nbJours; i < n; i += 1) {
			for (let j = 0, m = this.nbPeriodes; j < m; j += 1) {
				plage = grille.appendChild(this.dom_case("case", j + 2, i + 2));
				//TODO Déplacer vers la classe App
				if (App.mode === App.MODE_EDITION) {
					plage.addEventListener("click", this.evt.plage.click);
				}
				plage.obj = this;
			}
		}
		return this;
	}
	/**
	 * Ajoute la colonne des heures
	 * @param   {HTMLElement} grille La grille
	 * @returns {Horaire}     this
	 */
	dom_grille_ajouterHeures(grille) {
		var debut, fin, j, i, col, plage;
		var nbJours = this.nbJours;
		for (i = 0; i < 2; i += 1) {
			col = i * (nbJours + 1) + 1;
			for (j = 0; j < this.nbPeriodes; j += 1) {
				debut = this.heureDebut + j * (this.dureePeriode + this.pause);
				fin = debut + this.dureePeriode;
				plage = grille.appendChild(this.dom_case("heure", j + 2, col));
				plage.appendChild(this.createElement("div.heureDebut", this.min2h(debut)));
				plage.appendChild(this.createElement("div"));
				plage.appendChild(this.createElement("div.heureFin", this.min2h(fin)));
			}
		}
		return this;
	}
	/**
	 * Retourne une case générique (sans infos) de la grille
	 * @param   {string}  classe La classe à appliquer à la case
	 * @param   {integer} r      La rangée
	 * @param   {integer} c      La colonne
	 * @param   {integer} h      La hauteur
	 * @param   {integer} l      La largeur
	 * @returns {string}  Un élément HTML div
	 */
	dom_case(classe, r = "auto", c = "auto", h = "auto", l = "auto") {
		if (h !== "auto") {
			h += " span";
		}
		if (l !== "auto") {
			l += " span";
		}
		var resultat = document.createElement("div");
		if (classe) {
			resultat.classList.add(classe);
		}
		resultat.style.gridArea = "" + r + " / " + c + " / " + h + " / " + l + "";
		return resultat;
	}
	/**
	 * Retourne le code HTML d'un lien vers la page de l'horaire
	 * @returns {string} Le HTML d'un a
	 */
	html_lien() {
		var resultat;
		resultat = '<a href="' + this.toUrl() + '">' + this.titre + '</a>';
		return resultat;
	}
	/**
	 * Retourne le code HTML d'un iframe contenant la page de l'horaire
	 * @returns {string} Le HTML d'un iframe
	 */
	html_iframe(largeur = 768, hauteur = 469) {
		var resultat;
		resultat = '<iframe style="width:"' + largeur + '"px;height:"' + hauteur + '"px;border:none;" src="' + this.toUrl() + '"></iframe>';
		return resultat;
	}
	/**
	 * Retourne l'élément HTML du formulaire gérant l'ensemble de l'horaire
	 * @todo Ajouter la gestion des themes et grilles
	 * @returns {HTMLElement} L'élément form#formHoraire
	 */
	dom_form() {
		var resultat;
		resultat = DOM.createElement("form#formHoraire");
		resultat.obj = this;
		this.trForm = resultat;
		resultat.appendChild(this.dom_form_titre());
		resultat.appendChild(this.dom_form_themes());
		return resultat;
	}
	dom_form_titre() {
		var input;
		input = this.createElement("input#titre", null, {
			"type": "text",
			"value": this.titre,
			"placeholder": "Titre"
		}, this.evt.input_titre);
		return this.form_wrap(input, "Titre");
	}
	dom_form_themes() {
		var select, option;
		select = this.createElement("select#theme", null, {
		}, this.evt.select_theme);
		option = this.createElementIn(select, "option", "Standard", {
			value: "standard",
		});
		option = this.createElementIn(select, "option", "Autre", {
			value: "autre",
		});
		return this.form_wrap(select, "Thème");
	}
	toUrl() {
		var url = "";
		url += location.protocol;
		url += "//" + location.host;
		url += location.pathname.split("/").slice(0, -1).join("/") + "/";
		url += "index.html";
		url += "?h=";
		url += App.encoder(this.toArray(true));
		return url;
	}
	min2h(min) {
		var h = "0" + Math.floor(min / 60);
		h = h.slice(-2);
		var m = "0" + min % 60;
		m = m.slice(-2);
		return h + "h" + m;
	}
	/**
	 * Ajoute une plage et l'affiche
	 * @param   {object}  plage La plage
	 * @returns {Horaire} this
	 */
	ajouterPlage(plage) {
		if (!plage || plage.length === 0) {
			return this;
		} else if (plage instanceof Array && plage[0] instanceof Array) {
			plage.forEach(p => this.ajouterPlage(p));
		} else if (plage instanceof Plage) {
			this._plages.push(plage);
			plage.horaire = this;
			this.grille_dom.appendChild(plage.dom);
		} else if (typeof plage === "object") {
			this.ajouterPlage(Plage.fromJson(plage, this));
		} else {
			this.ajouterPlage(JSON.parse(plage));
		}
		return this;
	}
	afficherPlage(plage) {
		plage.afficher();
		return this;
	}
	gererPlages() {
		this._plages.forEach(p => this.afficherPlage(p));
	}
	trouverPlage(plage) {
		return this._plages.indexOf(plage);
	}
	trouverPlageA(jour, debut, duree) {
		duree = duree || 1;
		if (debut + duree > this.nbPeriodes) {
			return false;
		}
		for (let i = debut; i < debut + duree; i += 1) {
			var plage = this._plages.find((p) => (p.jour === jour && i >= p.debut && i < p.debut + p.duree));
			if (plage) {
				return plage;
			}
		}
		return true;
	}
	trouverTrou(jour, heure, duree) {
		//Regarder la fin du jour
		for (let i = heure; i + duree <= this.nbPeriodes; i += 1) {
			let plage = this.trouverPlageA(jour, i, duree);
			if (plage === true) {
				return {
					jour: jour,
					heure: i
				};
			} else if (plage === false) {
				break;
			} else {
				i = plage.debut + plage.duree - 1;
			}
		}
		//Regarder les autres jours
		for (let j = 1, m = this.nbJours; j < m; j += 1) {
			for (let i = 0, n = this.nbPeriodes; i + duree <= n; i += 1) {
				let plage = this.trouverPlageA((jour + j) % m, i, duree);
				if (plage === true) {
					return {
						jour: (jour + j) % m,
						heure: i
					};
				} else if (plage === false) {
					break;
				} else {
					i = plage.debut + plage.duree - 1;
				}
			}
		}
		//Regarder le debut du jour
		for (let i = 0; i + duree <= heure; i += 1) {
			let plage = this.trouverPlageA(jour, i, duree);
			if (plage === true) {
				return {
					jour: jour,
					heure: i
				};
			} else if (plage === false) {
				break;
			} else {
				i = plage.debut + plage.duree - 1;
			}
		}
	}
	dupliquerPlage(plage) {
		var p;
		p = Plage.fromJson(plage.toJson(), this);
		this.ajouterPlage(p);
		return p;
	}
	supprimerPlage(plage) {
		var i;
		i = this.trouverPlage(plage);
		this._plages.splice(i, 1);
		return this;
	}
	fill(data) {
		if (typeof data == "string") {
			this.fill(JSON.parse(data));
			return Promise.resolve(this);
		} else if (data instanceof Array) {
			data = Array.from(data);	//TODO Voir la pertinence de faire une copie
			return this.setGrille(data[2]).then(() => this.setTheme(data[3])).then(() => {
				this.titre = data[0];
				this.ajouterPlage(data[1]);
				return Promise.resolve(this);
			});
		} else {
			if (data.titre !== undefined) {
				this.titre = data.titre;
			}
			if (data.jours !== undefined) {
				this.jours = data.jours;
			}
			if (data.heureDebut !== undefined) {
				this.heureDebut = data.heureDebut;
			}
			if (data.dureePeriode !== undefined) {
				this.dureePeriode = data.dureePeriode;
			}
			if (data.pause !== undefined) {
				this.pause = data.pause;
			}
			if (data.hauteur !== undefined) {
				this.hauteur = data.hauteur;
			}
			if (data.plages !== undefined) {
				this.ajouterPlage(data.plages);
			}
			return Promise.resolve(this);
		}
	}
	grilleFromArray(array) {
		var resultat = {};
		Horaire.proprietesGrille.forEach(propriete=>{
			resultat[propriete] = array.shift();
		});
		return resultat;
	}
	grilleToArray() {
		var resultat = this._grille;
		if (!resultat) {
			return false;
		}
		if (typeof resultat === "string") {
			return resultat;
		}
		resultat = Horaire.proprietesGrille.map(propriete=>resultat[propriete]);
		return resultat;
	}
	toJson(stringify) {
		var resultat = {};
		resultat.titre = this.titre;
		resultat.jours = this.jours;
		resultat.heureDebut = this.heureDebut;
		resultat.dureePeriode = this.dureePeriode;
		resultat.pause = this.pause;
		resultat.hauteur = this.hauteur;
		resultat.plages = this._plages.map(p => p.toJson(false));
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	toArray(stringify) {
		var resultat = [
			this.titre,
			this._plages.map(p => p.toArray(false)),
		];
		var g = this.grilleToArray();
		if (g) {
			resultat.push(g);
		}
		var th = this._theme;
		if (th) {
			resultat.push(th);
		}
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	static fromJson(json) {
		var resultat = new Horaire();
		resultat.fill(json);
		return resultat;
	}
	static fromArray(data) {
		if (typeof data == "string") {
			data = JSON.parse(data);
		}
		var resultat = new Horaire();
		App.horaire = resultat;	//TODO Vérifier la pertinence
		resultat.fill(data);
		return resultat;
	}
	static zzzgetSearch() {
		var resultat, s, i, n, donnee;
		resultat = {};
		s = location.href;
		if (!s) {
			return resultat;
		}
		s = s.substr(1).split("&");
		for (i = 0, n = s.length; i < n; i += 1) {
			donnee = s[i].split("=");
			resultat[donnee.shift()] = donnee.join("=");
		}
		return resultat;
	}
	static setEvents() {
		this.prototype.evt = {
			plage: {
				click: function () {
					var courant;
					if (courant = document.querySelector("div.plage.courant"), courant) {
						courant.obj.deposer();
					} else {
						var r = parseInt(this.style.gridRowStart) - 2;
						var c = parseInt(this.style.gridColumnStart) - 2;
						var plage = new Plage(App.horaire);
						plage.typePlage = "D";
						plage.jour = c;
						plage.debut = r;
						plage.duree = 3;
						this.obj.ajouterPlage(plage);
						plage.editer();
					}
				}
			},
			input_titre: {
				input: function () {
					this.form.obj.titre = this.value;
				}
			},
			select_theme: {
				input: function () {
					return App.loadJson("json/theme_"+this.value+".json").then(t => {
						App.horaire.appliquerTheme(t);
					});
				}
			}
		};
		return this;
	}
	appliquerGrille(grille) {
		if (grille.typesPlages) {
			Plage.appliquerTypes(grille.typesPlages);
//			delete grille.typesPlages;
		}
		DOM.copierProps(grille, this);
	}
	appliquerTheme(theme) {
		var ss = Horaire.stylesheet;
		while (ss.rules.length) {
			ss.removeRule(ss.rules[0]);
		}
		if (theme.css) {
			for (let selecteur in theme.css) {
				ss.insertRule("div#horaire " + selecteur + " {" + theme.css[selecteur] + "}");
			}
		}
		if (theme.typesPlages) {
			for (let k in theme.typesPlages) {
				ss.insertRule("div.plage[data-type=" + k + "] {" + theme.typesPlages[k].css + "}");
			}
		}
		Plage.appliquerTypes(theme.typesPlages);
	}
	/**
	 * Retourne un tableau de nom des jours dans la langue donnée
	 * @param   {string}   lang     La langue à utiliser
	 * @param   {integer}  debut=0  Le premier jour de la liste
	 * @param   {integer}  nombre=7 Le nombre de jours dans la liste
	 * @returns {string[]} Un tableau de string
	 */
	static trouverNomsJours(lang, debut = 0, nombre = 7) {
		var resultat, dimanche, step;
		step = 1000 * 60 * 60 * 24;
		lang = lang || window.navigator.language;
		resultat = [];
		dimanche = new Date();
		dimanche = dimanche.getTime() - dimanche.getDay() * step;
		for (let i = dimanche + debut * step, fin = i + nombre * step; i < fin; i += step) {
			let dd = new Date(i);
			resultat.push(dd.toLocaleString(lang, {
				weekday: "long"
			}));
		}
		return resultat;
	}
	static load() {
		App.horaire = new this();
		return App.loadJson(this.url_grille(this.grille_defaut)).then(g => {
			this.grilles[this.grille_defaut] = g;
				App.horaire.appliquerGrille(g);
			return App.horaire.setGrille(this.grille_defaut);
		}).then(()=>{
			if (App.json_horaire) {
				return Promise.resolve(App.decoder(App.json_horaire)).then(json => {
					return App.horaire.fill(json);
				});
			} else {
				return Promise.resolve();
			}
		}).then(() => {
			return App.afficher(App.horaire);
		});
	}
	/**
	 * Règle les propriétés de la classe et les événements
	 */
	static init() {
		App[this.name] = this;
		this.themes = {};
		this.grilles = {};
		this.grille_defaut = "cstj";
		this.theme_defaut = "standard";
		this.proprietesGrille = ["jours", "heureDebut", "dureePeriode", "nbPeriodes", "pause", "hauteur", "theme"];
		this.stylesheet = this.initStylesheet();
		this.setEvents();
	}
}
Horaire.init();
