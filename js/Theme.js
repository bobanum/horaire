import config from '/config.js';
export default class Theme {
    static properties = {
        slug: "",
        label: "",
        css: {},
        typesPlages: [],
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
    static async fetch(slug) {
        const url = `${config.apiUrl || ''}/data/grid/${slug}.json`;
        try {
            const response = await fetch(url);
            const json = await response.json();
            json.slug = slug;
            return this.fromJson(json);
        } catch (error) {
            console.error("Error fetching Theme data:", error);
            throw error;
        }
    }
    static async fetchList() {
        const url = `${config.apiUrl || ''}/api.php?list=theme&full`;
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