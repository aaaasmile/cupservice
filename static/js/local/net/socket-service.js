import { ChatType } from './sharedEnums.js?version=100';
import { MessageBuilder } from './MessageBuilder.js?version=100';
import store from '../../vue/store/index.js?version=100'

export default (socketUrl) => {
    const _connection = new WebSocket(socketUrl)
    console.log("WS socket created")

    _connection.onmessage = (event) => {
        console.log(event)
        let dataMsg = JSON.parse(event.data)
        if (dataMsg.type === "status") {
            console.log('Socket msg type: status')
            store.commit('playerstate', dataMsg)
        } else {
            console.warn('Socket message type not recognized ', dataMsg, dataMsg.type)
        }
    }

    _connection.onopen = (event) => {
        console.log(event)
        console.log("Socket connection success")
    }

    _connection.onclose = (event) => {
        console.log(event)
        console.log("Socket closed")
        _connection = null
    }
    return {
        loginReq(login, password, token) {

            let det_json = JSON.stringify({ name: login, password: btoa(password), token: token });
            let det = "LOGIN:" + det_json;
            console.log("Send cmd: ", det);
        },
        signup(det_json) {
            let det = "USEROP:" + det_json;
        },
        userExists(login) {
            let det_json = JSON.stringify({ login: login });
            let det = "USEREXIST:" + det_json;

            console.log('user exists for: ' + login);
        },
        logoutReq(login) {
            let det_json = JSON.stringify({ name: login });
            let det = "LOGOUT:" + det_json;
            console.log("Send cmd: ", det);
        },
        pendingGame2Req() {
            return this.sendCmdDetReq('PENDINGGAMESREQ2:');
        },
        usersConnectedReq() {
            this.sendCmdDetReq('USERSCONNECTREQ:');
        },
        createNewGameReq(payloadObj) {
            let payloadJson = JSON.stringify(payloadObj);
            console.log('Game created: ' + payloadJson);
            this.sendCmdDetReq('PGCREATE2:' + payloadJson);
        },
        removeGameReq(ix) {
            console.log('remove game ix: ', ix);
            this.sendCmdDetReq('PGREMOVEREQ:' + ix);
        },
        joinGameReq(ix) {
            console.log('Join game ix: ', ix);
            return this.sendCmdDetReq('PGJOIN:' + ix);
        },
        chatCup(type, text) {
            let spec;
            switch (type) {
                case ChatType.Table:
                    spec = "CHATTAVOLO:";
                    break;
                case ChatType.Lobby:
                    spec = "CHATLOBBY:";
                    break;
            }
            console.log('Chat ' + type + ':' + text);
            this.sendCmdDetReq(spec + text);
        },
        algPlayCard(card, name) {
            console.log('Play card ' + card + ' player: ' + name);
            this.sendCmdDetReq('ALGPLAYERCARDPLAYED:' + name + ',' + card);
        },
        algLeaveTable(ix) {
            console.log('Leave table game ix: ' + ix);
            this.sendCmdDetReq('LEAVETABLE:' + ix);
        },
        algResign(ix) {
            console.log('Resign game ix: ' + ix);
            this.sendCmdDetReq('RESIGNGAME:' + ix);
        },
        algRestartWithNewGame(payloadObj) {
            let payloadJson = JSON.stringify(payloadObj);
            console.log('Restart new game: ' + payloadJson);
            this.sendCmdDetReq('RESTARTWITHNEWGAME:' + payloadJson);
        },
        algRestartSameGame(ix) {
            console.log('Restart game ix: ' + ix);
            this.sendCmdDetReq('RESTARTGAME:' + ix);
        },
        sendCmdDetReq(det) {
            //console.log('send ' + det);
            // TODO
        }
    }
}