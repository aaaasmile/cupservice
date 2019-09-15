
Vue.component('offlinegames', {
  template: `
  <div class="ui segment">
    <h2 class="ui header">Giochi disponibili contro il computer</h2>
  </div>`
})


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