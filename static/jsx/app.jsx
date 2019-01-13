class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      route: 'home'
    };
    let params = document.location.hash
    console.log("APP is build in constructor", params)
    this.onNavigate = this.onNavigate.bind(this)
    this.onNavGamesOffline = this.onNavGamesOffline.bind(this)
    history.pushState({ route: 'home' }, ``, `./`)
    this.activateOnHistory()
  }

  activateOnHistory() {
    window.addEventListener('popstate', e => {
      console.log('browser go back')
      this.setState(e.state)
    })
  }

  setNewStateHist(obj, title, url) {
    this.setState(obj, () => history.pushState(this.state, title, url))
  }

  onNavigate(target) {
    console.log('Navigate to target', target)
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
  let onInfoClick = function () {
    console.log('click on info button')
    props.onNav('info')
  }
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
  return (
    <div>
      <div className="ui secondary pointing menu">
        <a className={"item" + active["home"]} onClick={onHomeClick}><i className="home icon"></i></a>
        <a className={"item" + active["games"]} onClick={onGamesClick}> Giochi</a>
        <div className="right menu">
          <a className={"item" + active["login"]} onClick={onLoginClick}>Login</a>
          <a className={"item" + active["signup"]} onClick={onSignupClick}>Registra</a>
        </div>
      </div>
      <button className="ui right floated button icon" onClick={onInfoClick}><i className="info circle icon"></i></button>
      <button className="ui right floated button icon" onClick={onHelpClick}><i className="question circle icon"></i></button>
    </div>
  )
}

function HelpControl(props) {
  return (
    <div>
      <h3 className="ui header">Aiuto</h3>
      <p>In questa app basta collegarsi in rete con un nickname. Poi basta creare un nuovo gioco oppure partecipare ad un gioco in corso.</p>
    </div>
  )
}

function InfoControl(props) {
  return (
    <div>
      <h3 className="ui header">Info sulla cuperativa...</h3>
      <p>App per giocare alle carte.</p>
    </div>
  )
}

function OfflineGamesCtrl(props) {
  let onGoBriscDue = function () {
    console.log('click Briscola in due offline')
    props.onNavGamesOffline('off-briscindue')
  }
  return (
    <div>
      <h3 className="ui header">Giochi disponibili contro il computer</h3>
      <ul>
        <li><a className="item ui" onClick={onGoBriscDue}>Briscola in due</a></li>
      </ul>
    </div>
  )
}

function OfflineGame(props) {
  const gameName = props.state.gameName
  const gameCode = props.state.gameCode
  let gameGfx = cup.GetGfxGameInstance(gameCode)
  gameGfx.renderScene("mainCanvas")
  return (
    <div>
      <h1>{gameName}</h1>
      <div className="ui">
        <canvas id="mainCanvas" ></canvas>
      </div>
    </div>
  )
}


ReactDOM.render(<App />, document.getElementById('app'));
