<template>
  <div class="home">
    <div class="volet">
      <horaire/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Horaire from "@/components/Horaire";
export default {
  name: 'Home',
  components: {
    Horaire
  }
}
</script>

<style lang="scss">
  .volet {
    background-color: white;
    color: black;
    padding: 0.5in;
    width: 8.5in;
    height: 5.5in;
    box-sizing: border-box;
  }
</style>
