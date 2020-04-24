<template>
    <div class="plage" :style="style">
        <div class="status">{{status.titre}}</div>
        <div class="cours">{{plage.cours}}</div>
        <div class="local">{{plage.local}}</div>
        <div class="extra">{{plage.extra}}</div>
    </div>
</template>

<script>

export default {
    name: 'Plage',
    data() {
        return {
            data: 0,
        };
    },
    props: {
        "plage": {},
    },
    components: {
    },
    mounted() {
    },
    methods: {
        },
    computed: {
        style() {
            var resultat = this.status.style;
            resultat["--jour"] = this.plage.jour + 2;
            resultat["--debut"] = this.plage.debut + 1;
            resultat["--duree"] = this.plage.duree;
            return resultat;
        },
        status() {
            var status = [
                {
                    "titre": "Non disponible", 
                    "style": {"--hue": "0", "--sat": "100%", "--lum": "80%"},
                },
                {
                    "titre": "Sur rendez=vous", 
                    "style": {"--hue": "240", "--sat": "100%", "--lum": "80%"},
                },
                {
                    "titre": "Disponible", 
                    "style": {"--hue": "120", "--sat": "100%", "--lum": "80%"},
                },
                {
                    "titre": "Autre",
                    "style": {"--hue": "0", "--sat": "0%", "--lum": "80%"},
                },
            ];
            return status[this.plage.type];
        }
    },
}
</script>

<style lang="scss">
.plage {
    background-color: hsl(var(--hue), var(--sat), var(--lum));
    color: hsl(var(--hue), var(--sat), calc(50% - var(--lum)));
    grid-column: var(--jour);
    grid-row-start: var(--debut);
    grid-row-end: span var(--duree);
}
</style>

