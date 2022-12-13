import Dashboard from './views/dashboard.js?version=104'
import InfoAbout from './views/infoabout.js?version=103'
import Options from './views/mainoptions.js?version=102'

export default [
  { path: '/', icon: 'mdi-glass-cocktail', title: 'Bancone', component: Dashboard, },
  { path: '/info', icon: 'mdi-information', title: 'Info', component: InfoAbout, },
  { path: '/options', icon: 'mdi-credit-card-settings-outline', title: 'Opzioni', component: Options }
]