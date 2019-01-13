class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      route: 'home'
    };
    console.log("APP is build in constructor")
    this.entryPathApp = document.location.pathname
    this.onNavigate = this.onNavigate.bind(this)
    this.onNavGamesOffline = this.onNavGamesOffline.bind(this)
    history.pushState({ route: 'home' }, ``, `./`)

    this.activateOnHistory()

    document.getElementById('appinfo-btn')
      .addEventListener('click', (event) => {
        console.log('Goto info menu')
        this.onNavigate('info')
      });
    document.getElementById('help-btn')
      .addEventListener('click', (event) => {
        console.log('Goto help menu')
        this.onNavigate('help')
      });

  }

  componentDidMount() {
    console.log('Check for navigate to ', this.entryPathApp)
    this.navigateToBrowserRoute(this.entryPathApp)
  }

  navigateToBrowserRoute(pathname) {
    // Questa funzione presuppone che le url dei giochi offlines siano
    // del tipo off-<nome>
    // E che l'obbiettivo sia l'ultimo elemento del path diverso da cup
    console.log('check url ', pathname)
    let url_parts = pathname.split('/')
    if (url_parts.length <= 0) {
      return false
    }
    let last = url_parts[url_parts.length - 1]
    if (!last || last === 'cup') {
      return false
    }
    let navTargs = last.split('-')
    if (navTargs.length > 0 && navTargs[0] === 'off') {
      this.onNavGamesOffline(last)
      return true
    }
    this.onNavigate(last)
    return true
  }

  activateOnHistory() {
    window.addEventListener('popstate', e => {
      console.log('browser go back')
      this.setState(e.state)
      document.getElementById('mainMsg').hidden = this.isTargetHidingMainMsg(e.state.route);
    })
  }

  isTargetHidingMainMsg(target) {
    let hidden = false
    switch (target) {
      case 'home':
      case 'info':
      case 'help':
      case 'signup':
      case 'games':
      case 'login':
        hidden = false
        break
      default:
        hidden = true
        break;
    }
    return hidden
  }

  setNewStateHist(obj, title, url) {
    this.setState(obj, () => history.pushState(this.state, title, url))
  }

  onNavigate(target) {
    console.log('Navigate to target', target)

    document.getElementById('mainMsg').hidden = this.isTargetHidingMainMsg(target);
    switch (target) {
      case 'home':
        this.setNewStateHist({ route: 'home' }, ``, `./`)
        break
      case 'info':
        this.setNewStateHist({ route: 'info' }, `info`, `./info`)
        break;
      case 'help':
        this.setNewStateHist({ route: 'help' }, `help`, `./help`)
        break;
      case 'signup':
        this.setNewStateHist({ route: 'signup' }, `signup`, `./signup`)
        break;
      case 'games':
        this.setNewStateHist({ route: 'games' }, `games`, `./games`)
        break;
      case 'login':
        this.setNewStateHist({ route: 'login' }, `login`, `./login`)
        break;
      default:
        console.warn('Target navigation ignored:', target)
        break;
    }
  }

  onNavGamesOffline(target) {
    console.log('Navigate to offline game: ', target)
    document.getElementById('mainMsg').hidden = this.isTargetHidingMainMsg(target);
    switch (target) {
      case 'off-briscindue':
        this.setNewStateHist({ route: 'off-briscindue', gameName: 'Briscola in due', gameCode: 'off-briscindue' }, `off-briscindue`, `./off-briscindue`)
        break
      default:
        console.warn('Offline game not supported: ', target)
    }
  }

  render() {
    let detControl
    switch (this.state.route) {
      case 'info':
        detControl = <InfoControl info={this.state.info}></InfoControl>
        break;
      case 'help':
        detControl = <HelpControl></HelpControl>
        break;
      case 'games':
        if (!this.state.isLoggedIn) {
          detControl = <OfflineGamesCtrl onNavGamesOffline={this.onNavGamesOffline} state={this.state}></OfflineGamesCtrl>
        }
        break;
      case 'off-briscindue':
        detControl = <OfflineGame state={this.state}></OfflineGame>
        break;
    }
    return (
      <div>
        <MainMenu onNav={this.onNavigate} state={this.state}></MainMenu>
        {detControl}
      </div>
    )
  }
}

function MainMenu(props) {
  // let onInfoClick = function () {
  //   console.log('click on info button')
  //   props.onNav('info')
  // }
  let onHomeClick = function () {
    console.log('click on Home button')
    props.onNav('home')
  }
  let onHelpClick = function () {
    console.log('Help click')
    props.onNav('help')
  }
  let onSignupClick = function () {
    console.log('Signup click')
    props.onNav('signup')
  }
  let onLoginClick = function () {
    console.log('login click')
    props.onNav('login')
  }
  let onGamesClick = function () {
    console.log('games click')
    props.onNav('games')
  }
  let active = {
    login: props.state.route === 'login' ? ' ui active' : '',
    signup: props.state.route === 'signup' ? ' ui active' : '',
    home: props.state.route === 'home' ? ' ui active' : '',
    games: props.state.route === 'games' ? ' ui active' : '',
  }
  // disabilitao i menu login/registra per ora
  return (
    <div>
      <div className="ui secondary pointing menu">
        <a className={"item" + active["home"]} onClick={onHomeClick}><i className="home icon"></i></a>
        <a className={"item" + active["games"]} onClick={onGamesClick}> Giochi</a>
        <div className="right menu" style={{ display: 'none' }}>
          <a className={"item" + active["login"]} onClick={onLoginClick}>Login</a>
          <a className={"item" + active["signup"]} onClick={onSignupClick}>Registra</a>
        </div>
      </div>
    </div>
  )
}

function HelpControl(props) {
  return (
    <div className="ui segment">
      <h2 className="ui header">Aiuto</h2>
      <p>In questa app, per giocare in rete, bisogna effettuare il login nickname con un nome precedentemente registrato.</p>
      <p>Al momento però, sono disponibili solo giochi in simulazione contro l computer.</p>
      <p>Giochi disponibili:</p>
      <ul>
        <li>Briscola a due giocatori</li>
      </ul>
    </div>
  )
}

function InfoControl(props) {
  return (
    <div className="ui segment">
      <h2 className="ui header">Info sulla cuperativa...</h2>
      <p>App per giocare alle carte by Invido.it.</p>
    </div>
  )
}

function OfflineGamesCtrl(props) {
  let onGoBriscDue = function () {
    console.log('click Briscola in due offline')
    props.onNavGamesOffline('off-briscindue')
  }
  return (
    <div className="ui segment">
      <h2 className="ui header">Giochi disponibili contro il computer</h2>
      <div className="ui large bulleted link list">
        <a className="item" onClick={onGoBriscDue}>Briscola in due</a>
      </div>
    </div>
  )
}

class OfflineGame extends React.Component {
  constructor(props) {
    super(props);
    this.gameName = props.state.gameName
    this.gameCode = props.state.gameCode
  }
  componentDidMount() {
    let gameGfx = cup.GetGfxGameInstance(this.gameCode)
    gameGfx.renderScene("boardTable")
  }

  render() {
    return (
      <div className="ui segment">
        <h1>{this.gameName}</h1>
        <div className="ui">
          <div id="boardTable" ></div>
        </div>
      </div >
    )
  }
}


ReactDOM.render(<App />, document.getElementById('app'));
