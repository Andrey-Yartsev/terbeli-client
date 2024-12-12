<template>
  <div class="game-controls status">
    <template v-if="!inGame">
      {{ readyToPlay.length ? (registeredName + ', выберите соперника') : 'Ожидание сопрника...' }}
    </template>
    <template v-if="inGame">
      <span class="item">
          <b class="player-name" :class="myColorClass">
            {{ registeredName }} <b>(ты)</b>
          </b>
          играет с
          <b class="player-name" :class="opponentColorClass">{{ opponentName }}</b>
        </span>
      <span
          class="item turn-title"
          :class="{ 'bg-red': turnPlayer === 1, 'bg-blue': turnPlayer === 2 }"
      >
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
    readyToPlay() {
      return this.$store.getters['player/readyToPlay']
    },
    myName() {
      return this.$store.state.player.user.name
    },
    myColorClass() {
      if (this.registeredName === this.$store.getters['player/currentPair'][0]) {
        return 'bg-red'
      } else {
        return 'bg-blue'
      }
    },
    opponentColorClass() {
      if (this.registeredName === this.$store.getters['player/currentPair'][0]) {
        return 'bg-blue'
      } else {
        return 'bg-red'
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
