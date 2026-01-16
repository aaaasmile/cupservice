import Navbar from './components/navbar.js?version=104'
import store from './store/index.js?version=103'
import routes from './routes.js?version=104'

export const app = new Vue({
	el: '#app',
	router: new VueRouter({ routes }),
	components: { Navbar },
	vuetify: new Vuetify(),
	store,
	data() {
		return {
			Buildnr: "",
			links: routes,
			AppTitle: "Cuperativa",
			drawer: false,
			connection: null,
		}
	},
	computed: {
		...Vuex.mapState({
			IsOnGame: state => {
				return state.ms.match_state === 'st_match_ongoing'
			},
		})
	},
	beforeCreate() {
		this.$store.commit('initialiseStore');
	},
	created() {
		// keep in mind that all that is comming from index.html is a string. Boolean or numerics need to be parsed.
		this.Buildnr = window.myapp.buildnr
		const port = location.port;
		const prefix = (window.location.protocol.match(/https/) ? 'wss' : 'ws')
		let socketUrl = prefix + "://" + location.hostname + (port ? ':' + port : '') + "/websocket";
		this.$store.commit('changeSocketUrl', socketUrl)
	},
	methods: {

	},
	template: `
  <v-app class="grey lighten-4">
    <Navbar v-show="!IsOnGame"/>
    <v-main class="mx-4 mb-4" id="reffull">
      <router-view id="refcont"></router-view>
    </v-main>
    <v-footer v-show="!IsOnGame">
      <div class="caption">
        {{ new Date().getFullYear() }} —
        <span>Buildnr: {{Buildnr}}</span> - 
        <span>I contenuti di questo sito sono perlopiù parole al vento. By IgorRun for <a href="https://invido.it/">invido.it</a>.</span>
      </div>
    </v-footer>
  </v-app>`
})

console.log('Main is here!')