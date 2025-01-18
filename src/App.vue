<template>
  <RouterView :ws="ws" />
</template>

<script>
import Ws from "./components/ws/Ws.js";

export default {
  data() {
    return {
      ws: new Ws(this.$store)
    }
  }
}
</script>
