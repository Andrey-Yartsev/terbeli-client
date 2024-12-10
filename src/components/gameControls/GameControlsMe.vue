<template>
  <div class="game-controls">
    <a href="/how-to-play" class="menu">Как играть</a>
    <div class="me" :style="{
    opacity: serverConnected ? 1 : 0
  }">
      <div class="logo"><img src="@/assets/img/logo.png"></div>
      <div class="status" v-if="!opponentName">
        {{ readyToPlay.length ? (registeredName + ', выберите соперника') : 'Ожидание сопрника...' }}
      </div>
      <template v-if="inGame">
        <!--<button class="button" @click.prevent="leaveGame">Уйти</button>-->
        <button class="button" @click.prevent="restart">Переиграть</button>
      </template>
    </div>
  </div>
</template>

<script>
import rusname from '../rusname.js'
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
      window.location.reload()
    },
    begin() {
      this.step = 2
      setTimeout(() => {
        this.$refs.name.focus()
        this.name = rusname()
      }, 100)
    },
    registerPlayer() {
      this.$emit('registerPlayer', this.name)
    },
    leaveGame() {
      this.$emit('leaveGame')
    },
    newGame() {
      this.$emit('newGame')
    }
  }
}
</script>

<style lang="sass">
.me
  transition: opacity 4s
</style>