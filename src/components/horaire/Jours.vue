<template>
    <div class="jours">
        <div v-for="(jour, j) in jours" :key="j" :style="style(j)">
            <span>{{jour}}</span>
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
        jours: {},
    },
    components: {
    },
    mounted() {
        var d = new Date(4*24*60*60*1000);
        console.log(d.toLocaleString("fr-CA", { weekday: 'long'}));
    },
    computed: {
    },
    methods: {
        style(col) {
            return {
                "grid-row": "1",
                "grid-column": col + 2,
            };
        }
    },
}
</script>

<style lang="scss">
.jours {
    display: contents;
    font-weight: bold;
    text-align: center;
    div {
        padding: .25em 0;
    }
}
</style>

