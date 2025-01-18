<template>
  <GameIntro
      v-if="!registeredName && !introPassed"
      @registerPlayer="registerPlayer"
      @registerPlayerByName="registerPlayerByName"
  />
  <template v-else>
    <GameControls
        :showTouchPutRingButton="showTouchPutRingButton"
        ref="gameControls"
        @playWith="sendPlayWith"
        @leavePlayerGame="leavePlayerGame"
        @newGameWithSameOpponent="newGameWithSameOpponent"
        @touchPutRing="touchPutRing"
        @restart="resetGame"
    />
    <RenderMain
        v-if="inGame"
        :is-touch-device="true"
        ref="renderMain"
        @addedRing="sendAddedRing"
        @setTouchPinPointer="setTouchPinPointer"
        @win="win"
    />
    <!--  &lt;!&ndash; @switchPlayer="sendSwitchPlayer" &#45;&#45; ^ &ndash;&gt;-->
  </template>
  <WsInteraction
      ref="wsInteraction"
      :ws="ws"
      @addedRing="renderPutRing"
      @opponentWin="gameControlsLose"
      @resetGame="_resetGame"
  />
</template>

<script>
import RenderMain from '@/components/render/RenderMain.vue'
import WsInteraction from '@/components/ws/WsInteraction.vue'
import GameControls from '@/components/gameControls/GameControls.vue'
import GameIntro from '@/components/gameIntro/GameIntro.vue'
import toast from '@/mixins/toast.js'

export default {
  components: {GameIntro, GameControls, RenderMain, WsInteraction},
  mixins: [toast],
  props: {
    ws: Object
  },
  data() {
    return {
      debugMode: false,
      socketConnected: false,
      showTouchPutRingButton: false,
    }
  },
  computed: {
    registeredName() {
      return this.$store.state.player.user.name
    },
    introPassed() {
      return this.$store.state.player.introPassed
    },
    gameStarted() {
      return this.$store.state.player.gameStarted
    },
    inGame() {
      return this.$store.getters['player/inGame']
    },
  },
  watch: {
    inGame() {
      setTimeout(() => {
        if (this.$refs.renderMain) {
          this.$refs.renderMain.start()
        }
      }, 100)
    }
  },
  methods: {
    registerPlayer() {
      this.$refs.wsInteraction.registerPlayer()
    },
    registerPlayerByName(name) {
      this.$refs.wsInteraction.registerPlayerByName(name)
    },
    resetGame() {
      this._resetGame()
      this.$refs.wsInteraction.resetGame()
    },
    _resetGame() {
      this.$refs.renderMain.reset()
      this.$store.commit('player/reset')
      this.$refs.gameControls.showWinModal = false
      this.toast('Игра обнулена', {autoClose: 6000})
    },
    leaveGame() {
      this.$refs.wsInteraction.leaveGame()
    },
    leavePlayerGame() {
      this._resetGame()
      this.$refs.wsInteraction.leavePlayerGame()
    },
    sendPlayWith(name) {
      this.$refs.wsInteraction.playWith(name)
    },
    sendAddedRing(pinN) {
      this.$refs.wsInteraction.addedRing(pinN)
    },
    sendSwitchPlayer() {
      this.$refs.wsInteraction.switchPlayer()
    },
    renderPutRing({turnPlayer, pinN}) {
      this.$refs.renderMain.putRingWs(turnPlayer, pinN)
    },
    newGameWithSameOpponent() {
      this.$refs.wsInteraction.resetRender()
      this.$refs.renderMain.finish()
      this.$refs.renderMain.start()
      // this.$refs.wsInteraction.leaveGame()
    },
    win() {
      this.$refs.wsInteraction.win()
      this.gameControlsWin()
    },
    gameControlsWin() {
      this.$refs.gameControls.showWin()
    },
    gameControlsLose() {
      this.$refs.gameControls.showLose()
    },
    setTouchPinPointer(flag) {
      this.showTouchPutRingButton = flag
    },
    touchPutRing() {
      this.$refs.renderMain.touchPutRing()
      this.showTouchPutRingButton = false
    },
    // excludeFromOnline() {
    //   this.$refs.wsInteraction.excludeFromOnline()
    // },
    // includeToOnline() {
    //   this.$refs.wsInteraction.includeToOnline()
    // }
  },
  beforeUnmount() {
    this.leaveGame()
    // this.excludeFromOnline()
  },
  created() {
    // this.socketConnected = this.ws.connected
    // this.ws.onConnect = () => {
    //   this.socketConnected = true
    //   this.registerPlayer()
    // }
  }
};
</script>

<style lang="scss" src="@/assets/css/main.sass"></style>
<style lang="scss" src="vue3-toastify/dist/index.css"></style>