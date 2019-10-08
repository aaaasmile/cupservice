
let socket // TODO usa il service socket
let dataOnline = {
  username: "igor"
}
export const  OnlinePage = Vue.component('online', {
  template: ` 
  <div class="ui container">
    <h2>Internet</h2>
    <p>Vedi chi si trova in rete con te.</p>
  </div>`,
  data: function () {
    return dataOnline
  },
  beforeCreate: function () {
    console.log('The ws url is ', window.wsaddress)
    socket = new WebSocket(window.wsaddress)
    socket.addEventListener('open', function (event) {
      var msg = { "type": "hello", "username": dataOnline.username };
      socket.send(JSON.stringify(msg));
    });
  }
})