import Dashboard from './views/dashboard.js?version=100'
import InfoSu from './views/infosu.js?version=100'
import Options from './views/mainoptions.js?version=100'

export default [
  { path: '/', icon: 'mdi-glass-cocktail', title: 'Bancone', component: Dashboard, },
  { path: '/info', icon: 'mdi-information', title: 'Info', component: InfoSu, },
  { path: '/options', icon: 'mdi-credit-card-settings-outline', title: 'Opzioni', component: Options }
]