/*jslint esnext:true, browser:true, debug:false*/
import DOM from "./DOM.js";
import App from "./App.js";
import Plage from "./Plage.js";
/**
 * Classe Theme représentant une grille horaire
 * @property nom {string}	Le nom du theme
 * @property label {string[]}	Le label pour le select
 * @property css {object}	Une série de règles avec un sélecteur comme clé
 * @property typesPlages {integer}	Une série de types de plages avec une propriété css //TODO: voir la pertinence de l'imbrication
 */
export default class Theme extends DOM {
	/**
	 * Constructeur
	 */
	constructor() {
		super();
		this._css = {};
		this._typesPlages = {};
		this._dom = null;
	}
	static url(nom) {
		return "json/theme_" + nom + ".json";
	}
	static form_select() {
		var select, option;
		select = this.createElement("select#theme", null, {
		}, this.evt.select);
		option = this.createElementIn(select, "option", "Standard", {
			value: "standard",
		});
		option = this.createElementIn(select, "option", "Autre", {
			value: "autre",
		});
		return this.form_wrap(select, "Thème");
	}
	fill(data) {
		if (typeof data == "string") {
			this.fill(JSON.parse(data));
			return Promise.resolve(this);
		} else if (data instanceof Array) {
			data = Array.from(data);	//TODO Voir la pertinence de faire une copie
			Theme.proprietes.forEach((p, i) => {
				this[p] = data[i];
			});
			return Promise.resolve(this);
		} else {
			Theme.proprietes.forEach((p) => {
				if (data[p] !== undefined) {
					this[p] = data[p];
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
	static setEvents() {
		this.prototype.evt = {
			select: {
				input: function () {
					//TODO: Valider et/ou déplacer DANS dom
					return App.loadJson("json/theme_"+this.value+".json").then(t => {
						App.horaire.appliquerTheme(t);
					});
				}
			},
		};
		return this;
	}
	appliquer() {
		var ss = Theme.stylesheet;
		while (ss.rules && ss.rules.length) {
			ss.removeRule(ss.rules[0]);
		}
		if (this.css) {
			for (let selecteur in this.css) {
				ss.insertRule("div#horaire " + selecteur + " {" + this.css[selecteur] + "}");
			}
		}
		if (this.typesPlages) {
			for (let k in this.typesPlages) {
				ss.insertRule("div.plage[data-type=" + k + "] {" + this.typesPlages[k].css + "}");
			}
		}
		//TODO: Vérifier la pertinence
		//Plage.appliquerTypes(theme.typesPlages);
	}
	static get(nom) {
		if (this.themes[nom]) {
			return Promise.resolve(this.themes[nom]);
		}
		return App.loadJson(this.url(nom)).then(data => {
			this.themes[nom] = data;
			return data;
		});
	}
	/**
	 * Règle les propriétés de la classe et les événements
	 */
	static init() {
		this.themes = {};
		this.defaut = "standard";
		this.proprietesGrille = ["nom", "label", "css", "typesPlages"];
		this.stylesheet = this.initStylesheet();
		this.setEvents();
	}
}
Theme.init();
