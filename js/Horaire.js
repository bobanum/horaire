/*jslint esnext:true, browser:true, debug:false*/
import DOM from "./DOM.js";
import App from "./App.js";
import Plage from "./Plage.js";
import Grille from "./Grille.js";
import Theme from "./Theme.js";
/**
 * Classe Horaire représentant une grille horaire
 * @todo Ajouter annuler
 * @todo Ne pas exporter si valeurs par défaut??? pas sur
 * @todo Form pour données globales (titre, nbjours...)
 * @todo Éliminer les variables globales (json, horaire, etc.)
 *       @todo Bouton annuler ou ok
 * @property titre {string}	Le titre de la grille (private)
 * @property _plages {Plage[]} Les plages actuellement dans l'horaire
 * @property _grille {Grille}	L'objet Grille sur laquelle baser l'horaire
 * @property _theme {Theme}	L'objet Theme à appliquer à l'horaire
 */
export default class Horaire extends DOM {
	/**
	 * Constructeur
	 */
	constructor() {
		super();
		this._titre = "Horaire";
		this._plages = [];
		this._grille = null;
		this._theme = null;
		this._dom = null;
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
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
			this._dom.obj = this;
		}
		return this._dom;
	}
	get grille() {
		if (typeof this._grille === "string") {
			return Grille.grilles[this._grille];
		} else if (typeof this._grille === "undefined") {
			return Grille.grilles[Grille.defaut];
		} else {
			return this._grille;
		}
	}
	set grille(val) {
		this.setGrille(val);
	}
	/**
	 * Détermine la grille à utiliser et retourne une promesse résolue après chargement du json au besoin
	 * @param   {Array|array[]|object|string} val La grille à utiliser
	 * @returns {Promise}                     Une promesse résolue après chargement du json au besoin
	 */
	setGrille(val) {
		//TODO: Rassembler en une seule promesse
		var promesse;
		if (!val) {
			return Promise.resolve(false);
		}
		if (val instanceof Grille) {
			promesse = Promise.resolve(val);
		} else if (typeof val === "object") {
			promesse = Promise.resolve(Grille.from(val));
		} else {
			promesse = Grille.get(val);
		}
		return promesse.then(grille => {
			this._grille = grille;
			grille.horaire = this;
			//TODO: Réviser
			this.appliquerGrille(grille);
		});
	}
	get theme() {
		throw "VALIDER";
		// if (typeof this._theme === "string") {
		// 	return Theme.get();
		// } else {
		// 	return this._theme;
		// }
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
		} else {
			promesse = Theme.get(val);
		}
		promesse.then(theme => {
			this._theme = theme;
			throw "VALIDER";
			// return this.appliquerTheme(this._theme);
		});
	}
	/**
	 * Retourne l'élément HTML de l'horaire
	 * @returns {HTMLElement} Un élément dom#horaire
	 */
	dom_creer() {
		var resultat;
		resultat = this.createElement("div#horaire", this.dom_caption());
		resultat.appendChild(this._grille.dom);
		//TODO: Doit-on ajouter les plages tout de suite?
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
		resultat.appendChild(Grille.form_select());
		resultat.appendChild(Theme.form_select());
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
	//TODO: Trouver le meilleur ebndroit.
	min2h(min) {
		var h = "0" + Math.floor(min / 60);
		h = h.slice(-2);
		var m = "0" + min % 60;
		m = m.slice(-2);
		return h + "h" + m;
	}
	nouvellePlage(c, r) {
		var plage = new Plage(this);
		plage.typePlage = "D";
		plage.jour = c;
		plage.debut = r;
		plage.duree = 3;
		this.ajouterPlage(plage);
		plage.editer();
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
			this._grille.dom.appendChild(plage.dom);
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
		//TODO Revoir
		for (let i = debut; i < debut + duree; i += 1) {
			/* jshint ignore:start */
			var plage = this._plages.find((p) => (p.jour === jour && i >= p.debut && i < p.debut + p.duree));
			/* jshint ignore:end */
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
			Horaire.proprietes.forEach((prop, i) => {
				this[prop] = data[i];
			});
			return Promise.resolve(this);
		} else {
			Horaire.proprietes.forEach((prop) => {
				if (data[prop] !== undefined) {
					this[prop] = data[prop];
				}
			});
			return Promise.resolve(this);
		}
		//TODO: Mettre à jour l'interface
	}
	toJson(stringify) {
		var resultat = {};
		resultat.grille = this._grille.toJson();
		resultat.theme = this._theme.toJson();
		resultat.titre = this.titre;
		resultat.plages = this._plages.map(p => p.toJson(false));
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	toArray(stringify) {
		var resultat = [
			this._grille.toArray(),
			this._theme.toArray(),
			this.titre,
			this._plages.map(p => p.toArray(false)),
		];
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	static from(data) {
		var resultat = new this();
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
			input_titre: {
				input: function () {
					this.form.obj.titre = this.value;
				}
			},
		};
		return this;
	}
	appliquerGrille() {
		if (!this._dom) {
			return;
		}
		throw "appliquer grille";
		/* if (grille.typesPlages) {
			Plage.appliquerTypes(grille.typesPlages);
//			delete grille.typesPlages;
		}
		DOM.copierProps(grille, this);
		var temp = this._grille_dom;
		if (!temp) {
			return;
		}
		//TODO: Déplager vers Grille??
		this._grille.dom = null;
		temp.parentNode.replaceChild(this._grille.dom, temp); */
	}
	appliquerTheme(theme) {
		throw "Appliquer Theme";
		/* var ss = Horaire.stylesheet;
		while (ss.rules && ss.rules.length) {
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
		Plage.appliquerTypes(theme.typesPlages); */
	}
	static load() {
		App.horaire = new this();
		return Grille.get(Grille.defaut).then(g => {
			App.horaire.grille = g;
			return g;
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
		// Grille.get("cstj").then(data => {
		// 	this.grille_defaut = data;
		// });
		// Theme.get("standard").then(data => {
		// 	this.theme_defaut = data;
		// });
		this.proprietes = ["grille", "theme", "titre", "plages"];
		this.setEvents();
	}
}
Horaire.init();
