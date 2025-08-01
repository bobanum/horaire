/*jslint esnext:true, browser:true, debug:false*/
import DOM from "./DOM.js";
import App from "./App.js";
import Slot from "./Slot.js";
import Grid from "./Grid.js";
import Theme from "./Theme.js";

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
export default class Schedule {
	static themes = {};
	static grids = {};
	static grid_default = "cstj";
	static theme_default = "standard";
	/**
	 * Constructeur
	 */
	constructor() {
		this._titre = "Horaire";
		this._plages = [];
		this._grid_dom = null;
	}
	get titre() {
		return this._titre;
	}
	set titre(titre) {
		var dom;
		this._titre = titre;
		dom = document.getElementById("affichage_titre");
		if (dom) {
			dom.parentNode.replaceChild(this.DOM.caption(), dom);
		}
	}
	get grid_dom() {
		if (!this._grid_dom) {
			this._grid_dom = this.DOM.grid();
		}
		return this._grid_dom;
	}
	get grid() {
		if (typeof this._grid === "string") {
			return Schedule.grids[this._grid];
		} else if (typeof this._grid === "undefined") {
			return Schedule.grids[Schedule.grid_default];
		} else {
			return this._grid;
		}
	}
	set grid(val) {
		this.setGrid(val);
	}
	
	
	/**
	 * Détermine la grille à utiliser et retourne une promesse résolue après chargement au json au besoin
	 * @param   {Mixed} val La grille à utiliser
	 * @returns {Promise}                     Une promesse résolue après chargement au json au besoin
	 */
	async setGrid(val) {
		const grid = await Grid.parse(val);
		this._grid = this._grid || {};
		// DOM.copierProps(grille, this._grille);
		this.appliquerGrid(grid);
		//TODO Voir à ne pas changer le theme (si choisi) si on change de grille
		if (grid.theme) {
			return this.setTheme(grid.theme);
		}
	}
	get theme() {
		if (!this._theme) {
			return this.grid.theme;
		} else if (typeof this._theme === "string") {
			return Schedule.themes[this._theme];
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
		} else if (Schedule.themes[val]) {
			promesse = Promise.resolve(Schedule.themes[val]);
		} else {
			promesse = App.loadJson(Schedule.url_theme(val)).then(theme => {
				Schedule.themes[val] = theme;
				return theme;
			});
		}
		promesse.then(theme => {
			this._theme = theme;
			return this.appliquerTheme(this._theme);
		});
	}
	get nbJours() {
		return this._grid.jours.length;
	}
	get jours() {
		return this.grid.jours;
	}
	set jours(val) {
		this.grid.jours = val;
	}
	get heureDebut() {
		return this.grid.heureDebut;
	}
	set heureDebut(val) {
		this.grid.heureDebut = val;
	}
	get dureePeriode() {
		return this.grid.dureePeriode;
	}
	set dureePeriode(val) {
		this.grid.dureePeriode = val;
	}
	get nbPeriodes() {
		return this.grid.nbPeriodes;
	}
	set nbPeriodes(val) {
		this.grid.nbPeriodes = val;
	}
	get pause() {
		return this.grid.pause;
	}
	set pause(val) {
		this.grid.pause = val;
	}
	get hauteur() {
		return this.grid.hauteur;
	}
	set hauteur(val) {
		this.grid.hauteur = val;
	}
	get types() {
		return this._grid.typesPlages;
	}
	static url_grid(nom) {
		return "data/grid/" + nom + ".json";
	}
	static url_theme(nom) {
		return "data/theme/" + nom + ".json";
	}
	DOM = {
		main: () => {
			var resultat;
			resultat = this.createElement("div#horaire", this.DOM.caption());
			//		resultat.style.height = this.hauteur + "in";
			resultat.appendChild(this.grid_dom);
			return resultat;
		},
		caption: () => {
			// const caption = this.createElement("div.caption#affichage_titre");
			const caption = document.createElement("div");
			caption.classList.add("caption");
			caption.id = "affichage_titre";
			const parties = this._titre.split("|");
			parties.forEach(function (t) {
				let span = document.createElement("span");
				span.textContent = t;
				caption.appendChild(span);
			}, this);
			return caption;
		},
		grid: () => {
			const result = document.createElement("div");
			result.classList.add("grid");

			const gridTemplate = [
				"1.6em",
				"repeat(" + this.nbPeriodes + ", 1fr)",
				"/",
				"6ch",
				"repeat(" + this.nbJours + ", 1fr)",
				"6ch"
			];
			result.style.gridTemplate = gridTemplate.join(" ");
			//TODO Déplacer vers la classe App
			if (App.mode === App.MODE_EDITION) {
				result.classList.add("modif");
			}
			this.DOM.grid_ajouterJours(result);
			this.DOM.grid_ajouterHeures(result);
			this.DOM.grid_ajouterCases(result);
			return result;
		},
		grid_ajouterJours: (grid) => {
			grid.appendChild(this.DOM.slot("jour", 1, 1));
			grid.appendChild(this.DOM.slot("jour", 1, this.nbJours + 2));
			this.jours.forEach((j, i) => {
				var plage = grid.appendChild(this.DOM.slot("jour", 1, i + 2));
				plage.innerHTML = j;

			});
			return this;
		},
		grid_ajouterCases: (grid) => {
			var plage;
			for (let i = 0, n = this.nbJours; i < n; i += 1) {
				for (let j = 0, m = this.nbPeriodes; j < m; j += 1) {
					plage = grid.appendChild(this.DOM.slot("case", j + 2, i + 2));
					//TODO Déplacer vers la classe App
					if (App.mode === App.MODE_EDITION) {
						plage.addEventListener("click", this.evt.plage.click);
					}
					plage.obj = this;
				}
			}
			return this;
		},
		grid_ajouterHeures(grid) {
			var debut, fin, j, i, col, plage;
			var nbJours = this.nbJours;
			for (i = 0; i < 2; i += 1) {
				col = i * (nbJours + 1) + 1;
				for (j = 0; j < this.nbPeriodes; j += 1) {
					debut = this.heureDebut + j * (this.dureePeriode + this.pause);
					fin = debut + this.dureePeriode;
					plage = grid.appendChild(this.DOM.slot("heure", j + 2, col));
					let div = document.createElement("div");
					div.classList.add("heureDebut");
					div.textContent = this.min2h(debut);
					plage.appendChild(div);

					div = document.createElement("div");
					plage.appendChild(div);
					div.classList.add("heureFin");
					div.textContent = this.min2h(fin);
					plage.appendChild(div);
				}
			}
			return this;
		},
		slot: (classe, r = "auto", c = "auto", h = "auto", l = "auto") => {
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
		},
		lien: () => {
			var resultat;
			resultat = '<a href="' + this.toUrl() + '">' + this.titre + '</a>';
			return resultat;
		},
		iframe: (largeur = 768, hauteur = 469) => {
			var resultat;
			resultat = '<iframe style="width:' + largeur + 'px;height:' + hauteur + 'px;border:none;" src="' + this.toUrl() + '"></iframe>';
			return resultat;
		},
		FORM: {
			main: () => {
				var resultat;
				resultat = DOM.createElement("form#formHoraire");
				resultat.obj = this;
				this.trForm = resultat;
				resultat.appendChild(this.DOM.FORM.titre());
				resultat.appendChild(this.DOM.FORM.grids());
				resultat.appendChild(this.DOM.FORM.themes());
				resultat.addEventListener("submit", e => {
					e.preventDefault();
				});
				return resultat;
			},
			titre: () => {
				const input = document.createElement("input");
				input.id = "titre";
				input.type = "text";
				input.value = this.titre;
				input.placeholder = "Titre";
				input.addEventListener("input", e => {
					this.titre = e.target.value;
				});
				return DOM.form_wrap(input, "Titre");
			},
			grids: () => {
				const select = Grid.DOM.select();
				return DOM.form_wrap(select, "Grille");
			},
			themes: () => {
				const select = Theme.DOM.select();
				return DOM.form_wrap(select, "Thème");
			}
		}
	};
	get base64() {
		return App.encoder(this.toArray(true));
	}
	toUrl() {
		var url = "";
		url += location.protocol;
		url += "//" + location.host;
		url += location.pathname.split("/").slice(0, -1).join("/") + "/";
		url += "index.html";
		url += "?h=";
		url += this.base64;
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
	 * @returns {Schedule} this
	 */
	ajouterPlage(plage) {
		if (!plage || plage.length === 0) {
			return this;
		} else if (plage instanceof Array && plage[0] instanceof Array) {
			plage.forEach(p => this.ajouterPlage(p));
		} else if (plage instanceof Slot) {
			this._plages.push(plage);
			plage.horaire = this;
			this.grid_dom.appendChild(plage.dom);
		} else if (typeof plage === "object") {
			this.ajouterPlage(Slot.fromJson(plage, this));
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
		p = Slot.fromJson(plage.toJson(), this);
		this.ajouterPlage(p);
		return p;
	}
	supprimerPlage(plage) {
		var i;
		i = this.trouverPlage(plage);
		this._plages.splice(i, 1);
		return this;
	}
	async fill(data) {
		if (typeof data == "string") {
			this.fill(JSON.parse(data));
			return this;
		} else if (data instanceof Array) {
			data = Array.from(data);	//TODO Voir la pertinence de faire une copie
			await this.setGrid(data[2]);
			await this.setTheme(data[3]);
			this.titre = data[0];
			this.ajouterPlage(data[1]);
			return this;
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
			return this;
		}
	}
	// grilleFromArray(array) {
	// 	var resultat = {};
	// 	Grille.proprietes.forEach(propriete => {
	// 		resultat[propriete] = array.shift();
	// 	});
	// 	return resultat;
	// }
	// grilToArray() {
	// 	var resultat = this._grille;
	// 	if (!resultat) {
	// 		return false;
	// 	}
	// 	if (typeof resultat === "string") {
	// 		return resultat;
	// 	}
	// 	resultat = Grille.proprietes.map(propriete => resultat[propriete]);
	// 	return resultat;
	// }
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
		var g = this.gridToArray();
		if (g) {
			resultat.push(g);
		}
		// var th = this._theme;
		// if (th) {
		// 	resultat.push(th);
		// }
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	static fromJson(json) {
		var resultat = new Schedule();
		resultat.fill(json);
		return resultat;
	}
	static fromArray(data) {
		if (typeof data == "string") {
			data = JSON.parse(data);
		}
		var resultat = new Schedule();
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
		s = s.slice(1).split("&");
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
						var plage = new Slot(App.horaire);
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
					return App.loadJson("data/theme/" + this.value + ".json").then(t => {
						App.horaire.appliquerTheme(t);
					});
				}
			}
		};
		return this;
	}
	appliquerGrid(grid) {
		if (grid.typesPlages) {
			Slot.appliquerTypes(grid.typesPlages);
			//			delete grille.typesPlages;
		}
		// DOM.copierProps(grille, this);
	}
	appliquerTheme(theme) {
		var ss = Schedule.stylesheet;
		while (ss.cssRules && ss.cssRules.length) {
			ss.deleteRule(0);
		}
		if (theme.css) {
			for (let selecteur in theme.css) {
				ss.insertRule("div#horaire " + selecteur + " {" + theme.css[selecteur] + "}");
			}
		}
		if (theme.typesPlages) {
			for (let k in theme.typesPlages) {
				ss.insertRule("div.plage[data-type='" + k + "'] {" + theme.typesPlages[k].css + "}");
			}
		}
		Slot.appliquerTypes(theme.typesPlages);
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
	static fromBase64(base64) {
		var resultat = new this();
		resultat.fill(App.decoder(base64));
		return resultat;
	}
	static load() {
		App.horaire = new this();
		Grid.fetch(this.grid_default).then(grid => {
			this._grid = grid;
			this.grids[this.grid_default] = grid;
			App.horaire.appliquerGrid(grid);
			return App.horaire.setGrid(this.grid_default);
		}).then(() => {
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
		this.stylesheet = DOM.initStylesheet();
		this.setEvents();
	}
}
Schedule.init();
