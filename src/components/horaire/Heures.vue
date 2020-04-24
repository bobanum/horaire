<template>
    <div class="heures">
        <div v-for="h1 in nombre" :key="h1" :style="style(h1,col)">
            <span>{{heure(debut + (h1-1)*(duree))}}</span><span>{{heure(debut + h1*duree-pause)}}</span>
        </div>
        <!-- <div v-for="h2 in nombre" :key="h2" :style="style(h2,-2)">
            <span>{{heure(debut + (h2-1)*(duree))}}</span><span>{{heure(debut + h2*duree-pause)}}</span>
        </div> -->
    </div>
</template>

<script>

export default {
    name: "Heures",
    data() {
        return {
            separateur: ":",
        };
    },
    props: {
        debut: {default: 8*60},
        duree: {default: 50},
        pause: {default: 5},
        nombre: {default: 11},
        col: {default: 1}
    },
    components: {
    },
    mounted() {
    },
    methods: {
        heure(minutes) {
            var hrs = "00" + Math.floor(minutes/60);
            var min = "00" + (minutes % 60);
            return hrs.slice(-2) + this.separateur + min.slice(-2);
        },
        style(row, col) {
            return {
                "grid-column": col,
                "grid-row": row + 1
            }
        },
    },
}
</script>

<style lang="scss">
.heures {
    display: contents;
    & > div {
        display: grid;
        font-size: smaller;
        align-content: space-between;
    }
}
</style>

