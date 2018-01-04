/*jslint esnext:true, browser:true, debug:true*/
/*globals DOM, Horaire*/
// Ajouter annuler
// toArray
// compression base64
// Ne pas exporter si valeurs par défaut??? pas sur
// Form pour données globales (titre, nbjours...)
class Plage extends DOM {
	constructor(horaire, typePlage, jour, debut, duree, props) {
		super();
		if (horaire!==undefined) {
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
		this.td = null;
		this.trForm = null;
		return this;
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
	//				this.form.obj.redessiner();
	//				form = document.getElementById('formPlage');
	//				form.parentNode.removeChild(form);
					p.editer();
					return;
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
			td: {
				click:function() {
					if (!this.plage) {
						this.plage = new Plage(this.horaire, 'D', this.jour, this.debut, 1);
						this.plage.redessiner();
					}
					this.plage.editer();
					return;
				}
			}
		};
	}
	get htmlClass() {
		return Horaire.types[this.typePlage].htmlClass;
	}
	get css() {
		return Horaire.types[this.typePlage].css;
	}
	get etat() {
		return Horaire.types[this.typePlage].etat;
	}
	html() {
		var resultat, plage;
		resultat = this.createElement('div.plage');
		plage = this.createElement('div.etat', this.etat);
		resultat.appendChild(plage);
		if (this.local) {
			resultat.appendChild(this.createElement('div.local', this.local));
		}
		if (this.texte) {
			resultat.appendChild(this.createElement('div.texte', this.texte));
		}
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
		this.td.classList.add('courant');
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
	afficher() {
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
}
Plage.init();
