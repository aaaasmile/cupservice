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
	clients       = Clients{clients: make(map[string]*ClientInfo)}
	broadcastCh   = make(chan *MessageSnd)
	discClientCh  = make(chan *ClientInfo)
	disconnClient = NewDisconnClient(discClientCh)
)

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

	ci := NewClientInfo(conn)
	clients.AddConn(ci)

	mm := &MessageSnd{MsgJson: cmdInfo("WELCOME_SERVER_CUPERATIVA_WS - 10.0.0")}
	mm.TargetClientInfos = []string{ci.ConnName}
	broadcastCh <- mm

	disconnClient.CheckReconnect(ci) // TODO do it after login

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Websocket read error ", err)
			closeWsConn(ci, conn)
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
			ci, err := clients.GetClientInfo(name)
			if err != nil {
				log.Println("Client info error: ", err)
				continue
			}
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
		clients.RemoveConn(ci.ConnName)
	}
}

func StartWS() {
	go broadcastMsg()
	go handleDisconnect()
}

func EndWS() {
	log.Println("End od websocket service")
	clients.CloseAllConn()
}
