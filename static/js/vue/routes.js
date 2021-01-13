import Dashboard from './views/dashboard.js'
import InfoSu from './views/infosu.js'

export default [
  { path: '/', icon: 'mdi-glass-cocktail', title: 'Bancone', component: Dashboard, },
  { path: '/info', icon: 'mdi-information', title: 'Info', component: InfoSu, }
]