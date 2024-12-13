<template>
  <div class="game-controls top">
    <router-link to="/how-to-play" @click.prevent="goHtp" class="menu">Как играть</router-link>
    <div v-if="registeredName" class="my-name">{{ registeredName }}</div>
    <div class="me" :style="{
    opacity: serverConnected ? 1 : 0
  }">
      <div class="logo"><img src="@/assets/img/logo.png"></div>
      <template v-if="inGame">
        <!--<button class="button" @click.prevent="leaveGame">Уйти</button>-->
        <button class="button" @click.prevent="restart">Переиграть</button>
        <button class="button" @click.prevent="leaveGame">Выйти</button>
      </template>
    </div>
  </div>
</template>

<script>
import toast from '@/mixins/toast.js'

export default {
  mixins: [toast],
  data() {
    return {
      step: 1,
      name: ''
    }
  },
  computed: {
    serverConnected() {
      return this.$store.state.player.serverConnected
    },
    inGame() {
      return this.$store.getters['player/inGame']
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
    turnPlayer() {
      return this.$store.state.player.turnPlayer
    },
    turnPlayerName() {
      return this.$store.getters['player/turnPlayerName']
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
    }
  },
  methods: {
    restart() {
      this.$emit('restart')
    },
    leaveGame() {
      this.$emit('leaveGame')
    },
    newGame() {
      this.$emit('newGame')
    },
    goHtp() {
      if (this.inGame) {
        if (confirm('Текущая игра будет закончена. Вы уверены, что хотите перейти?')) {
          this.$router.push('/how-to-play')
        }
      } else {
        this.$router.push('/how-to-play')
      }
    }
  }
}
</script>

<style lang="sass">
.me
  transition: opacity 4s
</style>