package ws

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type GameInProgress struct {
	ID int
}

type MessageSnd struct {
	MsgJson           string
	TargetClientInfos []string
}

type MessageRead struct {
	Conn     *websocket.Conn
	ConnName string
	MsgRaw   string
}

var (
	upgrader      websocket.Upgrader
	clients       = make(map[string]*ClientInfo)
	clientCount   = 0
	broadcastCh   = make(chan *MessageSnd)
	discClientCh  = make(chan *ClientInfo)
	disconnClient = NewDisconnClient(discClientCh)
)

func getConnName() string {
	clientCount++ // TODO use rnd id
	return fmt.Sprintf("Client %d", clientCount)
}

func cmdInfo(det string) string { // TODO move in cupCmd package
	cmd := fmt.Sprintf("INFO: %s", det)
	bytes, err := json.Marshal(cmd)
	if err != nil {
		log.Println("Error in marshal: ", err)
		return ""
	}
	return string(bytes)
}

func WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WS error", err)
		return
	}

	info := NewClientInfo(conn)
	clients[info.ConnName] = info // TODO use mutex
	log.Printf("Client %q is connected. Connected clients %d", info.ConnName, len(clients))

	mm := &MessageSnd{MsgJson: cmdInfo("WELCOME_SERVER_CUPERATIVA_WS - 10.0.0")}
	mm.TargetClientInfos = []string{info.ConnName}
	broadcastCh <- mm

	disconnClient.CheckReconnect(info) // TODO do it after login

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Websocket read error ", err)
			closeWsConn(info, conn)
			return
		}
		if messageType == websocket.TextMessage {
			log.Println("Message rec: ", string(p)) // TODO message parser
		}
	}
}

func broadcastMsg() {
	log.Println("WS Waiting for broadcast")
	for {
		msg := <-broadcastCh
		if msg.MsgJson == "" {
			continue
		}
		for _, name := range msg.TargetClientInfos {
			ci := clients[name]
			for conn := range ci.WsConn {
				err := conn.WriteMessage(websocket.TextMessage, []byte(msg.MsgJson))
				if err != nil {
					log.Println("Socket error: ", err)
					closeWsConn(ci, conn)
				}
			}
		}
	}
}

func closeWsConn(ci *ClientInfo, conn *websocket.Conn) {
	ci.WsConn[conn] = false
	delete(ci.WsConn, conn) // TODO use mutex
	if len(ci.WsConn) == 0 {
		//if false && (ci.GameInProg == nil || ci.Username == "") {
		if ci.GameInProg == nil || ci.Username == "" {
			disconnClient.ImmediateDisconn(ci)
		} else {
			disconnClient.StartDisconn(ci)
		}
	}
}

func handleDisconnect() {
	for {
		ci := <-discClientCh
		log.Printf("Disconnect client %q", ci.ConnName)
		ci.DisposeReconnectCh(disconnClient)
		delete(clients, ci.ConnName) // TODO use mutex
		log.Println("Connected clients: ", len(clients))
	}
}

func StartWS() {
	go broadcastMsg()
	go handleDisconnect()
}

func EndWS() {
	log.Println("End od websocket service")
	for _, ci := range clients {
		for conn := range ci.WsConn {
			conn.Close()
		}
	}
}
