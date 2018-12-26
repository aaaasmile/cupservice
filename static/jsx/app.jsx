class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false
    };
    console.log("APP is build in constructor")
    this.onInfoClick = this.onInfoClick.bind(this)
    this.commanderRef = React.createRef();
    history.pushState({ info: false }, ``, `./#`)
    this.activateOnHistory()
  }

  onInfoClick() {
    console.log("Info clicked in APP")
    this.setNewStateHist({ info: true }, `info`, `./#info`)
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

  render() {
    let detControl
    if (this.state.info) {
      detControl = <InfoControl info={this.state.info}></InfoControl>
    }
    return (
      <div>
        <button className="ui right floated button icon" onClick={this.onInfoClick}><i className="info circle icon"></i></button>
        {detControl}
      </div>
    )
  }
}

function InfoControl(props) {
  return (
    <div>
      <h2 className="ui dividing header">Info su...</h2>
    </div>
  )
}


ReactDOM.render(<App />, document.getElementById('app'));
