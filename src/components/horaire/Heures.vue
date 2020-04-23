<template>
    <div class="heures">
        <div v-for="h in nombre" :key="h" :style="style(h,1)">
            <span>{{heure(debut + (h-1)*(duree+pause))}}</span><span>{{heure(debut + duree + (h-1)*(duree+pause))}}</span>
        </div>
        <div v-for="h in nombre" :key="h" :style="style(h,-2)">
            <span>{{heure(debut + (h-1)*(duree+pause))}}</span><span>{{heure(debut + duree + (h-1)*(duree+pause))}}</span>
        </div>
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

