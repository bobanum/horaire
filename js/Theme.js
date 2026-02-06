import config from '/config.js';
export default class Theme {
    static loadedThemes = {};
    static properties = {
        slug: "",
        label: "",
        css: {},
        slotTypes: [],
    };
    constructor(json) {
        this.fill(Theme.properties);
        if (json) {
            this.fill(json);
        }
    }
    static fromJson(json, slug) {
        if (slug !== undefined) {
            json.slug = slug;
        }
        return new this(json);
    }
    fill(json) {
        for (const prop in Theme.properties) {
            if (json.hasOwnProperty(prop)) {
                this[prop] = json[prop];
            }
        }
        return this;
    }
    toJson() {
        const result = {};
        for (const prop in Theme.properties) {
            result[prop] = this[prop];
        }
        return result;
    }
    applyTo(to) {
        var ss = to.stylesheet;
        while (ss.cssRules && ss.cssRules.length) {
            ss.deleteRule(0);
        }
        if (this.css) {
            for (let selecteur in this.css) {
                ss.insertRule("div#horaire " + selecteur + " {" + this.css[selecteur] + "}");
            }
        }
        if (this.slotTypes) {
            for (let k in this.slotTypes) {
                ss.insertRule("div.plage[data-type='" + k + "'] {" + this.slotTypes[k].css + "}");
            }
        }
        Slot.appliquerTypes(this.slotTypes);
    }

    static async fetch(slug) {

        try {
            const url = `/data/theme/${slug}.js`;
            const module = await import(url);
            const theme = new Theme(module.default);
            theme.slug = slug;
            this.loadedThemes[slug] = theme;
            return theme;
        } catch (error) {
            console.error("Error fetching Theme data:", error);
            throw error;
        }
    }
    static async fetchList() {
        const url = `${config.apiUrl || ''}/theme`;
        try {
            const response = await fetch(url);
            const json = await response.json();
            for (const slug in json) {
                json[slug] = this.fromJson(json[slug], slug);
            }
            return json;
        } catch (error) {
            console.error("Error fetching Theme list:", error);
            throw error;
        }
    }
    static DOM = {
        select: () => {
            const select = document.createElement("select");
            select.id = "theme";
            this.fetchList().then(themes => {
                for (const theme of Object.values(themes)) {
                    const option = theme.DOM.option();
                    select.appendChild(option);
                }
            }).catch(error => {
                console.error("Error loading themes:", error);
            });
            return select;
        },
    };
    DOM = {
        option: () => {
            const option = document.createElement("option");
            option.value = this.slug;
            option.textContent = this.label || this.slug;
            return option;
        }
    }
}