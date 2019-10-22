
let socket // TODO usa il service socket
let dataOnline = {
  username: "igor"
}
export const  OnlinePage = Vue.component('online', {
  template: ` 
  <div class="ui container">
    <h2>Internet</h2>
    <p>Vedi chi si trova in rete con te.</p>

    <h3>Qualche comando per testare la comunicazione </h3>
    <button v-on:click="gotoDetail()">View Details</button>
    <button v-on:click="doLogin()">Login</button>
    <button v-on:click="doLogout()">Logout</button>
    <button v-on:click="doPendingGameRe2()">PendingGameRe2</button>
    <button v-on:click="doUsersConnectedReq()">UserReq</button>
    <button v-on:click="doCreateNewGameReq()">New Game Briscola</button>
    <br/>
    <ul>
      <li>
        <div><button v-on:click="doJoinGame()">Join Game</button>
          <input id="ixgame" placeholder="ixgame" />
        </div>
      </li>
      <li>
        <div><button v-on:click="doChatLobby()">Chat Lobby</button>
          <input id="chatLobbyText"  placeholder="chat lobby text" />
        </div>
      </li>
      <li>
        <div><button v-on:click="doChatTable()">Chat Table</button>
          <input id="chatTableText" placeholder="chat table text" />
        </div>
      </li>
      <li>
        <div><button v-on:click="doAlgPlayCard()">Play card</button>
          <input id="cardToPlay" placeholder="i.e. _Ab" />
        </div>
      </li>
      <li>
        <div><button v-on:click="doAlgLeaveTable()">Leave Table</button>
        </div>
      </li>
      <li>
        <div><button v-on:click="doAlgResign()">Resign</button>
        </div>
      </li>
      <li>
        <div><button v-on:click="doAlgRestartSameGame()">Restart same Game</button>
        </div>
      </li>
      <li>
        <div><button v-on:click="doAlgRestartNewGame()">Restart with another Game</button>
        </div>
      </li>
    </ul>
  </div>`,
  data: function () {
    return dataOnline
  },
  beforeCreate: function () {
    console.log('The ws url is ', window.wsaddress)
    // TODO: usa il socket di socket-service.js
    // socket = new WebSocket(window.wsaddress)
    // socket.addEventListener('open', function (event) {
    //   var msg = { "type": "hello", "username": dataOnline.username };
    //   socket.send(JSON.stringify(msg));
    // });
  }
})