<template>
  <GameIntro
      v-if="!registeredName"
      @registerPlayer="sendRegisterPlayer"
  />
  <GameControls
      v-else
      :showTouchPutRingButton="showTouchPutRingButton"
      ref="gameControls"
      @playWith="sendPlayWith"
      @leaveGame="leaveGame"
      @newGameWithSameOpponent="newGameWithSameOpponent"
      @touchPutRing="touchPutRing"
  />
  <RenderMain
      :is-touch-device="true"
      ref="renderMain"
      @addedRing="sendAddedRing"
      @setTouchPinPointer="setTouchPinPointer"
      @win="win"
  />
  <!--  &lt;!&ndash; @switchPlayer="sendSwitchPlayer" &#45;&#45; ^ &ndash;&gt;-->
  <WsInteraction
      ref="wsInteraction"
      @addedRing="renderPutRing"
      @leaveGame="leaveGame"
      @opponentWin="gameControlsLose"
      @resetRender="resetRender"
  />
</template>

<script>
import RenderMain from "@/components/render/RenderMain.vue";
import WsInteraction from "@/components/ws/WsInteraction.vue";
import GameControls from "@/components/gameControls/GameControls.vue";
import GameIntro from "@/components/gameIntro/GameIntro.vue";

export default {
  components: {GameIntro, GameControls, RenderMain, WsInteraction},
  data() {
    return {
      showTouchPutRingButton: false
    }
  },
  computed: {
    registeredName() {
      return this.$store.state.player.user.name
    },
    startGame() {
      return this.$store.state.player.startGame
    }
  },
  watch: {
    startGame() {
      this.$refs.renderMain.start()
    }
  },
  methods: {
    sendRegisterPlayer(name) {
      this.$refs.wsInteraction.registerPlayer(name)
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
    leaveGame() {
      this.$refs.renderMain.finish()
      this.$refs.wsInteraction.leaveGame()
    },
    newGameWithSameOpponent() {
      this.$refs.wsInteraction.resetRender()
      this.$refs.renderMain.finish()
      this.$refs.renderMain.start()
      // this.$refs.wsInteraction.leaveGame()
    },
    resetRender() {
      this.$refs.renderMain.finish()
      this.$refs.renderMain.start()
      this.$refs.gameControls.hideModal()
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
    }
  }
};
</script>

<style lang="scss" src="@/assets/css/main.sass"></style>
<style lang="scss" src="vue3-toastify/dist/index.css"></style>