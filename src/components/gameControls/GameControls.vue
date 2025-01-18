<template>
  <div class="modal" v-if="showWinModal">
    <div class="content">
      Ты {{ isWin ? 'выиграл' : 'проиграл' }}! Ты <span v-html="whoAmI"></span>
      <button class="button" @click="restart">Играть ещё раз</button>
      <button class="button" @click="leavePlayerGame">Выйти</button>
      <!-- <button>Закрыть и покинуть оппонента</button> -->
    </div>
  </div>
  <div class="game-controls-group">
    <GameControlsHeader
        @registerPlayer="registerPlayer"
        @leavePlayerGame="leavePlayerGame"
        @newGame="newGame"
        @restart="restart"
    />
    <GameControlsStatus/>
    <!-- <div class="game-controls debug"><pre class="item">{{ state }}</pre></div>-->
    <!-- <div class="game-controls debug" style="left:430px"><pre class="item">{{ getters }}</pre></div>-->
    <GameControlsOnlinePlayers @playWith="playWith"/>
  </div>

  <div v-if="showTouchPutRingButton" class="game-controls touch-controls show">
    <button class="button but" @click="touchPutRing">Поставить</button>
  </div>
</template>

<script>
import GameControlsHeader from './GameControlsHeader.vue'
import GameControlsStatus from './GameControlsStatus.vue'
import GameControlsOnlinePlayers from "@/components/gameControls/GameControlsOnlinePlayers.vue";
import GameControlsPairs from "@/components/gameControls/GameControlsHowPlays.vue";
import isTouchDevice from "@/mixins/isTouchDevice.js";

export default {
  components: {GameControlsHeader, GameControlsStatus, GameControlsOnlinePlayers, GameControlsPairs},
  props: {
    showTouchPutRingButton: Boolean
  },
  data() {
    return {
      showWinModal: false,
      isWin: false
    }
  },
  computed: {
    state() {
      return this.$store.state.player
    },
    getters() {
      return this.$store.getters
    },
    registeredName() {
      return this.$store.state.player.user.name
    },
    whoAmI() {
      const currentPair = this.$store.getters['player/currentPair']
      if (!currentPair) {
        return null
      }
      if (this.registeredName === this.$store.getters['player/currentPair'][0]) {
        return '<br><br><span class="bg-red" style="padding:5px">красный</span>'
      } else {
        return '<br><br><span class="bg-blue" style="padding:5px">синий</span>'
      }
    },
    isTouchDevice() {
      return isTouchDevice()
    }
  },
  methods: {
    restart() {
      this.$emit('restart')
      this.showWinModal = false
    },
    registerPlayer(name) {
      this.$emit('registerPlayer', name)
    },
    playWith(name) {
      if (!name) {
        throw new Error('name not defined')
      }
      this.$emit('playWith', name)
    },
    leavePlayerGame() {
      this.$emit('leavePlayerGame')
    },
    showWin() {
      this.showWinModal = true
      this.isWin = true
    },
    showLose() {
      this.showWinModal = true
      this.isWin = false
    },
    hideModal() {
      this.showWinModal = false
      //this.leaveGame()
    },
    newGame() {
      this.showWinModal = false
      this.$emit('newGameWithSameOpponent')
    },
    touchPutRing() {
      this.$emit('touchPutRing')
    }
  }
}
</script>
