const state = {
  serverConnected: false,
  user: {
    name: null
  },
  online: {},
  pairs: [],
  startGame: 0,
  turnPlayer: 1,
  winPlayerN: 0,
  winPlayerName: null,
}
const actions = {
  setWinPlayer({commit, getters}, n) {
    const i = n - 1
    commit('winPlayerName', getters.currentPair[i])
    commit('setWinPlayer', n)
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
  startGame(state) {
    state.startGame++
  },
  setTurnPlayer(state, n) {
    console.trace('setTurnPlayer', n)
    state.turnPlayer = n
  },
  switchPlayerN(state) {
    state.turnPlayer = state.turnPlayer === 1 ? 2 : 1
  },
  setWinPlayerN(state, n) {
    state.winPlayerN = n
  }
}
const getters = {
  readyToPlay(state) {
    let online = JSON.parse(JSON.stringify(state.online))
    if (state.user.name) {
      delete online[state.user.name]
    }
    // online['Дональд Трамп'] = {}
    // online['Путих'] = {}
    // online['Jefferson Airplane'] = {}
    console.log('state.pairs', state.pairs)
    console.log('online', online)
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
  turnPlayerName(state, getters) {
    const i = state.turnPlayer - 1
    return getters.currentPair ? getters.currentPair[i] : null
  },
  isMyTurn(state, getters) {
    console.log('--------------->', state.user.name, getters.turnPlayerName)
    return state.user.name === getters.turnPlayerName
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}