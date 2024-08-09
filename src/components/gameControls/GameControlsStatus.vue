<template>
  <div class="game-controls status">
    <template v-if="inGame">
      <span class="item">
          <b class="player-name" :style="'background-color:' + myColor + '; color:#fff'">
            {{ registeredName }} <b>(ты)</b>
          </b>
          играет с
          <b class="player-name" :style="'background-color:' + opponentColor + '; color:#fff'">{{ opponentName }}</b>
        </span>
      <span
          class="item turn-title"
          :style="'background:'+(turnPlayer === 1 ? '#f00' : '#00f' )+';color:#fff'">
        {{ turnTitle }}
      </span>
    </template>
  </div>
</template>

<script>
export default {
  computed: {
    inGame() {
      return this.registeredName && this.opponentName
    },
    registeredName() {
      return this.$store.state.player.user.name
    },
    opponentName() {
      return this.$store.getters['player/opponentName']
    },
    myName() {
      return this.$store.state.player.user.name
    },
    myColor() {
      if (this.registeredName === this.$store.getters['player/currentPair'][0]) {
        return '#f00'
      } else {
        return '#00f'
      }
    },
    opponentColor() {
      if (this.registeredName === this.$store.getters['player/currentPair'][0]) {
        return '#00f'
      } else {
        return '#f00'
      }
    },
    turnPlayer() {
      return this.$store.state.player.turnPlayer
    },
    turnTitle() {
      return this.$store.getters['player/isMyTurn'] ? 'твой ход' : 'не твой ход'
    },
  },
}
</script>
