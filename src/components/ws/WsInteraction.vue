<script>
import toast from '@/mixins/toast.js'

export default {
  mixins: [toast],
  computed: {
    turnPlayer() {
      return this.$store.state.player.turnPlayer
    },
    registeredName() {
      return this.$store.state.player.user.name
    },
  },
  methods: {
    send(data) {
      this.socket.send(JSON.stringify(data))
    },
    registerPlayer(name) {
      this.send({
        type: 'registerPlayer',
        data: {
          name
        }
      })
    },
    playWith(name) {
      this.send({
        type: 'playWith',
        data: {
          name
        }
      })
    },
    addedRing(pinN) {
      this.send({
        type: 'addedRing',
        data: {
          turnPlayer: this.turnPlayer,
          pinN
        }
      })
    },
    switchPlayer() {
      this.send({
        type: 'switchPlayer'
      })
    },
    leaveGame() {
      this.send({
        type: 'leaveGame'
      })
    },
    win() {
      this.send({
        type: 'win'
      })
    },
    resetRender() {
      this.send({
        type: 'resetRender'
      })
    },
    initWs() {
      this.toast('Установка связи')
      this.socket = new WebSocket(import.meta.env.VITE_SERVER_URL)
      this.socket.onopen = () => {
        this.$store.commit('player/setServerConnected', true)
        this.toast('Связь с сервером установлена')
      }
      this.socket.onerror = () => {
        this.toast('Ошибка соединения с сервером ' + import.meta.env.VITE_SERVER_URL)
      }
      const wsOnMessageActions = {
        serverDisconnect: () => {
          this.$store.commit('player/setServerConnected', false)
        },
        playerRegistered: ({name}) => {
          this.$store.commit('player/setName', name)
        },
        updatePlayersList: list => {
          this.$store.commit('player/setOnlineList', list)
        },
        updatePlayerPairs: pairs => {
          // toast('Пары обновлены')
          this.$store.commit('player/setPairs', pairs)
        },
        startGame: () => {
          // Сервер посылает это событие всем подписчикам, когда кто-то выбрал пару
          this.$store.commit('player/startGame')
        },
        setTurnPlayer: ({turnPlayer}) => {
          if (!this.$store.getters['player/currentPair']) {
            // меняем ходящего игрока только для текущей пары
            return
          }
          this.$store.commit('player/setTurnPlayer', turnPlayer)
        },
        addedRing: ({playerName, turnPlayer, pinN}) => {
          if (!playerName) {
            alert('Ring from unknown')
            return
          }
          if (playerName === this.registeredName) {
            // для себя мы уже поставили
            return
          }
          this.$emit('addedRing', { turnPlayer, pinN })
        },
        leaveGame: () => {
          this.$emit('leaveGame')
        },
        opponentWin: () => {
          this.$emit('opponentWin')
        },
        resetRender: () => {
          this.$emit('resetRender')
        }
      }
      this.socket.onmessage = event => {
        const data = JSON.parse(event.data)
        console.log('[message from server]>>>', data)
        if (!wsOnMessageActions[data.type]) {
          console.log(data)
          //alert('wsOnMessageAction "' + data.type + '" does not exists')
          return
        }
        wsOnMessageActions[data.type](data.data)
      }
    }
  },
  created() {
    this.initWs()
  }
}
</script>