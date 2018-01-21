/*jslint esnext:true, browser:true, debug:true*/
/*globals DOM, Horaire, App*/
// Ajouter annuler
// toArray
// compression base64
// Ne pas exporter si valeurs par défaut??? pas sur
// Form pour données globales (titre, nbjours...)
class Plage extends DOM {
	constructor(horaire) {
		super();
		if (horaire!==undefined) {
			horaire.plages.push(this);
		}
		this.horaire = horaire;
		this._typePlage = "D";
		this._jour = 0;
		this._debut = 0;
		this._duree = 1;
		this.texte = "";
		this.local = "";
		this.td = null;
		this.trForm = null;
	}
	init() {
		var horaire, typePlage, jour, debut, duree, props;
		debugger;
		horaire = window.horaire;

		if (horaire !== undefined) {
			horaire.plages.push(this);
		}
		this.horaire = horaire;
		if (typePlage !== undefined) {
			this.typePlage = typePlage.toUpperCase();	//C=Cours, D=Disponible, R=Sur rendez-vous
		}
		this.jour = jour;
		this.debut = debut;
		this.duree = duree;
		this.texte = "";
		this.local = "";
		if (props !== undefined) {
			for (var i in props) {
				this[i] = props[i];
			}
		}
		this._dom = null;
		this.td = null;
		this.trForm = null;
		return this;
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.html();
			this._dom.obj = this;
		}
		return this._dom;
	}
	get htmlClass() {
		return Horaire.types[this.typePlage].htmlClass;
	}
	get css() {
		debugger;
		return Horaire.types[this.typePlage].css;
	}
	get typePlage() {
//		return this.dom.getAttribute("data-type");
	}
	set typePlage(val) {
//		this.dom.label.innerHTML = Horaire.types[];
		this.dom.setAttribute("data-type", val);
	}
	get etat() {
		return Horaire.types[this.typePlage].etat;
	}
	get debut() {
		return this._debut;
	}
	set debut(val) {
		if (val < 0) {
			val = 0;
		} else if (val > this.horaire.nbPeriodes - 1) {
			val = this.horaire.nbPeriodes - 1;
		}
		if (val + this._duree > this.horaire.nbPeriodes - 2) {
			this.duree = this.horaire.nbPeriodes - val;
		}
		this._debut = val;
		if (this._dom) {
			this._dom.style.gridRowStart = this._debut + 2;
		}
	}
	get duree() {
		return this._duree;
	}
	set duree(val) {
		if (val < 1) {
			val = 1;
		} else if (val + this._debut > this.horaire.nbPeriodes) {
			val = this.horaire.nbPeriodes - this.debut;
		}
		this._duree = val;
		if (this._dom) {
			this._dom.style.gridRowEnd = "span " + this._duree;
		}
	}
	get jour() {
		return this._jour;
	}
	set jour(val) {
		if (val < 0) {
			val = 0;
		} else if (val >= this.horaire.jours.length) {
			val = this.horaire.jours.length - 1;
		}
		this._jour = val;
		if (this._dom) {
			this._dom.style.gridColumnStart = this._jour + 2;
		}
	}
	html() {
		var resultat, plage, bts, bt;
		resultat = this.createElement('div.plage');
		resultat.setAttribute("data-type", this.typePlage);
		if (App.mode === App.MODE_EDITION) {
			bts = resultat.appendChild(this.createElement('span.boutons.debut'));
			bt = bts.appendChild(this.html_btPlusMoins('moins', 0, Plage.evt.debutMoins.click));
			bt = bts.appendChild(this.html_btPlusMoins('plus', 180, Plage.evt.debutPlus.click));
			bts = resultat.appendChild(this.createElement('span.boutons.duree'));
			bt = bts.appendChild(this.html_btPlusMoins('moins', 0, Plage.evt.dureeMoins.click));
			bt = bts.appendChild(this.html_btPlusMoins('plus', 180, Plage.evt.dureePlus.click));
			bt = resultat.appendChild(this.html_btPlusMoins('jour.moins', -90, Plage.evt.jourMoins.click));
			bt = resultat.appendChild(this.html_btPlusMoins('jour.plus', 90, Plage.evt.jourPlus.click));
			resultat.addEventListener("click", Plage.evt.plage.click);
		}
		plage = resultat.appendChild(this.createElement('div.etat', this.etat));
		if (this.local) {
			resultat.appendChild(this.createElement('div.local', this.local));
		}
		if (this.texte) {
			resultat.appendChild(this.createElement('div.texte', this.texte));
		}
		resultat.style.gridRowStart = this.debut + 2;
		resultat.style.gridColumnStart = this.jour + 2;
		resultat.style.gridRowEnd = "span " + this.duree;
		resultat.style.gridColumnEnd = "span " + 1;
		return resultat;
	}
	html_btPlusMoins(classe, angle, evt) {
		var resultat, d, svg;
		d = "m0,-16 32,32 -64,0z";
		svg = '';
		if (Math.abs(angle) === 90) {
			svg += '<svg viewBox="-16 -32 32 64">';
		} else {
			svg += '<svg viewBox="-32 -16 64 32">';
		}
		svg += '<path transform="rotate('+angle+')" d="'+d+'"/>';
		svg += '</svg>';
		resultat = this.createElement('span.bouton.'+classe+'', svg);
		resultat.addEventListener("click", evt);
		resultat.obj = this;
		return resultat;
	}
	dom_form() {
		var resultat;
		resultat = this.createElement('form#formPlage');
		resultat.obj = this;
		this.trForm = resultat;
		resultat.appendChild(this.form_typePlage());
		resultat.appendChild(this.form_jour());
		resultat.appendChild(this.form_debut());
		resultat.appendChild(this.form_duree());
		resultat.appendChild(this.form_local());
		resultat.appendChild(this.form_texte());
		resultat.appendChild(this.form_supprimer());
		return resultat;
	}
	form_typePlage() {
		var select, i;
		select = this.createElement('select#typePlage', null, null, Plage.evt.typePlage);
		for (i in Horaire.types) {
			select.appendChild(this.createElement('option', Horaire.types[i].etat, {'value': i}));
		}
		select.value = this.typePlage;
		select.plage = this;
		return this.form_wrap(select, 'Type');
	}
	form_jour() {
		var select = this.createElement('select#jour', null, null, Plage.evt.jour);
		for (var i = 0, n = this.horaire.jours.length; i < n; i += 1) {
			select.appendChild(this.createElement('option', this.horaire.jours[i], {'value':i}));
		}
		select.value = this.jour;
		select.plage = this;
		return this.form_wrap(select, 'Jour');
	}
	form_debut() {
		var select, horaire, heure, i;
		select = this.createElement('select#debut', null, null, Plage.evt.debut);
		horaire = this.horaire;
		for (i = 0; i < horaire.nbPeriodes; i += 1) {
			heure = horaire.heureDebut+i*(horaire.dureePeriode+horaire.pause);
			select.appendChild(this.createElement('option', this.horaire.min2h(heure), {'value':i}));
		}
		select.value = this.debut;
		select.plage = this;
		return this.form_wrap(select, 'Début');
	}
	form_duree() {
		var select = this.createElement('select#duree', null, null, Plage.evt.duree);
		var horaire = this.horaire;
		select.appendChild(this.createElement('option', '1 période', {'value': 1}));
		for (var i=2; i<=horaire.nbPeriodes; i += 1) {
			select.appendChild(this.createElement('option', i + ' périodes', {'value': i}));
		}
		select.value = this.duree;
		select.plage = this;
		return this.form_wrap(select, 'Durée');
	}
	form_local() {
		var input = this.createElement('input#local', null, {'value': this.local, 'placeholder': 'Local'}, {'change': Plage.evt.local.change, 'keyup': Plage.evt.local.change, 'blur': Plage.evt.local.change});
		input.plage = this;
		return this.form_wrap(input, 'Local');
	}
	form_texte() {
		var input = this.createElement('textarea#texte', this.texte.replace('<br>', '/r/n'), {'placeholder': 'Texte'}, {'change': Plage.evt.texte.change, 'keyup': Plage.evt.texte.change, 'blur': Plage.evt.texte.change});
		input.plage = this;
		return this.form_wrap(input, 'Texte');
	}
	form_supprimer() {
		var input = [];
		input[0] = this.createElement('input#supprimer', null, {'value': 'Supprimer', 'type': 'button'}, Plage.evt.supprimer);
		input[1] = this.createElement('input#dupliquer', null, {'value': 'Dupliquer', 'type': 'button'}, Plage.evt.dupliquer);
		input[0].plage = this;
		input[1].plage = this;
		return this.form_wrap(input);
	}
	changerValeur(prop, val) {
		var courant;
		debugger;
		courant = this.td.classList.contains("courant");
		if (courant) {
			this.td.classList.remove("courant");
		}
		this.masquer();
		this[prop] = val;
		this.afficher();
		if (courant) {
			this.td.classList.add("courant");
		}
	}
	editer() {
		var form, s, i, n;
		form = document.getElementById('formPlage');
		if (form) {
			form.parentNode.removeChild(form);
		}
		document.getElementById('options').appendChild(this.dom_form());
		s = document.getElementsByClassName('courant');
		for (i = 0, n = s.length; i < n; i += 1) {
			s[i].classList.remove('courant');
		}
		this.dom.classList.add('courant');
		this.trForm.style.backgroundColor = '';
	}
	redessiner() {
		this.masquer().afficher();
		return this;
	}
	cells() {
		var resultat;
		resultat = this.horaire.dom.querySelectorAll('tbody>tr>td:nth-child('+(this.jour+2)+')');
		resultat = Array.prototype.slice.call(resultat, this.debut, this.debut + this.duree);
		return resultat;
	}
	zzzafficher() {
		var table, tds, i, td;
		table = this.horaire.dom;
		tds = this.cells();
		td = tds[0];
		td.bak = Array.prototype.concat.call(td.bak || [], td.getAttribute('rowspan') || "1");
		td.setAttribute('rowspan', this.duree);
		this.dom = this.html();
		td.appendChild(this.dom);
		//td.classList.add(this.htmlClass);
		td.bak_style = Array.prototype.concat.call(td.bak || [], td.getAttribute('style') || "");
		this.applyStyle(td, this.css);
		this.td = td;
		this.td.plage = this;
		for (i = 1; i < this.duree; i += 1) {
			td = tds[i];
			td.bak_display = Array.prototype.concat.call(td.bak_display || [], td.style.display);
			td.style.display = 'none';
		}
	}
	masquer() {
		var tds, i, td;
		tds = this.cells();
		td = tds[0];
		while (td.firstChild) {
			td.removeChild(td.firstChild);
		}
//		td.setAttribute("rowspan", td.bak.pop());
		//td.classList.remove(this.htmlClass);
//		td.setAttribute("style", td.bak_style.pop());
		for (i = 1; i < this.duree; i += 1) {
			td = tds[i];
			td.style.display = td.bak_display.pop();
		}
		return this;
	}
	static fromJson(j, horaire) {
		var resultat;
		if (typeof j == "string") {
			j = JSON.parse(j);
		}

		resultat = new Plage(horaire);
		resultat.fromJson(j);
		return resultat;
	}
	fromJson(j) {
		if (typeof j == "string") {
			j = JSON.parse(j);
		}
		if (j.typePlage !== undefined) {
			this.typePlage=j.typePlage;
		}
		if (j.jour !== undefined) {
			this.jour=j.jour;
		}
		if (j.debut !== undefined) {
			this.debut=j.debut;
		}
		if (j.duree !== undefined) {
			this.duree=j.duree;
		}
		if (j.texte !== undefined) {
			this.texte=j.texte;
		}
		if (j.local !== undefined) {
			this.local=j.local;
		}
		return this;
	}
	toJson(stringify) {
		var resultat = {
			typePlage:this.typePlage,
			jour:this.jour,
			debut:this.debut,
			duree:this.duree,
			texte:this.texte,
			local:this.local
		};
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	static fromArray(a, horaire) {
		var resultat;
		if (typeof a == "string") {
			a = JSON.parse(a);
		}
//		???var h = Horaire.fromJson(a);

		resultat = new Plage(horaire);
		resultat.fromArray(a);
		return resultat;
	}
	fromArray(a) {
		if (typeof a == "string") {
			a = JSON.parse(a);
		}
		a = a.concat();
		this.typePlage=a.shift();
		this.jour=a.shift();
		this.debut=a.shift();
		this.duree=a.shift();
		this.texte=a.shift();
		this.local=a.shift();
		return this;
	}
	toArray(stringify) {
		var resultat = [
			this.typePlage,
			this.jour,
			this.debut,
			this.duree,
			this.texte,
			this.local
		];
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	static init() {
		this.evt = {
			typePlage: {
				change:function() {
					this.form.obj.changerValeur('typePlage', this.value);
				}
			},
			jour: {
				change:function() {
					this.form.obj.changerValeur('jour', parseFloat(this.value));
				}
			},
			debut: {
				change:function() {
					this.form.obj.changerValeur('debut', parseFloat(this.value));
				}
			},
			duree: {
				change:function() {
					this.form.obj.changerValeur('duree', parseFloat(this.value));
				}
			},
			local: {
				change:function() {
					this.form.obj.changerValeur('local', this.value);
				}
			},
			texte: {
				change:function() {
					this.form.obj.changerValeur('texte', this.value.replace(/\r\n|\n\r|\r|\n/g, "<br>"));
				}
			},
			supprimer: {
				click:function() {
					var form;
					this.form.obj.masquer();
					this.form.obj.horaire.supprimerPlage(this.form.obj);
					form = document.getElementById('formPlage');
					form.parentNode.removeChild(form);
					return;
				}
			},
			dupliquer: {
				click:function() {
					var p;
					p = this.form.obj.masquer(this.form.obj);
					p = this.form.obj.horaire.dupliquerPlage(this.form.obj);
					p.afficher();
					p.editer();
					return;
				}
			},
			debutMoins: {
				click: function (e) {
					e.stopPropagation();
					this.obj.debut--;
				}
			},
			debutPlus: {
				click: function (e) {
					e.stopPropagation();
					this.obj.debut++;
				}
			},
			dureeMoins: {
				click: function (e) {
					e.stopPropagation();
					this.obj.duree--;
				}
			},
			dureePlus: {
				click: function (e) {
					e.stopPropagation();
					this.obj.duree++;
				}
			},
			jourMoins: {
				click: function (e) {
					e.stopPropagation();
					this.obj.jour--;
				}
			},
			jourPlus: {
				click: function (e) {
					e.stopPropagation();
					this.obj.jour++;
				}
			},
			trForm: {
				mouseover:function() {
					this.plage.trForm.style.boxShadow = '0 0 1em yellow';
				},
				mouseout:function() {
					this.plage.trForm.style.boxShadow = '';
				}
			},
			plage: {
				click:function() {
//					debugger;
					if (this.classList.contains("courant")) {
						this.classList.remove("courant");
					} else {
						this.obj.editer();
					}
//					var courants = [].slice.call(document.querySelectorAll(".courant"),0);
//					courants.forEach((c)=>(c.classList.remove("courant")));
//					this.classList.add("courant");
//					return;
				}
			}
		};
	}
}
Plage.init();
