import Schedule from "./Schedule.js";
import config from '/config.js';
export default class Grid {
    static loadedGrids = {};
    static properties = {
        label: "",
        slug: "",
        startTime: 480, // 8:00 AM in minutes
        slotDuration: 50, // Duration of each period in minutes
        breakDuration: 10, // Break duration in minutes
        slotCount: 10, // Number of slots
        theme: "standard", // Default theme
        slotTypes: [
            { label: "En cours" },
            { label: "Disponible" },
            { label: "Sur rendez-vous" },
            { label: "Non disponible" }
        ]
    };
    constructor(json) {
        // this.fill(Grid.properties);

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
    applyTo(to) {
        if (this.slotTypes) {
            to.appliquerTypes(this.slotTypes);
        }
        return this;
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
        var result = {};
        this.properties.forEach(propriete => {
            result[propriete] = array.shift();
        });
        return result;
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

            if (Grid.loadedGrids[val]) return resolve(Grid.loadedGrids[val]);

            return Grid.fetch(val).then(grid => {
                Grid.loadedGrids[val] = grid;
            }).then(() => {
                return resolve(Grid.loadedGrids[val]);
            });
            // return resolve(App.loadJson(Schedule.url_grid(val)).then(grid => {
            //     Grid.loadedGrids[val] = grid;
            //     return grid;
            // }));
        });
    }
    static url(slug) {
        return `/data/grid/${slug}.js`;
    }
    static async fetch(slug) {
        try {
            if (this.loadedGrids[slug]) {
                return this.loadedGrids[slug];
            }
            const url = this.url(slug);
            const module = await import(url);
            const grid = new Grid(module.default);
            this.loadedGrids[slug] = grid;
            grid.slug = slug;
            return grid;
        } catch (error) {
            console.error("Error fetching Grid data:", error);
            throw error;
        }
    }
    static async fetchList() {
        const url = `${config.apiUrl || ''}/grid`;
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