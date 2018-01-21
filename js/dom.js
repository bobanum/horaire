/*jslint esnext:true, browser:true, debug:true*/
/*
Classe DOM permettant la manipulation et la création d'éléments
*/
class DOM {
	constructor() {

	}
	init() {

	}
	static init() {

	}
	static createElement(name, content, attributes, events) {
		var resultat, id, classes;
		attributes = attributes || {};
		id = name.match(/#[a-zA-Z0-9\_\-]+/);
		if (id) {
			attributes.id = id[0].substr(1);
			name = name.replace(id[0], '');
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
	createElement() {
		return DOM.createElement.apply(this, arguments);
	}
	static createElementIn(parentNode) {
		var args, element;
		args = Array.prototype.slice.call(arguments, 1);
		element = this.createElement.apply(this, args);
		parentNode.appendChild(element);
		return element;
	}
	createElementIn() {
		return DOM.createElementIn.apply(this, arguments);
	}
	static setClasses(element, classes) {
		var i, n;
		for (i = 0, n = classes.length; i < n; i += 1) {
			element.classList.add(classes[i]);
		}
		return this;
	}
	setClasses() {
		return DOM.setClasses.apply(this, arguments);
	}
	static setAttributes(element, attributes) {
		var k;
		if (!attributes) {
			return this;
		}
		for (k in attributes) {
			element.setAttribute(k, attributes[k]);
		}
		return this;
	}
	setAttributes() {
		return DOM.setAttributes.apply(this, arguments);
	}
	static applyStyle(element, props) {
		var k;
		if (!props) {
			return this;
		}
		for (k in props) {
			element.style[k] = props[k];
		}
		return this;
	}
	applyStyle() {
		return DOM.applyStyle.apply(this, arguments);
	}
	static appendContent(element, content) {
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
	appendContent() {
		return DOM.appendContent.apply(this, arguments);
	}
	static addEventListeners(element, evts) {
		var k;
		if (!evts) {
			return this;
		}
		for (k in evts) {
			element.addEventListener(k, evts[k]);
		}
		return this;
	}
	addEventListeners() {
		return DOM.addEventListeners.apply(this, arguments);
	}
	applyProperties(props) {
		return this.constructor.applyProperties(this, props);
	}
	static applyProperties(obj, props) {
		var p;
		if (!props) {
			return obj;
		}
		for (p in props) {
			obj[p] = props[p];
		}
		return obj;
	}
	static form_wrap(field, l) {
		var champ, i, n;
		champ = this.createElement('div.champ');
		if (l !== undefined) {
			champ.appendChild(this.createElement('label', l, {'for': field.getAttribute('id')}));
		}
		if (field instanceof Array) {
			for (i = 0, n = field.length; i < n; i += 1) {
				champ.appendChild(this.createElement('span', field[i]));
			}
		} else {
			champ.appendChild(this.createElement('span', field));
		}
		return champ;
	}
	form_wrap() {
		return DOM.form_wrap.apply(this, arguments);
	}
}
DOM.init();
