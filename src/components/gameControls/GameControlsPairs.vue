<template>
  <div class="game-controls pairs" v-if="pairs.length">
    <div class="item"><b>Сейчас играют:</b></div>
    <div class="item player-name" v-for="pair in pairs" :key="pair[0]+pair[1]">
      {{pair[0]}} - {{pair[1]}}
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    pairs() {
      return this.$store.state.player.pairs
    }
  }
}
</script>
