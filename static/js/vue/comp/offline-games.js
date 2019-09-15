
import { GameAvailableInfo } from '../../custom/common/gfx/gfx-provider.js'

let dataGames = { games: [] }

export const OfflineGames = Vue.component('offlinegames', {
  template: `
  <div class="ui segment">
    <h2 class="ui header">Giochi disponibili contro il computer</h2>
    <div class="ui large bulleted link list">
      <a v-for="game in games" v-on:click="gameClicked(game)" class="item"> {{ game.desc }} </a>
    </div>
  </div>`,
  data: function () {
    return dataGames
  },
  beforeCreate: function () {
    let ga = new GameAvailableInfo()
    let list = ga.GetGameList()
    console.log('Going for creation...', list)
    list.forEach(element => {
      dataGames.games.push(element)
    });
  },
  methods: {
    gameClicked: function(game){
      console.log('Congrats, you have clicked a game. Code is %s.', game.code)
      let index =  dataGames.games.indexOf(game)
      if (index !== -1){
        dataGames.games.splice(index, 1);
        console.log('Removed item with index ', index)
      } 
     
    }
  }
})