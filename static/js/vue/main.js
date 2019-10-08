
import { OfflineGames } from './comp/offline-games.js'
import { AboutPage } from './comp/about-page.js'
import { OnlinePage } from './comp/online-page.js'

const NotFound = { template: '<div class="ui container"><p>Page not found</p></div>' }

const Home = Vue.component('appview', {
  template: ` 
  <div class="ui container">
    <offlinegames/>
    <a class="ui" href="/cup/online">Vai in Rete</a>
  </div>
  `
})

const routes = {
  '/cup/': Home,
  '/cup/about': AboutPage,
  '/cup/online': OnlinePage
}

export const app = new Vue({
  el: '#app',
  data: {
    currentRoute: window.location.pathname
  },
  computed: {
    CurrentViewComponent() {
      return routes[this.currentRoute] || NotFound
    }
  },
  render(h) { return h(this.CurrentViewComponent) }
})

window.addEventListener('popstate', () => {
  app.currentRoute = window.location.pathname
})

console.log('Main Vue is here! ', window.location.pathname)