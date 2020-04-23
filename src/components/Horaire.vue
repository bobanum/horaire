<template>
    <div class="horaire">
        <div class="titre">Horaire de Martin Boudreau</div>
        <div class="grille" :style="style()">
            <jours :jours="jours" />
            <heures :debut="debut" :duree="duree" :pause="pause" :nombre="nombre" />
            <div></div>
            <div></div>
            <div class="tuile" v-for="t in nombre*5" :key="t">{{t}}</div>
        </div>
    </div>
</template>

<script>
import Heures from "./horaire/Heures"
import Jours from "./horaire/Jours"
export default {
    name: "Horaire",
    data() {
        return {
            debut: 8*60,
            duree: 50,
            pause: 5,
            nombre: 11,
            jours : this.nomsJours().slice(1,6),
        };
    },
    props: {
    },
    components: {
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
                "grid-template-rows": "auto repeat("+this.nombre+", 1fr)",
            };
        }
    },
}
</script>

<style lang="scss">
.horaire {
    font-size: 10pt;
    width: 8.5in;
    height: 5.5in;
    display: grid;
    grid-template-rows: auto 1fr;
    line-height: 1;
}
.grille {
    display: grid;
    grid-gap: 1pt;
    background-color: black;
    color: white;
    border: 2pt solid black;
    .tuile {
        background-color: white;
    }
}
</style>

