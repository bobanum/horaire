/*jslint esnext:true, browser:true, debug:false*/
/*globals DOM, Plage, App*/
// Ajouter annuler
// toArray
// compression base64
// Ne pas exporter si valeurs par défaut??? pas sur
// Form pour données globales (titre, nbjours...)
// Éliminer les variables globales (json, horaire, etc.)
class Horaire extends DOM {
	constructor() {
		super();
		this.init();
	}
	init() {
		this.titre = "Horaire";
		this.jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
		this.heureDebut = 8 * 60 + 0;
		this.nbPeriodes = 11;
		this.dureePeriode = 50;
		this.pause = 5;
		this._plages = [];
		this._grille = null;
		this.hauteur = 5; // La hauteur en pouces de la zone horaire
		return this;
	}
	static trouverNomsJours(lang) {
		var resultat, d;
		lang = lang || this.lang;
		resultat = [];
		d = new Date();
		d.setTime(d.getTime() + (7 - d.getDay()) * 1000 * 60 * 60 * 24);
		for (let i = 0; i < 7; i += 1) {
			let dd = new Date(d.getTime() + i * 1000 * 60 * 60 * 24);
			resultat.push(dd.toLocaleString(lang, {
				weekday: "long"
			}));
		}
		return resultat;
	}
	get titre() {
		return this._titre;
	}
	set titre(titre) {
		var dom;
		this._titre = titre;
		dom = document.getElementById("affichage_titre");
		if (dom) {
			dom.innerHTML = this.html_titre;
		}
	}
	get html_titre() {
		var resultat = this._titre.split("|");
		resultat = resultat.map(t=>"<span>"+t+"</span>");
		resultat = resultat.join("");
		return resultat;
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
		}
		return this._dom;
	}
	get grille() {
		if (!this._grille) {
			this._grille = this.dom_grille();
		}
		return this._grille;
	}
	get plages() {
		return this._plages;
	}
	set plages(plages) {
		plages.forEach(p=>this.ajouterPlage(p));
	}
	initAffichage() {
		App.mode = App.MODE_AFFICHAGE;
		this.afficher();
	}
	initModif() {
		App.mode = App.MODE_EDITION;
		this.afficher();
	}
	afficher() {
		if (App.mode === App.MODE_EDITION) {
			document.body.appendChild(this.dom_interface(document.body));
		} else {
			document.body.appendChild(this.dom);
		}
		return this;
	}
	static getSearch() {
		var resultat, s, i, n, donnee;
		resultat = {};
		s = location.search;
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
	dom_interface() {
		var resultat, panneau;
		resultat = this.createElement("div.interface");
		panneau = resultat.appendChild(this.createElement("header", "<h1><img src=\"images/logo.svg\"/>La maison des horaires</h1>"));
		panneau.style.gridArea = "h";
		panneau = resultat.appendChild(this.createElement("footer", "<p>&copy;</p>"));
		panneau.style.gridArea = "f";
		panneau = this.dom_panneau(this.dom, resultat);
		panneau.style.gridArea = "g";
		panneau = this.dom_panneau(this.dom_options(), resultat);
		panneau.style.gridArea = "o";
		panneau = this.dom_panneau(this.dom_status(), resultat);
		panneau.style.gridArea = "c";
		return resultat;
	}
	dom_panneau(contenu, conteneur) {
		var resultat;
		resultat = this.createElement("section.panneau");
		if (conteneur) {
			conteneur.appendChild(resultat);
		}
		if (contenu) {
			resultat.appendChild(contenu);
		}
		return resultat;
	}
	/**
	 * Retourne la zone d'affichage du titre
	 * @returns {HTMLElement} Un élément div.caption#affichage_titre
	 */
	dom_caption() {
		var caption;
		caption = this.createElement("div.caption#affichage_titre", this.html_titre);
		return caption;
	}
	dom_creer() {
		var resultat;
		resultat = this.createElement("div#horaire", this.dom_caption());
//		resultat.style.height = this.hauteur + "in";
		resultat.appendChild(this.grille);
		return resultat;
	}
	dom_grille() {
		var resultat;
		resultat = document.createElement("div");
		resultat.classList.add("grille");
		resultat.style.gridTemplate = "1.6em repeat(" + this.nbPeriodes + ", 1fr) / 6ch repeat(" + this.jours.length + ", 1fr) 6ch";
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
		var i, n, plage;
		grille.appendChild(this.dom_case("vide", 1, 1));
		grille.appendChild(this.dom_case("vide", 1, this.jours.length + 2));
		for (i = 0, n = this.jours.length; i < n; i += 1) {
			plage = grille.appendChild(this.dom_case("jour", 1, i + 2));
			plage.innerHTML = this.jours[i];
		}
		return this;
	}
	/**
	 * Ajoute les cases dans la grille
	 * @param   {HTMLElement} grille La grille
	 * @returns {Horaire}     this
	 */
	dom_grille_ajouterCases(grille) {
		var j, i, plage;
		for (i = 0; i < this.jours.length; i += 1) {
			for (j = 0; j < this.nbPeriodes; j += 1) {
				plage = grille.appendChild(this.dom_case("case", j + 2, i + 2));
				if (App.mode === App.MODE_EDITION) {
					plage.addEventListener("click", Horaire.evt.plage.click);
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
		for (i = 0; i < 2; i += 1) {
			col = i * (this.jours.length + 1) + 1;
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
	dom_case(classe, r, c, h, l) {
		if (r === undefined) {
			r = "auto";
		}
		if (c === undefined) {
			c = "auto";
		}
		if (h === undefined) {
			h = "auto";
		} else {
			h = h + " span";
		}
		if (l === undefined) {
			l = "auto";
		} else {
			l = l + " span";
		}
		var resultat = document.createElement("div");
		if (classe) {
			resultat.classList.add(classe);
		}
		resultat.style.gridArea = "" + r + " / " + c + " / " + h + " / " + l + "";
		return resultat;
	}
	dom_status() {
		var resultat, form;
		resultat = this.createElement("div#status");
		form = this.createElementIn(resultat, "form");
		form.obj = this;
		form.appendChild(this.dom_status_options());
		form.appendChild(this.dom_code());
		//		form.appendChild(this.dom_codeIframe());
		return resultat;
	}
	dom_status_options() {
		var resultat, div;
		resultat = this.createElement("div.boutons");
		div = this.createElementIn(resultat, "div");
		this.createElementIn(div, "input", null, {
			"type": "button",
			"value": "JSON"
		}, Horaire.evt.btn_json);
		//		this.createElementIn(div, "input", null, {"type": "button", "value":"JSON Compressé"}, Horaire.evt.btn_jsoncompresse);
		//		this.createElementIn(div, "input", null, {"type": "button", "value":"Array"}, Horaire.evt.btn_array);
		this.createElementIn(div, "input", null, {
			"type": "button",
			"value": "Compressé"
		}, Horaire.evt.btn_arraycompresse);
		this.createElementIn(div, "input", null, {
			"type": "button",
			"value": "Adresse"
		}, Horaire.evt.btn_adresse);
		this.createElementIn(div, "input", null, {
			"type": "button",
			"value": "Lien"
		}, Horaire.evt.btn_lien);
		this.createElementIn(div, "input", null, {
			"type": "button",
			"value": "iFrame"
		}, Horaire.evt.btn_iframe);
		div = this.createElementIn(resultat, "div");
		this.createElementIn(div, "input", null, {
			"type": "button",
			"value": "Visionner"
		}, Horaire.evt.btn_visionner);
		return resultat;
	}
	dom_code() {
			var resultat = this.createElement("textarea#code", null, {
				"cols": "60",
				rows: "10",
				"placeholder": "Code (Cliquez sur un bouton ci-dessus pour mettre à jour)"
			}, Horaire.evt.code);
			resultat.horaire = this;
			return resultat;
		}
		/*codeIframe() {
			var resultat = this.createElement("input#code-iframe", null, {"readonly": true, "value": this.dom_iframe().outerHTML}, Horaire.evt.codeIframe);
			resultat.horaire = this;
			return resultat;
		}*/
	dom_code_lien() {
		var resultat;
		resultat = '<a href="' + this.toUrl() + '">' + this.titre + '</a>';
		return resultat;
	}
	dom_code_iframe() {
		var resultat;
		resultat = '<iframe style="width:768px;height:469px;border:none;" src="' + this.toUrl() + '"></iframe>';
		return resultat;
	}
	dom_iframe() {
		var resultat, adresse;
		adresse = this.iframe_src();
		resultat = this.createElement("iframe", null, {
			"src": adresse
		});
		this.applyStyle(resultat, {
			"border": "none",
			"width": 768,
			"height": 469
		});
		return resultat;
	}
	dom_options() {
		var resultat;
		resultat = this.createElement("div#options", this.dom_form());
		return resultat;
	}
	dom_form() {
		var resultat;
		resultat = this.createElement("form#formHoraire");
		resultat.obj = this;
		this.trForm = resultat;
		resultat.appendChild(this.dom_form_titre());
		return resultat;
	}
	dom_form_titre() {
		var input;
		input = this.createElement("input#titre", null, {
			"type": "text",
			"value": this.titre,
			"placeholder": "Titre"
		}, Horaire.evt.input_titre);
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
		if (plage instanceof Plage) {
			this.plages.push(plage);
			plage.horaire = this;
			this.grille.appendChild(plage.dom);
			return this;
		} else if (typeof plage === "object") {
			return this.ajouterPlage(Plage.fromJson(plage, this));
		} else {
			return this.ajouterPlage(JSON.parse(plage));
		}
	}
	afficherPlage(plage) {
		plage.afficher();
		return this;
	}
	gererPlages() {
		for (var i = 0, n = this.plages.length; i < n; i += 1) {
			this.afficherPlage(this.plages[i]);
		}
	}
	trouverPlage(plage) {
		return this.plages.indexOf(plage);
	}
	trouverPlageA(jour, debut, duree) {
		duree = duree || 1;
		if (debut + duree > this.nbPeriodes) {
			return false;
		}
		for (let i = debut; i < debut + duree; i += 1) {
			var plage = this.plages.find((p)=>(p.jour === jour && i >= p.debut && i < p.debut + p.duree));
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
				return {jour: jour, heure: i};
			} else if (plage === false) {
				break;
			} else {
				i = plage.debut + plage.duree - 1;
			}
		}
		//Regarder les autres jours
		for (let j = 1; j < this.jours.length; j += 1) {
			for (let i = 0; i + duree <= this.nbPeriodes; i += 1) {
				let plage = this.trouverPlageA((jour + j) % this.jours.length, i, duree);
				if (plage === true) {
					return {jour: (jour + j) % this.jours.length, heure: i};
				} else if (plage === false) {
					break;
				} else {
					i = plage.debut + plage.duree - 1;
				}
			}
		}
		//Regarder le debut du jour
		for (let i = 0; i + duree <= heure; i += 1) {
			if (plage === true) {
				return {jour: jour, heure: i};
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
		this.plages.splice(i, 1);
		return this;
	}
	static fromJson(j) {
		var resultat = new Horaire();
		resultat.fill(j);
		return resultat;
	}
	fill(j) {
		if (typeof j == "string") {
			return this.fill(JSON.parse(j));
		} else if (j instanceof Array) {
			j = [].slice.call(j, 0);
			this.titre = j.shift();
			this.jours = j.shift();
			this.heureDebut = j.shift();
			this.dureePeriode = j.shift();
			this.pause = j.shift();
			this.hauteur = j.shift();
			this.plages = j.shift();
			return this;
		} else {
			if (j.titre !== undefined) {
				this.titre = j.titre;
			}
			if (j.jours !== undefined) {
				this.jours = j.jours;
			}
			if (j.heureDebut !== undefined) {
				this.heureDebut = j.heureDebut;
			}
			if (j.dureePeriode !== undefined) {
				this.dureePeriode = j.dureePeriode;
			}
			if (j.pause !== undefined) {
				this.pause = j.pause;
			}
			if (j.hauteur !== undefined) {
				this.hauteur = j.hauteur;
			}
			if (j.plages !== undefined) {
				this.plages = j.plages;
			}
			return this;
		}
	}
	toJson(stringify) {
		var resultat = {
			titre: this.titre,
			jours: this.jours,
			heureDebut: this.heureDebut,
			dureePeriode: this.dureePeriode,
			pause: this.pause,
			hauteur: this.hauteur,
			plages: []
		};
		for (var i = 0, n = this.plages.length; i < n; i += 1) {
			resultat.plages.push(this.plages[i].toJson(false));
		}
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	static fromArray(j) {
		if (typeof j == "string") {
			j = JSON.parse(j);
		}
		var resultat = new Horaire();
		App.horaire = resultat;
		resultat.fill(j);
		return resultat;
	}
	toArray(stringify) {
		var resultat = [
			this.titre,
			this.jours,
			this.heureDebut,
			this.dureePeriode,
			this.pause,
			this.hauteur,
		];
		var plages = [];
		for (var i = 0, n = this.plages.length; i < n; i += 1) {
			plages.push(this.plages[i].toArray(false));
		}
		resultat.push(plages);
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	static setEvents() {
		this.evt = {
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
			btn_array: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.toArray(true);
					ta = document.getElementById("code");
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_arraycompresse: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.toArray(true);
					ta = document.getElementById("code");
					ta.innerHTML = App.encoder(resultat);
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
						resultat = this.form.obj.toJson(true);
						ta = document.getElementById("code");
						ta.innerHTML = resultat;
						ta.select();
					}
				}
			},
			btn_jsoncompresse: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.toJson(true);
					ta = document.getElementById("code");
					ta.innerHTML = App.encoder(resultat);
					ta.select();
				}
			},
			btn_adresse: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.toUrl();
					ta = document.getElementById("code");
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_lien: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.dom_code_lien();
					ta = document.getElementById("code");
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_iframe: {
				click: function () {
					var resultat, ta;
					resultat = this.form.obj.dom_code_iframe();
					ta = document.getElementById("code");
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_visionner: {
				click: function () {
					var resultat;
					resultat = this.form.obj.toUrl();
					window.open(resultat);
				}
			}
		};
		return this;
	}

	static initTypes() {
		this.types = {};
		this.stylesheet = document.head.appendChild(document.createElement("style"));
		this.stylesheet.appendChild(document.createTextNode(''));
		this.stylesheet = this.stylesheet.sheet;
		return this;
	}
	static setType(data) {
		this.types[data.id] = data;
		this.stylesheet.insertRule('div.plage[data-type="'+data.id+'"] {}');
		data.regle = this.stylesheet.cssRules[0];
		for (let k in data.css) {
			data.regle.style[k] = data.css[k];
		}
		return data;
	}
	static init() {
		this.lang = window.navigator.language;
		this.initTypes();
		App.loadJson("json/theme_standard.json", function (response) {
			for (let k in response.typesPlages) {
				var type = response.typesPlages[k];
				type.id = k;
				this.setType(type);
			}
		}, this);
		this.setEvents();
		if (location.search) {
			var d, script;
			d = this.getSearch();
			if (d.session && d.nom) {
				script = DOM.createElement("script", null, {
					"src": d.session + d.nom + ".js"
				});
				document.head.appendChild(script);
			} else if (d.h) {
				window.json = App.decoder(d.h);
			}
		}
	}
}
Horaire.init();
