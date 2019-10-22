import { ChatType } from './sharedEnums.js';
import { MessageBuilder } from './MessageBuilder.js';

import { Subject} from 'rxjs';

import { webSocket } from 'rxjs/WebSocket'

export class SocketService {
    constructor() {
        this.ConnectEvent = new Subject();
        this._protocollConnected = false;
        this._closing = false;
        this._reconnect = false;
        this.subsc_ws = null;
        this.ws = null;
        this.Messages = null
    }

    createSocket(url){
        console.log('Create socket on SocketService');
        mybase_url = url;
        this.Messages = new Subject();

        this.ws = webSocket({ url: mybase_url, serializer: x => x });
        if (this.subsc_ws) {
            this.subsc_ws.unsubscribe();
        }
        this.subsc_ws = this.ws.subscribe(
            (msg) => {
                console.log('socket received: ' + msg);
                if (this.Messages != null) {
                    this.setProtocolConnected(true);
                    let msgParsed = MessageBuilder.parse(msg);
                    console.log("Msg parsed is:", msgParsed);
                    this.Messages.next(msgParsed);
                } else {
                    this.setProtocolConnected(false);
                }
            },
            (err) => {
                console.log('socket error: ', err);
                this.Messages.complete();
                this.ws = null;
                this.Messages = null;
                this.setProtocolConnected(false);
            },
            () => {
                console.log('socket complete - DISCONNECTED');
                if (this.Messages != null) {
                    this.Messages.complete();
                }
                this.Messages = null;
                this.ws = null;
                this.setProtocolConnected(false);
                this._closing = false;
                if (this._reconnect) {
                    console.log('Reconnect was requested');
                    this.connectSocketServer();
                }
            }
        );
    }

    setProtocolConnected(val) {
        if (val != this._protocollConnected) {
            this._protocollConnected = val;
            this.ConnectEvent.next(val);
        }
    }

    getProtocollConnected(){
        return this._protocollConnected;
    }

    connectSocketServer(){
        if (this.onlineService.isModeOnline()) {
            if (this.ws == null) {
                if (!this._closing) {
                    this._reconnect = false;
                    this.setProtocolConnected(true);
                    this.createSocket();
                } else {
                    this._reconnect = true;
                }
            }
        } else {
            console.log('Ignore connect because app is in offline mode');
        }
    }

    closeSocketServer(){
        if (this.ws != null) {
            console.log("Close the socket by user action");
            this.ws.unsubscribe();
            this._reconnect = false;
            this.ws = null;
            if (this.Messages != null) {
                this._closing = true;
                this.Messages.complete();
                this.Messages = null;
            }
            this.setProtocolConnected(false);
        }
    }

    isConnected(){
        return this.ws != null;
    }

    loginReq(login, password, token){
        this.connectSocketServer();

        let det_json = JSON.stringify({ name: login, password: btoa(password), token: token });
        let det = "LOGIN:" + det_json;
        console.log("Send cmd: ", det);

        this.ws.next(det);
        return this.Messages;
    }

    signup(det_json){
        this.connectSocketServer();
        var det = "USEROP:" + det_json;

        this.ws.next(det);
        return this.Messages;
    }

    userExists(login){
        this.connectSocketServer();

        let det_json = JSON.stringify({ login: login });
        var det = "USEREXIST:" + det_json;

        this.ws.next(det);
        console.log('user exists for: ' + login);
        return this.Messages;
    }

    logoutReq(login){
        let det_json = JSON.stringify({ name: login});
        let det = "LOGOUT:" + det_json;
        console.log("Send cmd: ", det);

        this.ws.next(det);
        return this.Messages;
    }

    pendingGame2Req(){
        return this.sendCmdDetReq('PENDINGGAMESREQ2:');
    }

    usersConnectedReq() {
        this.sendCmdDetReq('USERSCONNECTREQ:');
    }

    createNewGameReq(payloadObj) {
        var payloadJson = JSON.stringify(payloadObj);
        console.log('Game created: ' + payloadJson);
        this.sendCmdDetReq('PGCREATE2:' + payloadJson);
    }

    removeGameReq(ix){
        console.log('remove game ix: ', ix);
        this.sendCmdDetReq('PGREMOVEREQ:' + ix);
    }

    joinGameReq(ix){
        console.log('Join game ix: ', ix);
        return this.sendCmdDetReq('PGJOIN:' + ix);
    }

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
    }

    algPlayCard(card, name) {
        console.log('Play card ' + card + ' player: ' + name);
        this.sendCmdDetReq('ALGPLAYERCARDPLAYED:' + name + ',' + card);
    }

    algLeaveTable(ix) {
        console.log('Leave table game ix: ' + ix);
        this.sendCmdDetReq('LEAVETABLE:' + ix);
    }

    algResign(ix) {
        console.log('Resign game ix: ' + ix);
        this.sendCmdDetReq('RESIGNGAME:' + ix);
    }

    algRestartWithNewGame(payloadObj) {
        var payloadJson = JSON.stringify(payloadObj);
        console.log('Restart new game: ' + payloadJson);
        this.sendCmdDetReq('RESTARTWITHNEWGAME:' + payloadJson);
    }

    algRestartSameGame(ix) {
        console.log('Restart game ix: ' + ix);
        this.sendCmdDetReq('RESTARTGAME:' + ix);
    }

    sendCmdDetReq(det){
        //console.log('send ' + det);
        this.ws.next(det);
        return this.Messages;
    }
}