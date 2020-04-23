<template>
  <div id="app">
    <header><img src="./assets/logo_maison_des_horaires.svg" alt=""><h1>La Maison des horaires</h1></header>
    <router-view/>
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans+Condensed:ital@0;1&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');

:root {
  --hue: 180;
  --sat: 30%;
}
html {
  font-family: 'Open Sans', sans-serif;
  font-family: 'Open Sans Condensed', sans-serif;

  height: 100%;
  font-stretch: expanded;
  background-color: hsl(var(--hue), var(--sat), 80%);
  color: hsl(var(--hue), var(--sat), 0%);
}
body {
  height: 100%;
  margin: 0;
}
#app {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  & > header {
    order:-100;
    background-color: hsl(var(--hue), var(--sat), 30%);
    color: hsl(var(--hue), var(--sat), 100%);
    display: flex;
  }
}


</style>
