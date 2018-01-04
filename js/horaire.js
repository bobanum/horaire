/*jslint esnext:true, browser:true, debug:false*/
/*globals LZString, DOM, Plage*/
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
		this.jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'];
		this.heureDebut = 8*60+0;
		this.nbPeriodes = 11;
		this.dureePeriode = 50;
		this.pause = 5;
		this.plages = [];
		this.hauteur = 5; // La hauteur en pouces de la zone horaire
		return this;
	}
	static init() {
		this.types = {
			'C': {"htmlClass":'cours', etat:'En cours', css: {'background-color':'gold','color':'#A52929'}},
			'D': {"htmlClass":'dispo', etat:'Disponible', css: {'background-color':'lightgreen','color':'darkgreen'}},
			'R': {"htmlClass":'rv', etat:'Disponible sur rendez-vous', css: {'background-color':'lightblue', 'color':'darkblue'}},
			'N': {"htmlClass":'nd', etat:'Non disponible', css: {'background-color':'#ddd','color':'#999'}}
		};
		this.MODE_AFFICHAGE = 0;
		this.MODE_EDITION = 1;
		this.MODE_IMPRESSION = 2;
		this.evt = {
	//		code: {
	//			change:function(e) {
	//				try {
	//					var hh = JSON.parse(this.value);
	//					this.horaire.init().fromJson(hh).redessiner();
	//				} catch (err) {
	//					this.horaire.init().redessiner();
	//					this.horaire.redessiner();
	//				}
	//			},
	//			click:function(e) {
	//				if ((e.metaKey || e.ctrlKey) && e.altKey) {
	//					this.value = Horaire.encoder(this.horaire.toArray(true));
	//					this.select();
	//				} else if (e.metaKey || e.ctrlKey) {
	//					this.value = this.horaire.toJson(true);
	//					this.select();
	//				} else if (e.altKey) {
	//					this.value = this.horaire.toArray(true);
	//					this.select();
	//				}
	//			}
	//		},
			input_titre: {
				input:function() {
					this.form.obj.titre = this.value;
				}
			},
			btn_array: {
				click:function() {
					var resultat, ta;
					resultat = this.form.obj.toArray(true);
					ta = document.getElementById('code');
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_arraycompresse: {
				click:function() {
					var resultat, ta;
					resultat = this.form.obj.toArray(true);
					ta = document.getElementById('code');
					ta.innerHTML = Horaire.encoder(resultat);
					ta.select();
				}
			},
			btn_json: {
				click:function(e) {
					var resultat, ta;
					if (e.shiftKey) {
						ta = document.getElementById('code');
						resultat = JSON.parse(ta.value);
						resultat = Horaire.fromJson(resultat);
						resultat = resultat.toUrl();
						resultat = resultat.replace("index.html", "edition.html");
						window.location = resultat;
					} else {
						resultat = this.form.obj.toJson(true);
						ta = document.getElementById('code');
						ta.innerHTML = resultat;
						ta.select();
					}
				}
			},
			btn_jsoncompresse: {
				click:function() {
					var resultat, ta;
					resultat = this.form.obj.toJson(true);
					ta = document.getElementById('code');
					ta.innerHTML = Horaire.encoder(resultat);
					ta.select();
				}
			},
			btn_adresse: {
				click:function() {
					var resultat, ta;
					resultat = this.form.obj.toUrl();
					ta = document.getElementById('code');
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_lien: {
				click:function() {
					var resultat, ta;
					resultat = this.form.obj.dom_code_lien();
					ta = document.getElementById('code');
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_iframe: {
				click:function() {
					var resultat, ta;
					resultat = this.form.obj.dom_code_iframe();
					ta = document.getElementById('code');
					ta.innerHTML = resultat;
					ta.select();
				}
			},
			btn_redessiner: {
				click:function() {
					var resultat;
					resultat = this.form.obj.toUrl();
					resultat = resultat.replace("index.html", "edition.html");
					window.location = resultat;
				}
			},
			btn_visionner: {
				click:function() {
					var resultat;
					resultat = this.form.obj.toUrl();
					window.location = resultat;
				}
			}
		};
		if (location.href.match(/edition\.html/)) {
			this.mode = this.MODE_EDITION;
		} else if (location.href.match(/impression\.html/)) {
			this.mode = this.MODE_IMPRESSION;
		} else {
			this.mode = this.MODE_AFFICHAGE;
		}
		if (location.search) {
			var d, script;
			d = this.getSearch();
			if (d.session && d.nom) {
				script = DOM.createElement("script", null, {'src': d.session+d.nom+'.js'});
				document.head.appendChild(script);
			} else if (d.h) {
				window.json = this.decoder(d.h);
			}
		}
		window.addEventListener("load", function() {
			var h;
			if (window.json) {
				h = Horaire.fromArray(window.json);
			} else {
				h = new Horaire();
			}
			if (Horaire.mode === Horaire.MODE_AFFICHAGE && window.self !== window.top) {
				document.body.parentNode.classList.add("frame");
			}
			h.afficher();
		});
	}
	get titre() {
		return this._titre;
	}
	set titre(titre) {
		var dom;
		this._titre = titre;
		dom = document.getElementById("affichage_titre");
		if (dom) {
			dom.innerHTML = this._titre;
		}
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
		}
		return this._dom;
	}
	set dom(val) {
		this._dom = val;
		this._dom.obj = this;
	}
	initAffichage() {
		Horaire.mode = Horaire.MODE_AFFICHAGE;
		this.afficher();
	}
	initModif() {
		Horaire.mode = Horaire.MODE_EDITION;
		this.afficher();
	}
	afficher() {
		var iface;
		iface = this.dom_interface(document.body);
		this.dom_panneau(this.dom_horaire(), iface);
		if (Horaire.mode === Horaire.MODE_EDITION) {
			this.dom_panneau(this.dom_options(), iface);
			this.dom_panneau(this.dom_status(), iface);
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
	dom_interface(conteneur) {
		var resultat;
		resultat = this.createElement("div.interface");
		if (conteneur) {
			conteneur.appendChild(resultat);
		}
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
	zzzdom_contenu(conteneur) {
		conteneur = conteneur || this.createElement("div#contenu");
		conteneur.appendChild(this.dom_horaire());
		if (Horaire.mode == Horaire.MODE_EDITION) {
			conteneur.appendChild(this.dom_status());
		}
		return conteneur;
	}
	/**
	 * [[Description]]
	 * @returns {[[Type]]} [[Description]]
	 */
	dom_caption() {
		var caption;
		caption = this.createElement('div.caption#affichage_titre', this.titre);
		return caption;
	}
	dom_cols() {
		var colgroup;
		colgroup = this.createElement('colgroup');
		colgroup.appendChild(this.createElement('col.heures'));
		colgroup.appendChild(this.createElement('col.jour', null, {'span': this.jours.length}));
		colgroup.appendChild(this.createElement('col.heures'));
		return colgroup;
	}
	dom_thead() {
		var thead, tr, i, n;
		thead = this.createElement('thead');
		tr = this.createElement('tr');
		thead.appendChild(tr);
		tr.appendChild(this.createElement('th', '&nbsp;'));
		for (i=0, n=this.jours.length; i < n; i += 1) {
			tr.appendChild(this.createElement('th', this.jours[i]));
		}
		tr.appendChild(this.createElement('th', '&nbsp;'));
		return thead;
	}
	dom_tbody() {
		var tbody, debut, i, np, tr, j, n, td;
		tbody = this.createElement('tbody');
		debut = this.heureDebut;
		for (i=0, np=this.nbPeriodes; i < np; i += 1) {
			tr = this.createElement('tr');
			tbody.appendChild(tr);
			tr.appendChild(this.heures(debut));
			for (j=0, n=this.jours.length; j < n; j += 1) {
				td = this.createElement('td');
				tr.appendChild(td);
				if (Horaire.mode==Horaire.MODE_EDITION) {
					this.addEventListeners(td, Plage.evt.td);
				}
				td.horaire = this;
				td.jour = j;
				td.debut = i;
			}
			tr.appendChild(this.heures(debut));
			debut += this.dureePeriode + this.pause;
		}
		return tbody;
	}
	dom_horaire() {
		var div;
		this.dom = this.dom_table();
		this.gererPlages();
		div = this.createElement("div#horaire", this.dom_caption());
		div.style.height = this.hauteur+'in';
		this.createElementIn(div, "div.grille", this.dom);
		return div;
	}
	dom_table() {
		var table;
		table = this.createElement('table',  null, {'border': '1'});
		if (Horaire.mode === Horaire.MODE_EDITION) {
			table.classList.add('modif');
		}
		table.appendChild(this.dom_cols());
		table.appendChild(this.dom_thead());
		table.appendChild(this.dom_tbody());
		return table;
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
		this.createElementIn(div, "input", null, {'type': 'button', 'value':'JSON'}, Horaire.evt.btn_json);
//		this.createElementIn(div, "input", null, {'type': 'button', 'value':'JSON Compressé'}, Horaire.evt.btn_jsoncompresse);
//		this.createElementIn(div, "input", null, {'type': 'button', 'value':'Array'}, Horaire.evt.btn_array);
		this.createElementIn(div, "input", null, {'type': 'button', 'value':'Compressé'}, Horaire.evt.btn_arraycompresse);
		this.createElementIn(div, "input", null, {'type': 'button', 'value':'Adresse'}, Horaire.evt.btn_adresse);
		this.createElementIn(div, "input", null, {'type': 'button', 'value':'Lien'}, Horaire.evt.btn_lien);
		this.createElementIn(div, "input", null, {'type': 'button', 'value':'iFrame'}, Horaire.evt.btn_iframe);
		div = this.createElementIn(resultat, "div");
		this.createElementIn(div, "input", null, {'type': 'button', 'value':'Redessiner'}, Horaire.evt.btn_redessiner);
		this.createElementIn(div, "input", null, {'type': 'button', 'value':'Visionner'}, Horaire.evt.btn_visionner);
		return resultat;
	}
	dom_code() {
		var resultat = this.createElement('textarea#code', null, {'cols':'60', rows:'10',  'placeholder':"Code (Cliquez sur un bouton ci-dessus pour mettre à jour)"}, Horaire.evt.code);
		resultat.horaire = this;
		return resultat;
	}
	/*codeIframe() {
		var resultat = this.createElement('input#code-iframe', null, {'readonly': true, 'value': this.dom_iframe().outerHTML}, Horaire.evt.codeIframe);
		resultat.horaire = this;
		return resultat;
	}*/
	dom_code_lien() {
		var resultat;
		resultat = '<a href="'+this.toUrl()+'">'+this.titre+'</a>';
		return resultat;
	}
	dom_code_iframe() {
		var resultat;
		resultat = '<iframe style="width:768px;height:469px;border:none;" src="'+this.toUrl()+'"></iframe>';
		return resultat;
	}
	dom_iframe() {
		var resultat, adresse;
		adresse = this.iframe_src();
		resultat = this.createElement('iframe', null, {'src': adresse});
		this.applyStyle(resultat, {'border': 'none', 'width': 768, 'height': 469});
		return resultat;
	}
	dom_options() {
		var resultat;
		resultat = this.createElement("div#options", this.dom_form());
		return resultat;
	}
	dom_form() {
		var resultat;
		resultat = this.createElement('form#formHoraire');
		resultat.obj = this;
		this.trForm = resultat;
		resultat.appendChild(this.dom_form_titre());
		return resultat;
	}
	dom_form_titre() {
		var input;
		input = this.createElement('input#titre', null, {'type': 'text', 'value': this.titre, 'placeholder': 'Titre'}, Horaire.evt.input_titre);
		return this.form_wrap(input, 'Titre');
	}
	toUrl() {
		var url = "";
		url += location.protocol;
		url += "//"+location.host;
		url += location.pathname.split("/").slice(0,-1).join("/")+"/";
		url += "index.html";
		url += "?h=";
		url += Horaire.encoder(this.toArray(true));
		return url;
	}
	heures(debut) {
		var resultat;
		resultat = this.createElement('th');
		resultat.appendChild(this.createElement('div.heureDebut', this.min2h(debut)));
		resultat.appendChild(this.createElement('div'));
		resultat.appendChild(this.createElement('div.heureFin', this.min2h(debut+this.dureePeriode)));
		return resultat;
	}
	min2h(min) {
		var h = "0"+Math.floor(min/60);
		h = h.slice(-2);
		var m = "0"+min%60;
		m = m.slice(-2);
		return h+"h"+m;
	}
	ajouterPlage(plage) {
		this.plages.push(plage);
		plage.horaire = this;
	}
	afficherPlage(plage) {
		plage.afficher();
		return this;
	}
	gererPlages() {
		for (var i=0, n=this.plages.length; i<n; i += 1) {
			this.afficherPlage(this.plages[i]);
		}
	}
	trouverPlage(plage) {
		return this.plages.indexOf(plage);
	}
	dupliquerPlage(plage) {
		var p;
		p = Plage.fromJson(plage.toJson());
		this.ajouterPlage(p);
		return p;
	}
	supprimerPlage(plage) {
		var i;
		i = this.trouverPlage(plage);
		this.plages.splice(i,1);
		return this;
	}
	redessiner() {
		this.dom = this.dom_horaire();
		document.getElementById('code').innerHTML = this.toJson(true);
	}
	static fromJson(j) {
		if (typeof j == "string") {
			j = JSON.parse(j);
		}
		var resultat = new Horaire();
		resultat.fromJson(j);
		return resultat;
	}
	fromJson(j) {
		if (typeof j == "string") {
			j = JSON.parse(j);
		}
		if (j.titre !== undefined) {
			this.titre=j.titre;
		}
		if (j.jours !== undefined) {
			this.jours=j.jours;
		}
		if (j.heureDebut !== undefined) {
			this.heureDebut=j.heureDebut;
		}
		if (j.dureePeriode !== undefined) {
			this.dureePeriode=j.dureePeriode;
		}
		if (j.pause !== undefined) {
			this.pause=j.pause;
		}
		if (j.hauteur !== undefined) {
			this.hauteur=j.hauteur;
		}
		if (j.plages !== undefined) {
			for (var i=0,n=j.plages.length; i<n; i += 1) {
				Plage.fromJson(j.plages[i], this);
			}
		}
		return this;
	}
	toJson(stringify) {
		var resultat = {
			titre:this.titre,
			jours:this.jours,
			heureDebut:this.heureDebut,
			dureePeriode:this.dureePeriode,
			pause:this.pause,
			hauteur:this.hauteur,
			plages:[]
		};
		for (var i=0,n=this.plages.length; i<n; i += 1) {
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
		resultat.fromArray(j);
		return resultat;
	}
	fromArray(j) {
		if (typeof j == "string") {
			j = JSON.parse(j);
		}
		j = j.concat();
		this.titre=j.shift();
		this.jours=j.shift();
		this.heureDebut=j.shift();
		this.dureePeriode=j.shift();
		this.pause=j.shift();
		this.hauteur=j.shift();
		var plages = j.shift();
		for (var i=0,n=plages.length; i<n; i += 1) {
			Plage.fromArray(plages[i], this);
		}
		return this;
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
		for (var i=0,n=this.plages.length; i<n; i += 1) {
			plages.push(this.plages[i].toArray(false));
		}
		resultat.push(plages);
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
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
}
Horaire.init();
