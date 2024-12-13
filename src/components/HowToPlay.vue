<template>
  <div class="game-controls-group">
    <div class="game-controls top">
      <div class="me">
        <router-link to="/" class="menu">В игру</router-link>
        <div class="logo"><img src="@/assets/img/logo.png"></div>
        <button class="button" @click.prevent="restart">Заново</button>
      </div>
    </div>
    <div class="game-controls status">
      <span v-if="lessonsOver">Уроки закончились</span>
      <span v-if="!lessonsOver">Урок №{{ lessonN }}</span>
      <span class="item turn-title" :class="turnTitleClass">ходит {{ color }}</span>
    </div>
  </div>
  <RenderMain ref="render" :showPinDigits="false" :demoMode="true"/>
</template>

<script>
import RenderMain from '@/components/render/RenderMain.vue'
import toast from '@/mixins/toast.js'

const sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  mixins: [toast],
  components: {RenderMain},
  data() {
    return {
      lessonsOver: false,
      onlyLesson: 0,
      hideTurnTitle: false,
      lessonN: 1,
      stopped: false
    }
  },
  methods: {
    async start() {
      await this.lesson(this.lessonN)
    },
    resetScreen() {
      this.hideTurnTitle = false
      this.lessonsOver = false
      this.render.reset()
    },
    restart() {
      this.lessonN = 1
      this.resetScreen()
      this.start()
    },
    async put(pinN) {
      if (this.stopped) {
        return
      }
      if (this.render.isWin) {
        this.toast(this.color + ' пытался сходить после победы')
        return
      }
      this.render.putRing(pinN)
      this.$store.commit('player/switchPlayerN')
      await sleep(700)
    },
    async lesson(n) {
      if (this.stopped) {
        return
      }
      if (!this.onlyLesson && !this['v' + n]) {
        this.toast('Уроки закончились')
        this.lessonsOver = true
        this.hideTurnTitle = true
        return
      }
      this.resetScreen()
      this.$store.commit('player/setTurnPlayer', 1)
      await this['v' + n]()
      if (this.stopped) {
        return
      }
      this.hideTurnTitle = true
      if (this.onlyLesson) {
        return
      }
      const lessonDelay = 5
      //await sleep(2000)
      this.toast('Через ' + lessonDelay + 'с. начнётся следущий урок')
      await sleep(lessonDelay * 1000)
      this.lessonN++
      this.resetScreen()
      this.start()
    },
    async v1() {
      await this.put(13)
      await this.put(9)
      await this.put(14)
      await this.put(9)
      await this.put(15)
      await this.put(9)
      await this.put(16)
    },
    async v2() {
      await this.put(13)
      await this.put(9)
      await this.put(10)
      await this.put(9)
      await this.put(7)
      await this.put(9)
      await this.put(4)
    },
    async v3() {
      await this.put(13)
      await this.put(9)
      await this.put(13)
      await this.put(9)
      await this.put(13)
      await this.put(9)
      await this.put(13)
    },
    async v4() {
      await this.put(13)
      await this.put(14)
      await this.put(14)
      await this.put(15)
      await this.put(9)
      await this.put(15)
      await this.put(15)
      await this.put(16)
      await this.put(16)
      await this.put(16)
      await this.put(16)
    },
    async v5() {
      await this.put(13)
      await this.put(13)
      await this.put(14)
      await this.put(14)
      await this.put(15)
      await this.put(15)
      await this.put(11)
      await this.put(16)
      await this.put(11)
      await this.put(16)
    },
    async v6() {
      await this.put(13)
      await this.put(10)
      await this.put(7)
      await this.put(7)
      await this.put(10)
      await this.put(5)
      await this.put(7)
      await this.put(2)
      await this.put(1)
      await this.put(4)
      await this.put(4)
      await this.put(4)
      await this.put(4)
    },
  },
  computed: {
    turnPlayer() {
      return this.$store.state.player.turnPlayer
    },
    color() {
      return this.turnPlayer === 1 ? 'красный' : 'синий'
    },
    colorClass() {
      return this.turnPlayer === 1 ? 'bg-red' : 'bg-blue'
    },
    turnTitleClass() {
      const r = {}
      r[this.colorClass] = true
      r['hide'] = this.hideTurnTitle
      return r
    }
  },
  async mounted() {
    this.lessonN = this.onlyLesson || 1
    this.render = this.$refs.render
    this.render.start()
    await sleep(1000)
    this.start()
  },
  beforeUnmount() {
    this.stopped = true
  }
}
</script>