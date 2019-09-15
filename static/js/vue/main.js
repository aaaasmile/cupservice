
Vue.component('offlinegames', {
  template: '<div class="ui segment"><h2 class="ui header">Giochi disponibili contro il computer</h2></div>'
})


Vue.component('appview', {
  template: '<div class="ui container"><offlinegames/></div>'
})


export const app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  //template: '<p>Vue message is {{message}}</p>'
  template: '<appview/>'
})

console.log('Main is here!')