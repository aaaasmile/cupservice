
import { GameAvailableInfo } from '../../custom/common/gfx/gfx-provider.js'

export const OfflineGames = Vue.component('offlinegames', {
  template: `
  <div class="ui segment">
    <h2 class="ui header">Giochi disponibili contro il computer</h2>
    <div class="ui large bulleted link list">
      <a v-for="game in games" class="item"> {{ game.desc }} </a>
    </div>
  </div>`,
  data: function () {
    return { games: [] }
  },
  created: function () {
    let ga = new GameAvailableInfo()
    let data = ga.GetGameList()
    console.log('Going for creation...', data)
    this.data.games = data
  }
})