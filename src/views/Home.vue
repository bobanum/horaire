<template>
  <div class="horaire">
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
