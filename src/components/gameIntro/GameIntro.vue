<template>
  <div class="intro-wrapper">
    <div class="intro" v-if="!inGame" :class="{animate}">
      <img src="@/assets/img/logo.png" ref="logo">
      <div v-if="serverConnected" class="controls" :class="{show: showControls}">
        <div class="body">
          <input ref="name" v-model="name" class="item" placeholder="Имя"
                 @keyup.enter="registerPlayerByName"/>
          <button class="button" v-show="name" @click.prevent="registerPlayerByName">Войти в игру</button>
        </div>
      </div>
      <div v-else style="margin-top: 40px">Ожидаем подключение к серверу, подождите</div>
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
      name: '',
      animate: false,
      showControls: false,
      autostart: false
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
    registerPlayerByName() {
      this.$emit('registerPlayerByName', this.name)
    },
    registerPlayer() {
      this.$emit('registerPlayer')
    },
  },
  async mounted() {
    setTimeout(() => {
      this.animate = true
    }, 500)
    setTimeout(() => {
      this.showControls = true
      this.$refs.name.focus()
    }, 1000)
    if (this.autostart) {
      this.registerPlayer()
    }
  }
}
</script>
