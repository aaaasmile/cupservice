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
	upgrader       websocket.Upgrader
	clients        = Clients{clients: make(map[string]*ClientInfo)}
	broadcastCh    = make(chan *MessageSnd)
	removeClientCh = make(chan *ClientInfo)
	disconnClient  = NewDisconnClient(removeClientCh)
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
	// TODO after login: check user already connected: 1) ciPrev.MergeConn(ciNew) 2) ciNew.SendStatusFrom(ciPrev)  3) removeClientCh <- ciNew

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Websocket read error ", err)
			ci.CloseWsConn(conn, disconnClient)
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
					ci.CloseWsConn(conn, disconnClient)
				}
			}
		}
	}
}

func handleRemoveClient() {
	for {
		ci := <-removeClientCh
		log.Printf("Remove client with connection %q", ci.ConnName)
		ci.DisposeReconnectCh(disconnClient)
		clients.RemoveConn(ci.ConnName)
	}
}

func StartWS() {
	go broadcastMsg()
	go handleRemoveClient()
}

func EndWS() {
	log.Println("End od websocket service")
	clients.CloseAllConn()
}
