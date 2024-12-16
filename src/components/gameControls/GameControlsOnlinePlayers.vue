<template>
  <div class="game-controls online" v-if="!opponentName && readyToPlay.length">
    <div class="item"><b>Игроки онлайн</b> (ожидают тебя):</div>
    <div class="item player-name" v-for="name in readyToPlay" :key="name">
      👨 {{ name }}
      <span v-if="registeredName">—
        <a
            href="#"
            @click.prevent="playWith(name)"
        >Играть с ним</a></span>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    readyToPlay() {
      return this.$store.getters['player/readyToPlay']
    },
    registeredName() {
      return this.$store.state.player.user.name
    },
    opponentName() {
      return this.$store.getters['player/opponentName']
    }
  },
  methods: {
    playWith(name) {
      this.$emit('playWith', name)
    }
  }
}
</script>
