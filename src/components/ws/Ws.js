import {toast} from 'vue3-toastify'

const _toast = title => {
  toast(title, {
    theme: 'dark',
    type: 'info',
    position: toast.POSITION.BOTTOM_LEFT,
    autoClose: 3000
  })
}

export default class Ws {
  
  constructor(store, onConnect) {
    this.store = store
    this.events = {}
    this.init()
  }
  addEvent(name, callback) {
    this.events[name] = callback
  }
  emit(name, params) {
    if (this.events[name]) {
      this.events[name](params)
    }
  }
  send(data) {
    this.socket.send(JSON.stringify(data))
  }
  init() {
    const registeredName = () => {
      return this.store.state.player.user.name
    }
    _toast('Установка связи')
    const socket = new WebSocket(import.meta.env.VITE_SERVER_URL)
    socket.onopen = () => {
      this.store.commit('player/setServerConnected', true)
      _toast('Связь с сервером установлена')
    }
    socket.onerror = () => {
      _toast('Ошибка соединения с сервером ' + import.meta.env.VITE_SERVER_URL)
    }
    const wsOnMessageActions = {
      serverDisconnect: () => {
        this.store.commit('player/setServerConnected', false)
      },
      playerRegistered: ({name}) => {
        this.store.commit('player/setName', name)
      },
      updatePlayersList: list => {
        this.store.commit('player/setOnlineList', list)
      },
      updatePlayerPairs: pairs => {
        // toast('Пары обновлены')
        this.store.commit('player/setPairs', pairs)
      },
      startGame: () => {
        // Сервер посылает это событие всем подписчикам, когда кто-то выбрал пару
        this.store.dispatch('player/startGame')
      },
      setTurnPlayer: ({turnPlayer}) => {
        if (!this.store.getters['player/currentPair']) {
          // меняем ходящего игрока только для текущей пары
          return
        }
        this.store.commit('player/setTurnPlayer', turnPlayer)
      },
      addedRing: ({playerName, turnPlayer, pinN}) => {
        if (!playerName) {
          alert('Ring from unknown')
          return
        }
        if (playerName === registeredName()) {
          // для себя мы уже поставили
          return
        }
        this.emit('addedRing', {turnPlayer, pinN})
      },
      // я покинул игру, но не отконнектился от сокета
      leftGame: () => {
        this.store.dispatch('player/leaveGame')
      },
      opponentWin: () => {
        this.emit('opponentWin')
      },
      playerGone: ({playerName}) => {
        _toast(playerName + ' левнул')
      },
      resetGame: ({playerName}) => {
        if (playerName === registeredName()) {
          // себя уже прорезетили
          return
        }
        this.emit('resetGame')
      }
    }
    socket.onmessage = event => {
      const data = JSON.parse(event.data)
      console.log('[from server]>', data)
      if (!wsOnMessageActions[data.type]) {
        console.log(data)
        //alert('wsOnMessageAction "' + data.type + '" does not exists')
        return
      }
      wsOnMessageActions[data.type](data.data)
    }
    this.socket = socket
  }

}
