<template>
  <div class="htp">
    <button class="button" @click.prevent="restart">Заново</button>
    <a href="/" class="menu">В игру</a>
    <RenderMain ref="render" :showPinDigits="true" />
  </div>
</template>

<script>
import RenderMain from "@/components/render/RenderMain.vue";
import toast from '@/mixins/toast.js'
import isTouchDevice from "@/mixins/isTouchDevice.js";

const sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  mixins: [toast],
  components: { RenderMain },
  data() {
    return {
      lessonsOver: false,
      onlyLesson: false
    }
  },
  methods: {
    async start() {
      await this.lesson(this.v)
    },
    restart() {
      localStorage.setItem('lessonN', 1)
      window.location.reload()
    },
    async put(pinN) {
      if (this.render.isWin) {
        this.toast(this.color + ' пытался сходить после победы')
        return
      }
      this.render.putRing(pinN)
      this.$store.commit('player/switchPlayerN')
      await sleep(500)
    },
    async lesson(n) {
      if (!this.onlyLesson && !this['v' + n]) {
        this.toast('Уроки закончились')
        this.lessonsOver = true
        return
      }
      await this['v' + n]()
      if (this.onlyLesson) {
        return
      }
      await sleep(2000)
      this.toast('Через 15с. начнётся следущий урок')
      await sleep(15000)
      localStorage.setItem('lessonN', this.v + 1)
      window.location.reload()
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
    color() {
      return this.render.turnPlayer === 1 ? 'красный' : 'синий'
    }
  },
  mounted() {
    this.v = this.onlyLesson || parseInt(localStorage.getItem('lessonN')) || 1
    this.render = this.$refs.render
    this.render.start()
    this.start()
  }
}
</script>