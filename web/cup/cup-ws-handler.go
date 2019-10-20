package cup

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type ClientInfo struct {
	Username   string
	ConnName   string
	WsConn     map[*websocket.Conn]bool
	GameInProg *GameInProgress
	reconCh    chan *ClientInfo
}

func (ci *ClientInfo) GetReconnectCh(create bool) chan *ClientInfo {
	if ci.reconCh == nil {
		if create {
			ci.reconCh = make(chan *ClientInfo)
		}
	}
	return ci.reconCh
}

func (ci *ClientInfo) DisposeReconnectCh() {
	if ci.reconCh != nil {
		close(ci.reconCh)
		ci.reconCh = nil
		delete(disconnectingClients, ci.ConnName) // TODO use mutex
	}
}

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
	upgrader             websocket.Upgrader
	clients              = make(map[string]*ClientInfo)
	disconnectingClients = make(map[string]*ClientInfo)
	clientCount          = 0
	broadcastCh          = make(chan *MessageSnd)
	discClientCh         = make(chan *ClientInfo)
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

	info := ClientInfo{} // TODO use NewCLientInfo(conn)
	connName := getConnName()
	info.WsConn = make(map[*websocket.Conn]bool)
	info.WsConn[conn] = true
	info.ConnName = connName
	clients[connName] = &info // TODO use mutex
	log.Printf("Client %q is connected. Connected clients %d", connName, len(clients))

	mm := &MessageSnd{MsgJson: cmdInfo("WELCOME_SERVER_CUPERATIVA_WS - 10.0.0")}
	mm.TargetClientInfos = []string{connName}
	broadcastCh <- mm

	checkReconnect(&info) // TODO do it after login

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Websocket read error ", err)
			closeWsConn(&info, conn)
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

func closeWsConn(ci *ClientInfo, conn *websocket.Conn) { // TODO add as method of ClientInfo
	ci.WsConn[conn] = false
	delete(ci.WsConn, conn)
	if len(ci.WsConn) == 0 {
		if ci.GameInProg == nil || ci.Username == "" {
			log.Printf("Client %q disconnect immediately\n", ci.ConnName)
			discClientCh <- ci
		} else {
			disconnectingClients[ci.ConnName] = ci // TODO use mutex
			go delayedDisconnect(ci)
		}
	}
}

func delayedDisconnect(ci *ClientInfo) { // TODO add as method of ClientInfo
	log.Println("Delayed disconnect for ", ci.ConnName)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	for {
		select {
		case crNew := <-ci.GetReconnectCh(true):
			log.Println("Client reconnect", crNew)
			log.Printf("Good news, %q reconnect with this connection: %q", ci.ConnName, crNew.ConnName)
			discClientCh <- ci
			// TODO restore game in progress with now crNew
			return
		case <-ctx.Done():
			log.Printf("Context done, disconnect %q", ci.ConnName)
			discClientCh <- ci
			return
		}
	}
}

func checkReconnect(ciNew *ClientInfo) { // TODO add as method of disconnectingClients
	if len(disconnectingClients) == 0 {
		return
	}
	log.Println("Check for reconnect")
	for _, ci := range disconnectingClients {
		if ciNew.Username == ci.Username {
			crCh := ci.GetReconnectCh(false)
			if crCh != nil {
				crCh <- ciNew
				return
			}
		}
	}
}

func handleDisconnect() {
	for {
		ci := <-discClientCh
		log.Printf("Disconnect client %q", ci.ConnName)
		ci.DisposeReconnectCh()
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
