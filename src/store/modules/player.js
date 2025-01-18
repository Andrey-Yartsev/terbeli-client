const state = {
  serverConnected: false,
  autostart: true,
  user: {
    name: null
  },
  online: {},
  pairs: [],
  gameStarted: false,
  turnPlayer: 1,
  winPlayerN: 0,
  winPlayerName: null,
}
const actions = {
  setWinPlayer({commit, getters}, n) {
    const i = n - 1
    commit('winPlayerName', getters.currentPair[i])
    commit('setWinPlayer', n)
  },
  startGame({commit}) {
    const audio = new Audio('/sound/bell.wav')
    audio.play()
    commit('setGameStarted', true)
  },
  leaveGame({commit}) {
    commit('setName', null)
    commit('reset')
  }
}
const mutations = {
  setServerConnected(state, flag) {
    state.serverConnected = flag
  },
  setName(state, name) {
    state.user.name = name
  },
  setOnlineList(state, list) {
    state.online = list
  },
  setPairs(state, pairs) {
    state.pairs = pairs
  },
  setGameStarted(state, flag) {
    state.gameStarted = flag
  },
  setTurnPlayer(state, n) {
    state.turnPlayer = n
  },
  switchPlayerN(state) {
    state.turnPlayer = state.turnPlayer === 1 ? 2 : 1
  },
  setWinPlayerN(state, n) {
    state.winPlayerN = n
  },
  reset(state) {
    state.turnPlayer = 1
    state.winPlayerN = 0
    state.winPlayerName = 1
  }
}
const getters = {
  readyToPlay(state) {
    let online = JSON.parse(JSON.stringify(state.online))
    if (state.user.name) {
      delete online[state.user.name]
    }
    console.log('online', online)
    console.log('playing pairs', state.pairs)
    state.pairs.forEach(pair => {
      delete online[pair[0]]
      delete online[pair[1]]
    })
    console.log('online 2', online)
    return Object.keys(online)
  },
  currentPair(state) {
    if (!state.user.name) {
      return null
    }
    if (!state.pairs.length) {
      return null
    }
    return state.pairs.find(pair => {
      // если в паре есть текущий игрок, значит это наша пара
      return pair[0] === state.user.name || pair[1] === state.user.name
    })
  },
  opponent(state, getters) {
    const playingPair = getters.currentPair
    if (!playingPair) {
      return null
    }
    const name = playingPair.find(player => player !== state.user.name)
    return {
      name
    }
  },
  opponentName(state, getters) {
    return getters.opponent ? getters.opponent.name : null
  },
  inGame(state, getters) {
    return (state.user.name && getters.opponentName)
  },
  turnPlayerName(state, getters) {
    const i = state.turnPlayer - 1
    return getters.currentPair ? getters.currentPair[i] : null
  },
  isMyTurn(state, getters) {
    return getters.turnPlayerName && state.user.name === getters.turnPlayerName
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}