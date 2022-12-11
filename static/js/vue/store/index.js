import Generic from './generic-store.js?version=100'
import Player from './player-store.js?version=103'
import SocketStore from './socket-store.js?version=100'
import MatchStore from './match-store.js?version=100'

export default new Vuex.Store({
  modules: {
    gen: Generic,
    pl: Player,
    sk: SocketStore,
    ms: MatchStore,
  }
})
