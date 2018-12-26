class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      route: 'home'
    };
    console.log("APP is build in constructor")
    this.onNavigate = this.onNavigate.bind(this)
    history.pushState({ route: 'home' }, `#`, `./#`)
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
        this.setNewStateHist({ route: 'home' }, `#`, `./#`)
        break
      case 'info':
        this.setNewStateHist({ route: 'info' }, `info`, `./#info`)
        break;
      case 'help':
        this.setNewStateHist({ route: 'help' }, `help`, `./#help`)
        break;
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
  let active = {
    login: props.state.route === 'login' ? ' ui active' : '',
    signup: props.state.route === 'signup' ? ' ui active' : '',
    home: props.state.route === 'home' ? ' ui active' : '',
  }
  return (
    <div>
      <div className="ui secondary pointing menu">
        <a className={"item" + active["home"]} onClick={onHomeClick}><i className="home icon"></i></a>
        <a className="item"> Giochi</a>
        <div className="right menu">
          <a className="ui item">Login</a>
          <a className="ui item">Registra</a>
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


ReactDOM.render(<App />, document.getElementById('app'));
