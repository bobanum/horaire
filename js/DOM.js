/*jslint esnext:true, browser:true, debug:true*/
/**
Classe DOM permettant la manipulation et la création d'éléments
*/
export default class DOM {
	/**
	 * Constructeur
	 */
	constructor() {
		this._dom = null;
	}
	get dom() {
		if (!this._dom) {
			// this._dom = this.dom_creer();
			// this._dom.obj = this;
		}
		return this._dom;
	}
	dom_creer() {
		throw "La methode 'dom_creer' doit être surchargée.";
	}
	/**
	 * Retourne un élément DOM avec un certain contenu, attributs et evenements
	 * @param   {string}             name       La signature emmet de la balise "#", "." et "[]" reconnu
	 * @param   {string|HTMLElement} content    Le contenu de la balise
	 * @param   {object}             attributes	La liste des attributs. A préceance sur le name
	 * @param   {object}             events     Les événements à appliquer
	 * @returns {HTMLElement}        L'élément créé
	 */
	createElement(name, content, attributes, events) {
		var resultat, classes;
		attributes = attributes || {};
		for (let id; id = name.match(/#[a-zA-Z0-9\_\-]+/), id;) {
			attributes.id = id[0].substr(1);
			name = name.replace(id[0], '');
		}
		for (let attr; attr = name.match(/#\[s[^\]]+\]/), attr;) {
			let parts = attr.split("=");
			let k = attr.shift();
			if (attributes[k] !== undefined) {
				continue;
			}
			if (parts.length === 0) {
				attributes[k] = "";
			} else {
				attributes[k] = parts.join("=");
			}
			name = name.replace(attr[0], '');
		}
		classes = name.split('.');
		name = classes.shift();
		resultat = document.createElement(name);
		this.setAttributes(resultat, attributes);
		this.setClasses(resultat, classes);
		this.appendContent(resultat, content);
		this.addEventListeners(resultat, events);
		return resultat;
	}
	/**
	 * Créée un élément comme enfant d'un élément
	 * @param   {HTMLElement} parentNode L'élément dans lequel mettre le nouvel élément.
	 * @returns {HTMLElement} L'élément créé
	 */
	createElementIn(parentNode) {
		var args, element;
		args = Array.from(arguments).slice(1);
		element = this.createElement.apply(this, args);
		parentNode.appendChild(element);
		return element;
	}
	/**
	 * Ajoute des classes à un élément HTML
	 * @param   {object}   element L'élément HTML auquel ajouter les classes
	 * @param   {string[]} classes Un tableau de classes
	 * @returns this
	 */
	setClasses(element, classes) {
		var i, n;
		for (i = 0, n = classes.length; i < n; i += 1) {
			element.classList.add(classes[i]);
		}
		return this;
	}
	/**
	 * Règles les attributs donnés à l'objet
	 * @param   {HTMLElement} element    L'élément HTML à modifier
	 * @param   {object}      attributes Un objet contenant les attributs
	 * @returns this
	 */
	setAttributes(element, attributes) {
		var k;
		if (!attributes) {
			return this;
		}
		for (k in attributes) {
			element.setAttribute(k, attributes[k]);
		}
		return this;
	}
	/**
	 * Transfere les propriétés d'un objet à l'autre de facon récursive (ou non)
	 * @param {object}  from        L'objet qui contient les propriétés
	 * @param {object}  to          L'objet qui recoit les propriétés
	 * @param {integer} recursif=-1 Niveau de récursivité: <0|true=infini; 0|false=non récursif, remplace par l'objet eventuel; >0=nombre de fois (niveaux) ou appliquer la récursivité
	 */
	copierProps(from, to, recursif = true) {
		recursif = (recursif === false) ? 0 : (recursif === true) ? -1 : recursif;
		for (let k in from) {
			let val = from[k];
			if (val === undefined) {
				delete to[k];
			} else if (typeof val !== "object" || val instanceof Array || recursif === 0) {
				to[k] = val;
			} else {
				if (!to[k]) {
					to[k] = {};
				}
				this.copierProps(val, to[k], recursif - 1);
			}
		}
	}
	/**
	 * Ajoute des propriétés CSS à un élément
	 * @param   {HTMLElement} element L'élément HTML à modifier
	 * @param   {object}      props   Un objet de css {nom: valeur}
	 * @returns this
	 */
	applyStyle(element, props) {
		var k;
		if (!props) {
			return this;
		}
		for (k in props) {
			element.style[k] = props[k];
		}
		return this;
	}
	/**
	 * Ajoute un contenu à un élément
	 * @param   {HTMLElement} element L'élément à modifier
	 * @param   {Mixed}       content Le contenu à ajouter
	 * @returns this
	 */
	appendContent(element, content) {
		var i, n;
		if (!content) {
			return this;
		}
		if (content instanceof HTMLElement) {
			element.appendChild(content);
		} else if (content instanceof Array) {
			for (i = 0, n = content.length; i < n; i += 1) {
				this.appendContent(element, content[i]);
			}
		} else {
			element.innerHTML = content.toString();
		}
		return this;
	}
	/**
	 * Ajoute des événements à un objet HTML
	 * @param   {HTMLElement} element L'élément HTML à modifier
	 * @param   {object}      evts    Un objet de fonction {nomEvent: fonction}
	 * @returns this
	 */
	addEventListeners(element, evts) {
		var k;
		if (!evts) {
			return this;
		}
		for (k in evts) {
			element.addEventListener(k, evts[k]);
		}
		return this;
	}
	/**
	 * Retourne le champ final (div) incluant label et le champ
	 * @param   {HTMLElement} field Le champ à envelopper
	 * @param   {string}      label Le label à apposer au champ
	 * @returns {HTMLElement} Le div.champ
	 */
	static form_wrap(field, label) {
		var champ, i, n;
		champ = document.createElement('div');
		champ.classList.add('champ');
		if (label !== undefined) {
			let labelElement = document.createElement('label');
			labelElement.textContent = label;
			labelElement.setAttribute('for', field.getAttribute('id') || field.getAttribute('name'));
			champ.appendChild(labelElement);
		}
		if (field instanceof Array) {
			for (i = 0, n = field.length; i < n; i += 1) {
				let span = document.createElement('span');
				span.appendChild(field[i]);
				champ.appendChild(span);
			}
		} else {
			let span = document.createElement('span');
			span.appendChild(field);
			champ.appendChild(span);
		}
		return champ;
	}
	/**
	 * Ajoute un élément style dans le head pour gérer les nouvelles règles
	 * @returns this
	 */
	static initStylesheet() {
		var stylesheet = document.head.appendChild(document.createElement("style"));
		stylesheet.setAttribute("data-objet", this.name);
		stylesheet.appendChild(document.createTextNode(''));
		return stylesheet.sheet;
	}
	/**
	 * Règle les propriété de classe et les événements
	 */
	static init() {
		["createElement", "createElementIn", "setClasses", "setAttributes",
			"copierProps", "applyStyle", "appendContent", "addEventListeners"]
			.forEach(m => this[m] = this.prototype[m]);
	}
}
DOM.init();

