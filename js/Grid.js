import Schedule from "./Schedule.js";
import config from '/config.js';
export default class Grid {
    static properties = {
        label: "",
        slug: "",
        jours: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
        heureDebut: 480, // 8:00 AM in minutes
        dureePeriode: 50, // Duration of each period in minutes
        pause: 10, // Break duration in minutes
        hauteur: 5, // Height of each time slot
        theme: "standard", // Default theme
        typesPlages: [
            { label: "En cours" },
            { label: "Disponible" },
            { label: "Sur rendez-vous" },
            { label: "Non disponible" }
        ]
    };
    constructor(json) {
        this.fill(Grid.properties);

        if (json) {
            this.fill(json);
        }
    }
    static fromJson(json, slug) {
        if (slug !== undefined) {
            json.slug = slug;
        }
        return new Grid().fill(json);
    }
    fill(json) {
        for (const prop in Grid.properties) {
            if (json.hasOwnProperty(prop)) {
                this[prop] = json[prop];
            }
        }
        return this;
    }
    toJson() {
        const result = {};
        for (const prop of Grid.properties) {
            result[prop] = this[prop];
        }
        return result;
    }
    static fromArray(array) {
        var resultat = {};
        this.properties.forEach(propriete => {
            resultat[propriete] = array.shift();
        });
        return resultat;
    }
    toArray() {
        var result = Grid.properties.map(propriete => this[propriete]);
        return result;
    }

    static parse(val) {
        return new Promise(resolve => {
            if (!val) return resolve(false);

            if (val instanceof Array) return resolve(this.fromArray(val));

            if (typeof val === "object") return resolve(val);

            if (Schedule.grids[val]) return resolve(Schedule.grids[val]);
            
            return resolve(App.loadJson(Schedule.url_grid(val)).then(grid => {
                Schedule.grids[val] = grid;
                return grid;
            }));
        });
    }
    static async fetch(slug) {
        const url = `/data/grid/${slug}.json`;
        try {
            const response = await fetch(url);
            const json = await response.json();
            return Grid.fromJson(json);
        } catch (error) {
            console.error("Error fetching Grid data:", error);
            throw error;
        }
    }
    static async fetchList() {
        const url = `${config.apiUrl || ''}/api.php?list=grid&full`;
        try {
            const response = await fetch(url);
            const json = await response.json();
            for (const slug in json) {
                json[slug] = this.fromJson(json[slug], slug);
            }
            return json;
        } catch (error) {
            console.error("Error fetching Grid list:", error);
            throw error;
        }
    }
    static DOM = {
        select: () => {
            const select = document.createElement("select");
            select.id = "grid";
            // select.addEventListener("input", e => {
            //     this.setTheme(e.target.value);
            // });
            this.fetchList().then(grids => {
                for (const slug in grids) {
                    const grid = grids[slug];
                    const option = grid.DOM.option();
                    select.appendChild(option);
                }
            }).catch(error => {
                console.error("Error loading grids:", error);
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
    };
}