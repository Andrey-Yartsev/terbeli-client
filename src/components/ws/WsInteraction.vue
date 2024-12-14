<script>
import toast from '@/mixins/toast.js'

export default {
  mixins: [toast],
  props: {
    ws: Object
  },
  created() {
    this.socket = this.ws.socket
    this.ws.emit = (evnt, params) => {
      this.$emit(evnt, params)
    }
  },
  computed: {
    turnPlayer() {
      return this.$store.state.player.turnPlayer
    }
  },
  methods: {
    send(data) {
      this.ws.send(data)
    },
    registerPlayer(name) {
      this.send({
        type: 'registerPlayer'
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
    leavePlayerGame() {
      this.send({
        type: 'leavePlayerGame'
      })
    },
    // excludeFromOnline() {
    //   this.send({
    //     type: 'excludeFromOnline'
    //   })
    // },
    // includeToOnline() {
    //   this.send({
    //     type: 'includeToOnline'
    //   })
    // },
    win() {
      this.send({
        type: 'win'
      })
    },
    resetGame() {
      this.send({
        type: 'resetGame'
      })
    }
  }
}
</script>