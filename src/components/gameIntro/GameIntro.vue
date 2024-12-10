<template>
  <div class="intro-wrapper">
    <div class="intro" v-if="!inGame" :class="{animate}">
      <img src="@/assets/img/logo.png" ref="logo">
      <div v-if="serverConnected" class="controls" :class="{show: showControls}">
        <div class="body">
          <button class="button" v-show="step===1" @click.prevent="begin">Начать</button>
          <input ref="name" v-show="step===2" v-model="name" class="item" placeholder="Имя"
                 @keyup.enter="registerPlayer"/>
          <button class="button" v-show="step===2 && name" @click.prevent="registerPlayer">Войти в игру</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import rusname from "@/components/rusname.js";
import toast from '@/mixins/toast.js'

export default {
  mixins: [toast],
  data() {
    return {
      step: 1,
      name: '',
      animate: false,
      showControls: false,
      autostart: true
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
  },
  methods: {
    async begin() {
      return new Promise((accept) => {
        this.step = 2
        setTimeout(() => {
          this.$refs.name.focus()
          this.name = rusname()
          accept()
        }, 100)
      })
    },
    registerPlayer() {
      this.$emit('registerPlayer', this.name)
    },
  },
  async mounted() {
    setTimeout(() => {
      this.animate = true
    }, 500)
    setTimeout(() => {
      this.showControls = true
    }, 1000)
    if (this.autostart) {
      await this.begin()
      this.registerPlayer()
    }
  }
}
</script>
