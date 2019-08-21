/* jslint esnext:true, browser:true, debug:true */
// TODO Ajouter annuler
// TODO Ne pas exporter si valeurs par défaut??? pas sur
// TODO Form pour données globales (titre, nbjours...)
import DOM from './DOM.js';
import App from './App.js';
export default class Plage extends DOM {
	/**
	 * Constructeur
	 */
	constructor(horaire) {
		super();
		this.horaire = horaire;
		this._jour = 0;
		this._debut = 0;
		this._duree = 1;
		this._texte = '';
		this._local = '';
	}
	get zzzcss() {
		return this.getType(this.typePlage).css;
	}
	get typePlage() {
		return this._dom.getAttribute('data-type');
	}
	set typePlage(val) {
		this.dom.setAttribute('data-type', val);
		this._dom_label.innerHTML = this.getType(val).label;
		if (this.form) {
			this.form.typePlage.value = val;
		}
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
		if (val + this._duree > this.horaire.nbPeriodes) {
			this.duree = this.horaire.nbPeriodes - val;
		}
		this._debut = val;
		if (this._dom) {
			this._dom.style.gridRowStart = this._debut + 2;
		}
		if (this.form) {
			this.form.debut.value = val;
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
			this._dom.style.gridRowEnd = 'span ' + this._duree;
		}
		if (this.form) {
			this.form.duree.value = val;
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
		if (this.form) {
			this.form.jour.value = val;
		}
	}
	get texte() {
		return this._dom_texte.innerHTML.replace(/<br\/>/g, '\r\n');
	}
	set texte(val) {
		val = val.replace(/(?:\r\n|\n\r|\r|\n")/g, '<br/>');
		this._dom_texte.innerHTML = val;
		if (this.form) {
			this.form.texte.innerHTML = val;
		}
	}
	get local() {
		return this._dom_local.innerHTML.replace(/<br\/>/g, '\r\n');
	}
	set local(val) {
		val = val.replace(/(?:\r\n|\n\r|\r|\n")/g, '<br/>');
		this._dom_local.innerHTML = val;
		if (this.form) {
			this.form.local.value = val;
		}
	}
	/**
	 * Retourne le div complet de la plage
	 * @private
	 * @returns {HTMLElement} Un élément div.plage
	 */
	dom_creer() {
		var resultat;
		var typePlage = 'C';
		resultat = this.createElement('div.plage');
		resultat.setAttribute('data-type', typePlage);
		// TODO Déplacer vers la classe App
		if (App.mode === App.MODE_EDITION) {
			resultat.addEventListener('click', this.evt.plage.click);
		}
		this._dom_label = resultat.appendChild(this.createElement('div.etat', ''));
		this._dom_local = resultat.appendChild(this.createElement('div.local', ''));
		this._dom_texte = resultat.appendChild(this.createElement('div.texte', ''));
		resultat.style.gridRowStart = this.debut + 2;
		resultat.style.gridColumnStart = this.jour + 2;
		resultat.style.gridRowEnd = 'span ' + this.duree;
		resultat.style.gridColumnEnd = 'span ' + 1;
		return resultat;
	}
	html_btsPlage() {
		var resultat, bts;
		resultat = this.createElement('div.boutonsPlage');
		bts = resultat.appendChild(this.createElement('span.heure.debut'));
		bts.appendChild(this.html_btPlusMoins('moins', 0, this.evt.debutMoins.click));
		bts.appendChild(this.html_btPlusMoins('plus', 180, this.evt.debutPlus.click));
		bts = resultat.appendChild(this.createElement('span.heure.duree'));
		bts.appendChild(this.html_btPlusMoins('moins', 0, this.evt.dureeMoins.click));
		bts.appendChild(this.html_btPlusMoins('plus', 180, this.evt.dureePlus.click));
		bts = resultat.appendChild(this.createElement('span.jour.moins'));
		bts.appendChild(this.html_btPlusMoins('jour.moins', -90, this.evt.jourMoins.click));
		bts = resultat.appendChild(this.createElement('span.jour.plus'));
		bts.appendChild(this.html_btPlusMoins('jour.plus', 90, this.evt.jourPlus.click));
		bts = resultat.appendChild(this.createElement('span.supprimer'));
		bts.appendChild(this.html_btTrash(this.evt.supprimer.click));
		bts = resultat.appendChild(this.createElement('span.dupliquer'));
		bts.appendChild(this.html_btDup(this.evt.dupliquer.click));
		return resultat;
	}
	html_btPlusMoins(classe, angle, evt) {
		var resultat, d, svg;
		d = 'm0,-16 32,32 -64,0z';
		svg = '';
		if (Math.abs(angle) === 90) {
			svg += '<svg viewBox="-16 -32 32 64">';
		} else {
			svg += '<svg viewBox="-32 -16 64 32">';
		}
		svg += '<path transform="rotate(' + angle + ')" d="' + d + '"/>';
		svg += '</svg>';
		resultat = this.createElement('span.bouton.' + classe + '', svg);
		resultat.addEventListener('click', evt);
		resultat.obj = this;
		return resultat;
	}
	html_btTrash(evt) {
		var resultat, d, svg;
		d = 'M 5,0 V 1 H 0 V 3 H 1 V 2 h 10 v 1 h 1 V 1 H 7 V 0 Z M 2,3 v 9 h 8 V 3 H 8 v 8 H 7 V 3 H 5 v 8 H 4 V 3 Z';
		svg = '';
		svg += '<svg viewBox="0 0 12 12" width="12" height="12">';
		svg += '<path d="' + d + '"/>';
		svg += '</svg>';
		resultat = this.createElement('span.bouton.trash', svg);
		resultat.addEventListener('click', evt);
		resultat.obj = this;
		return resultat;
	}
	html_btDup(evt) {
		var resultat, d, svg;
		d = 'M 0,0 V 10 H 3 V 9 H 1 V 1 H 6 L 5,0 Z m 4,2 v 10 h 8 V 5 L 9,2 Z m 1,1 h 3 v 3 h 3 v 5 H 5 Z M 9,3.4140625 10.585938,5 H 9 Z';
		svg = '';
		svg += '<svg viewBox="0 0 12 12" width="12" height="12">';
		svg += '<path d="' + d + '"/>';
		svg += '</svg>';
		resultat = this.createElement('span.bouton.trash', svg);
		resultat.addEventListener('click', evt);
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
		resultat.appendChild(this.form_actions());
		return resultat;
	}
	form_typePlage() {
		var select, i;
		select = this.createElement('select#typePlage', null, null, this.evt.typePlage);
		for (i in this.horaire.types) {
			select.appendChild(this.createElement('option', this.getType(i).label, { 'value': i }));
		}
		select.value = this.typePlage;
		select.plage = this;
		return this.form_wrap(select, 'Type');
	}
	form_jour() {
		var select = this.createElement('select#jour', null, null, this.evt.jour);
		for (var i = 0, n = this.horaire.jours.length; i < n; i += 1) {
			select.appendChild(this.createElement('option', this.horaire.jours[i], { 'value': i }));
		}
		select.value = this.jour;
		select.plage = this;
		return this.form_wrap(select, 'Jour');
	}
	form_debut() {
		var select, horaire, heure, i;
		select = this.createElement('select#debut', null, null, this.evt.debut);
		horaire = this.horaire;
		for (i = 0; i < horaire.nbPeriodes; i += 1) {
			heure = horaire.heureDebut + i * (horaire.dureePeriode + horaire.pause);
			select.appendChild(this.createElement('option', this.horaire.min2h(heure), { 'value': i }));
		}
		select.value = this.debut;
		select.plage = this;
		return this.form_wrap(select, 'Début');
	}
	form_duree() {
		var select = this.createElement('select#duree', null, null, this.evt.duree);
		var horaire = this.horaire;
		select.appendChild(this.createElement('option', '1 période', { 'value': 1 }));
		for (var i = 2; i <= horaire.nbPeriodes; i += 1) {
			select.appendChild(this.createElement('option', i + ' périodes', { 'value': i }));
		}
		select.value = this.duree;
		select.plage = this;
		return this.form_wrap(select, 'Durée');
	}
	form_local() {
		var input = this.createElement('input#local', null, { 'value': this.local, 'placeholder': 'Local' }, { 'change': this.evt.local.change, 'keyup': this.evt.local.change, 'blur': this.evt.local.change });
		input.plage = this;
		return this.form_wrap(input, 'Local');
	}
	form_texte() {
		var input = this.createElement('textarea#texte', this.texte.replace(/<br\s*\/?>/g, '\r\n'), { 'placeholder': 'Texte', cols: 20, rows: 5 }, { 'change': this.evt.texte.change, 'keyup': this.evt.texte.change, 'blur': this.evt.texte.change });
		input.plage = this;
		return this.form_wrap(input, 'Texte');
	}
	form_actions() {
		var input = [
			this.createElement('input#supprimer', null, { 'value': 'Supprimer', 'type': 'button' }, this.evt.supprimer),
			this.createElement('input#dupliquer', null, { 'value': 'Dupliquer', 'type': 'button' }, this.evt.dupliquer),
			// this.createElement('input#accepter', null, {'value': 'Accepter', 'type': 'button'}, this.evt.accepter),
			this.createElement('input#annuler', null, { 'value': 'Annuler', 'type': 'button' }, this.evt.annuler),
		];
		input.forEach(i => (i.plage = this));
		return this.form_wrap(input);
	}
	setProperty(prop, val) {
		this[prop] = val;
		return this;
	}
	editer() {
		this.deposerTout();
		this.form = document.getElementById('options').appendChild(this.dom_form());
		this.bkp = this.toJson();
		this._dom.classList.add('courant');
		this._dom.appendChild(this.html_btsPlage());
	}
	deposer() {
		delete this.bkp;
		this._dom.classList.remove('courant');
		this.form.parentNode.removeChild(this.form);
		this._dom.removeChild(this._dom.lastChild);
		return this;
	}
	supprimer() {
		this.deposer();
		this.horaire.supprimerPlage(this);
		this._dom.parentNode.removeChild(this._dom);
		return this;
	}
	dupliquer() {
		var p, t, j;
		this.deposer();
		t = this.horaire.trouverTrou(this.jour, this.debut + this.duree, this.duree);
		j = this.toJson();
		p = Plage.fromJson(j, this.horaire);
		p.jour = t.jour;
		p.debut = t.heure;
		this.horaire.ajouterPlage(p);
		p.editer();
	}
	annuler() {
		this.fill(this.bkp);
		this.deposer();
	}
	deposerTout() {
		var plage;
		while ((plage = document.querySelector('.courant'))) {
			plage.obj.deposer();
		}
		return this;
	}
	/**
	 * Retourne un nouvel objet en utilisant le json donné
	 * @param   {object}  json    Le JSON à traiter
	 * @param   {Horaire} horaire L'objet Horaire auquel associer cet objet Plage
	 * @returns {Plage}   La nouvelle Plage
	 */
	static fromJson(json, horaire) {
		var resultat;
		resultat = new Plage(horaire);
		resultat.fill(json);
		return resultat;
	}
	fill(j) {
		if (typeof j === 'string') {
			return this.fill(JSON.parse(j));
		} else if (j instanceof Array) {
			j = [].slice.call(j, 0);
			this.typePlage = j.shift();
			this.jour = j.shift();
			this.debut = j.shift();
			this.duree = j.shift();
			this.texte = j.shift();
			this.local = j.shift();
			return this;
		} else {
			if (j.typePlage !== undefined) {
				this.typePlage = j.typePlage;
			}
			if (j.jour !== undefined) {
				this.jour = j.jour;
			}
			if (j.debut !== undefined) {
				this.debut = j.debut;
			}
			if (j.duree !== undefined) {
				this.duree = j.duree;
			}
			if (j.texte !== undefined) {
				this.texte = j.texte;
			}
			if (j.local !== undefined) {
				this.local = j.local;
			}
			return this;
		}
	}
	toJson(stringify) {
		var resultat = {
			typePlage: this.typePlage,
			jour: this.jour,
			debut: this.debut,
			duree: this.duree,
			texte: this.texte,
			local: this.local
		};
		if (stringify !== false) {
			return JSON.stringify(resultat);
		}
		return resultat;
	}
	static fromArray(a, horaire) {
		var resultat;
		if (typeof a === 'string') {
			a = JSON.parse(a);
		}
		// ???var h = Horaire.fromJson(a);

		resultat = new Plage(horaire);
		resultat.fill(a);
		return resultat;
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
	setType(id, data) {
		if (!id || id === 'defaut') {
			this.copierProps(data, this.defaut);
			return;
		}
		if (!this.types[id]) {
			this.types[id] = Object.create(this.defaut);
		}
		data.id = id;
		this.copierProps(data, this.types[id]);
		return data;
	}
	getType(id) {
		if (this.types[id]) {
			return this.types[id];
		} else {
			return this.defaut;
		}
	}
	static appliquerTypes(types) {
		if (types instanceof Array) {
			types.forEach(function (t) {
				let k = t.id;
				delete t.id;
				this.prototype.setType(k, t);
			}, this);
		} else {
			for (let k in types) {
				let t = types[k];
				delete t.id;
				this.prototype.setType(k, t);
			}
		}
	}
	static setEvents() {
		this.prototype.evt = {
			typePlage: {
				change: function() {
					this.form.obj.setProperty('typePlage', this.value);
				}
			},
			jour: {
				change: function() {
					this.form.obj.setProperty('jour', parseFloat(this.value));
				}
			},
			debut: {
				change: function() {
					this.form.obj.setProperty('debut', parseFloat(this.value));
				}
			},
			duree: {
				change: function() {
					this.form.obj.setProperty('duree', parseFloat(this.value));
				}
			},
			local: {
				change: function() {
					this.form.obj.setProperty('local', this.value);
				}
			},
			texte: {
				change: function() {
					this.form.obj.setProperty('texte', this.value.replace(/\r\n|\n\r|\r|\n/g, '<br>'));
				}
			},
			supprimer: {
				click: function(e) {
					e.stopPropagation();
					if (confirm('Voulez-vous vraiment supprimer cette plage horaire ?')) {
						var obj = this.obj || this.form.obj;
						obj.supprimer();
					}
				}
			},
			dupliquer: {
				click: function(e) {
					e.stopPropagation();
					var obj = this.obj || this.form.obj;
					obj.dupliquer();
				}
			},
			accepter: {
				click: function(e) {
					e.stopPropagation();
					var obj = this.obj || this.form.obj;
					obj.deposer();
				}
			},
			annuler: {
				click: function(e) {
					e.stopPropagation();
					var obj = this.obj || this.form.obj;
					obj.annuler();
				}
			},
			debutMoins: {
				click: function (e) {
					e.stopPropagation();
					var obj = this.obj;
					var diff = obj.debut;
					if (obj.debut === 0) {
						return;
					}
					if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
						obj.debut -= diff;
						obj.duree += diff;
					} else if (e.shiftKey) {
						obj.debut = 0;
					} else if (e.ctrlKey || e.metaKey) {
						obj.debut--;
						obj.duree++;
					} else {
						obj.debut--;
					}
				}
			},
			debutPlus: {
				click: function (e) {
					e.stopPropagation();
					var obj = this.obj;
					var diff = obj.horaire.nbPeriodes - obj.debut - obj.duree;
					if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
						obj.debut += obj.duree - 1;
						obj.duree = 1;
					} else if (e.shiftKey) {
						obj.debut += diff;
					} else if (e.ctrlKey || e.metaKey) {
						obj.duree--;
						obj.debut++;
					} else {
						obj.debut++;
					}
				}
			},
			dureeMoins: {
				click: function (e) {
					e.stopPropagation();
					var obj = this.obj;
					if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
						obj.duree = 1;
					} else if (e.shiftKey) {
						obj.debut = 0;
					} else if (e.ctrlKey || e.metaKey) {
						if (obj.debut === 0) {
							obj.duree--;
						} else {
							obj.debut--;
						}
					} else {
						obj.duree--;
					}
				}
			},
			dureePlus: {
				click: function (e) {
					e.stopPropagation();
					var obj = this.obj;
					var diff = obj.horaire.nbPeriodes - obj.debut - obj.duree;
					if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
						obj.duree += diff;
					} else if (e.shiftKey) {
						obj.debut += diff;
					} else if (e.ctrlKey || e.metaKey) {
						obj.debut++;
					} else {
						obj.duree++;
					}
				}
			},
			jourMoins: {
				click: function (e) {
					e.stopPropagation();
					var obj = this.obj;
					if (e.shiftKey) {
						obj.jour = 0;
					} else {
						obj.jour--;
					}
				}
			},
			jourPlus: {
				click: function (e) {
					e.stopPropagation();
					var obj = this.obj;
					if (e.shiftKey) {
						obj.jour = obj.horaire.nbJours - 1;
					} else {
						obj.jour++;
					}
				}
			},
			trForm: {
				mouseover: function() {
					this.plage.trForm.style.boxShadow = '0 0 1em yellow';
				},
				mouseout: function() {
					this.plage.trForm.style.boxShadow = '';
				}
			},
			plage: {
				click: function() {
					if (this.classList.contains('courant')) {
						this.obj.deposer();
					} else {
						this.obj.editer();
					}
				}
			}
		};
	}
	static init() {
		this.prototype.defaut = {};	// Les propriétés par défaut d'une plage.
		this.prototype.types = {};	// {Object}. Les types de plage
		this.stylesheet = this.initStylesheet();
		this.setEvents();
	}
}
Plage.init();
