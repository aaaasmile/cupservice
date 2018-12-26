class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    console.log("APP is build in constructor")
    this.onInfoClick = this.onInfoClick.bind(this)
    this.commanderRef = React.createRef();
  }

  onInfoClick() {
    console.log("Info clicked in APP")
    this.setNewStateHist({ info: true }, `info`, `./#info`)
  }

  clearResult() {
    this.setState({})
  }

  restoreOnHistory() {
    window.addEventListener('popstate', e => {
      console.log('browser go back')
      this.setNewState(e.state)
    })
  }

  setNewStateHist(obj, title, url) {
    this.clearResult()
    this.setState(obj, () => history.pushState(this.state, title, url))
  }

  render() {
    return (
      <div>
        <button className="ui right floated button icon" onClick={this.onInfoClick}><i className="info circle icon"></i></button>
        {this.props.info ? <Info info={this.state.info}></Info> : null}
      </div>
    )
  }
}

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// INFO
///////////////////////////////////////////////////////////////////////////////////

class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <h2 className="ui dividing header">Info su...</h2>
      </div>
    )
  }
}


ReactDOM.render(<App />, document.getElementById('app'));
