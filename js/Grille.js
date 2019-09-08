/*jslint esnext:true, browser:true, debug:false*/
import DOM from "./DOM.js";
import App from "./App.js";
// import Plage from "./Plage.js";
/**
 * Classe Grille représentant une grille vide
 * @property nom {string}	Le nom (id) de la grille (private)
 * @property label {string}	Le label à mettre par exemple dans le select
 * @property jours {string[]}	Les jours (colonnes)
 * @property heureDebut {integer}	L'heure du début de l'horaire
 * @property nbPeriodes {integer}	Le nombre de périodes (rangées)
 * @property dureePeriode {integer}	La durée dechaque période
 * @property pause {integer}	La pause à intercaler entre les périodes
 */
export default class Grille extends DOM {
	/**
	 * Constructeur
	 */
	constructor() {
		super();
		this._dom = null;
	}
	get test() {
		console.log(99);
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
			this._dom.obj = this;
		}
		return this._dom;
	}
	get nbJours() {
		return this.jours.length;
	}
	static url(nom) {
		return "json/grille_" + nom + ".json";
	}
	/**
	 * Retourne l'élément HTML représentant la grille
	 * @returns {HTMLElement} Un élément div.grille
	 */
	dom_creer() {
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
		//TODO: Déplacer vers la classe App
		if (App.mode === App.MODE_EDITION) {
			resultat.classList.add("modif");
		}
		this.dom_ajouterJours(resultat);
		this.dom_ajouterHeures(resultat);
		this.dom_ajouterCases(resultat);
		return resultat;
	}
	/**
	 * Ajoute la rangee des jours
	 * @param   {HTMLElement} grille La grille
	 * @returns {Grille}     this
	 */
	dom_ajouterJours(grille) {
		grille.appendChild(this.dom_case("jour", 1, 1));
		grille.appendChild(this.dom_case("jour", 1, this.nbJours + 2));
		this.jours.forEach((j, i)=>{
			var plage = grille.appendChild(this.dom_case("jour", 1, i + 2));
			plage.innerHTML = j;

		});
		return this;
	}
	/**
	 * Ajoute les cases dans la grille
	 * @param   {HTMLElement} grille La grille
	 * @returns {Grille}     this
	 */
	dom_ajouterCases(grille) {
		var plage;
		for (let i = 0, n = this.nbJours; i < n; i += 1) {
			for (let j = 0, m = this.nbPeriodes; j < m; j += 1) {
				plage = grille.appendChild(this.dom_case("case", j + 2, i + 2));
				//TODO: Déplacer vers la classe App
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
	 * @returns {Grille}     this
	 */
	dom_ajouterHeures(grille) {
		var debut, j, i, col, plage;
		var nbJours = this.nbJours;
		for (i = 0; i < 2; i += 1) {
			col = i * (nbJours + 1) + 1;
			for (j = 0; j < this.nbPeriodes; j += 1) {
				debut = this.heureDebut + j * (this.dureePeriode + this.pause);
				plage = grille.appendChild(this.dom_case("heure", j + 2, col));
				plage.appendChild(this.createElement("div.heureDebut", this.min2h(debut)));
				//TODO: valider
				if (this.pause) {
					plage.appendChild(this.createElement("div"));
					plage.appendChild(this.createElement("div.heureFin", this.min2h(debut + this.dureePeriode)));
				} else {
					plage.style.justifyContent = "flex-start";
				}
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
	static form_select() {
		var select, option;
		select = this.createElement("select#grille", null, {
		}, this.evt.select);
		option = this.createElementIn(select, "option", "CSTJ", {
			value: "cstj",
		});
		option = this.createElementIn(select, "option", "Standard", {
			value: "standard",
		});
		option = this.createElementIn(select, "option", "Personnalisée...", {
			value: "",
		});
		return this.form_wrap(select, "Grille");
	}
	/**
	 * Retourne une heure au format hh:mm en fonction des minutes données
	 * @param {integer} min
	 * @returns {string}
	 * @memberof Grille
	 * @todo trouver le meileur endroit
	 */
	min2h(min) {
		var h = "0" + Math.floor(min / 60);
		h = h.slice(-2);
		var m = "0" + min % 60;
		m = m.slice(-2);
		return h + "h" + m;
	}
	//TODO: Vérifier URGENT
	fill(data) {
		if (typeof data == "string") {
			this.fill(JSON.parse(data));
			return Promise.resolve(this);
		} else if (data instanceof Array) {
			Grille.proprietes.forEach((prop, i) => {
				this[prop] = data[i];
			});
			return Promise.resolve(this);
		} else {
			Grille.proprietes.forEach((prop) => {
				if (data[prop] !== undefined) {
					this[prop] = data[prop];
				}
			});
			return Promise.resolve(this);
		}
	}
	static from(data) {
		var resultat = new this();
		resultat.fill(data);
		return resultat;
	}
	toArray() {
		resultat = Grille.proprietes.map(propriete=>this[propriete]);
		return resultat;
	}
	toJson(stringify) {
		var resultat = {};
		resultat = Grille.proprietes.forEach(p => {
			resultat[p] = this[p];
		});
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	/** @todo vérifier */
	appliquer() {
		//TODO: Vérifier
		if (this.typesPlages) {
			Plage.appliquerTypes(this.typesPlages);
//			delete this.typesPlages;
		}
		// DOM.copierProps(grille, this);
		var temp = this._dom;
		if (!temp) {
			return;
		}
		this._dom = null;
		temp.parentNode.replaceChild(this._dom, temp);
	}
	static setEvents() {
		this.prototype.evt = {
			select: {
				input: function () {
					console.log("wow");
					//TODO: Valider
					return Grille.get(this.value).then(t => {
						throw "appliquer";
						// App.horaire.appliquerGrille(t);
					});
				}
			},
		};
		return this;
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
	static get(nom) {
		if (this.grilles[nom]) {
			return Promise.resolve(this.grilles[nom]);
		}
		return App.loadJson(this.url(nom)).then(data => {
			this.grilles[nom] = this.from(data);
			return this.grilles[nom];
		});
	}
	/**
	 * Règle les propriétés de la classe et les événements
	 */
	static init() {
		this.grilles = {};
		this.defaut = "cstj";
		this.proprietes = ["nom", "label", "jours", "heureDebut", "dureePeriode", "nbPeriodes", "pause", "typesPlages"];
		this.setEvents();
	}
}
Grille.init();
