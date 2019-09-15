
import { OfflineGames } from './comp/offline-games.js'


Vue.component('appview', {
  template: ` 
  <div class="ui container">
    <offlinegames/>
  </div>`
})


export const app = new Vue({
  el: '#app',
  template: '<appview/>'
})

console.log('Main Vue is here!')