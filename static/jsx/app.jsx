class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false
    };
    console.log("APP is build in constructor")
    this.onInfoClick = this.onInfoClick.bind(this)
    this.onNavigate = this.onNavigate.bind(this)
    this.commanderRef = React.createRef()
    history.pushState({ route: 'home' }, `#`, `./#`)
    this.activateOnHistory()
  }

  onInfoClick() {
    console.log("Info clicked in APP")
    this.setNewStateHist({ route: 'info' }, `info`, `./#info`)
  }

  onHelpClick() {
    console.log("Help clicked in APP")
    this.setNewStateHist({ route: 'help' }, `help`, `./#help`)
  }

  onHomeClick() {
    console.log('Home')
    this.setNewStateHist({ route: 'home' }, `#`, `./#`)
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
    switch (target) {
      case 'home':
        this.onHomeClick()
        break
      case 'info':
        this.onInfoClick()
        break;
      case 'help':
        this.onHelpClick()
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
        <MainMenu onNav={this.onNavigate}></MainMenu>
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
  let onHelpClick = function(){
    console.log('Help click')
    props.onNav('help')
  }
  return (
    <div>
      <button className="ui right floated button icon" onClick={onHomeClick}><i className="home icon"></i></button>
      <button className="ui right floated button icon" onClick={onInfoClick}><i className="info circle icon"></i></button>
      <button className="ui right floated button icon" onClick={onHelpClick}><i className="question circle icon"></i></button>
    </div>
  )
}

function HelpControl(props) {
  return (
    <div>
      <h3 className="ui dividing header">Aiuto</h3>
      <p>In questa app basta collegarsi in rete con un nickname. Poi basta creare un nuovo gioco oppure partecipare ad un gioco in corso.</p>
    </div>
  )
}

function InfoControl(props) {
  return (
    <div>
      <h3 className="ui dividing header">Info sulla cuperativa...</h3>
      <p>App per giocare alle carte.</p>
    </div>
  )
}


ReactDOM.render(<App />, document.getElementById('app'));
