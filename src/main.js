import {createApp} from 'vue'
import store from '@/store'
import App from './App.vue'
import { createWebHistory, createRouter } from 'vue-router'

import Game from './components/Game.vue'
import HowToPlay from './components/HowToPlay.vue'

const routes = [
  { path: '/', component: Game },
  { path: '/how-to-play', component: HowToPlay },
]

const router = createRouter({
  routes,
  history: createWebHistory()
})

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')
