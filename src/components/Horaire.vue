<template>
    <div class="horaire">
        <div class="titre" v-html="html_titre()"></div>
        <div class="grille" :style="style()">
            <jours :jours="jours" />
            <heures :debut="horaire.grille.debut" :duree="horaire.grille.duree" :pause="horaire.grille.pause" :nombre="horaire.grille.nombre" col="1" />
            <heures :debut="horaire.grille.debut" :duree="horaire.grille.duree" :pause="horaire.grille.pause" :nombre="horaire.grille.nombre" col="-2" />
            <div class="tuile" v-for="t in horaire.grille.nombre*5" :key="t" :style="styleTuile(t)"></div>
            <plage v-for="(plage, j) in horaire.plages" :key="j" :plage="plage"></plage>
        </div>
    </div>
</template>

<script>
import Heures from "./horaire/Heures"
import Jours from "./horaire/Jours"
import Plage from "./horaire/Plage"
export default {
    name: "Horaire",
    data() {
        return {
            jours : this.nomsJours().slice(1,6),
            horaire : {"titre": "Horaire de Martin Boudreau|Hiver 2020", "grille": {"debut":480, "duree":55, "pause":5, "nombre":11}, "plages": [{"type": 2, "jour":0, "debut":5, "duree": 3, "cours": "Intégration Web 3", "local": "D-139"}]}
        };
    },
    props: {
    },
    components: {
        Plage,
        Jours,
        Heures,
    },
    mounted() {
    },
    methods: {
        nomsJours(locale="fr-CA") {
            var jours = [0, 1, 2, 3, 4, 5, 6];
            return jours.map(j => {
                var d = new Date((4 + j) * 24 * 60 * 60 * 1000);
                d = d.toLocaleString(locale, { weekday: 'long'});
                return d[0].toUpperCase() + d.substr(1);
            });
        },
        style() {
            return {
                "grid-template-columns": "auto repeat(5, 1fr) auto",
                "grid-template-rows": "auto repeat("+this.horaire.grille.nombre+", 1fr)",
            };
        },
        styleTuile(t) {
            t -= 1;
            var r = t % this.horaire.grille.nombre;
            t -= r;
            var c = t / this.horaire.grille.nombre
            return {
                "grid-column": c + 2,
                "grid-row": r + 2,
            };
        },
        html_titre() {
            var resultat = this.horaire.titre.split("|").map(part => {
                return "<span>"+part+"</span>";
            }).join("");
            return resultat;
        }

    },
}
</script>

<style lang="scss">
// @import url('https://fonts.googleapis.com/css2?family=Saira+Extra+Condensed:wght@400;700&family=Saira+Semi+Condensed:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,700;1,400;1,700&family=Barlow:ital,wght@0,400;0,700;1,400;1,700&display=swap');
.horaire {
    font-size: 10pt;
    // width: 8.5in;
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    line-height: 1;
    // font-family: 'Saira Semi Condensed', sans-serif;
    // font-family: 'Saira Extra Condensed', sans-serif;
    font-family: 'Barlow', sans-serif;
    // font-family: 'Barlow Condensed', sans-serif;    
    div.titre {
        font-weight: bold;
        font-size: 2em;
        display: grid;
        grid-auto-flow: column;
        justify-content: space-between;
    }
}
.grille {
    display: grid;
    grid-gap: .6pt;
    background-color: #000;
    color: white;
    border: 2pt solid #000;
    .tuile {
        background-color: white;
    }
}
</style>

