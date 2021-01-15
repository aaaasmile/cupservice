import Generic from './generic-store.js'
import Player from './player-store.js'
import SocketStore from './socket-store.js'
import MatchStore from './match-store.js'

export default new Vuex.Store({
  modules: {
    gen: Generic,
    pl: Player,
    sk: SocketStore,
    ms: MatchStore,
  }
})
