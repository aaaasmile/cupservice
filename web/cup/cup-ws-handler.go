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
	Clients    map[*websocket.Conn]bool
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
		delete(disconnectingClients, ci.ConnName)
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
	clientCount++
	return fmt.Sprintf("Client %d", clientCount)
}

func cmdInfo(det string) string {
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
	info.Clients = make(map[*websocket.Conn]bool)
	info.Clients[conn] = true
	info.ConnName = connName
	clients[connName] = &info
	log.Printf("Client %q is connected. Connected clients %d", connName, len(clients))

	mm := &MessageSnd{MsgJson: cmdInfo("WELCOME_SERVER_CUPERATIVA_WS - 10.0.0")}
	mm.TargetClientInfos = []string{connName}
	broadcastCh <- mm

	checkReconnect(&info) // TODO do it after login

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Websocket read error ", err)
			info.Clients[conn] = false
			delete(info.Clients, conn)
			if len(info.Clients) == 0 {
				discClientCh <- &info
			}
			return
		}
		if messageType == websocket.TextMessage {
			log.Println("Message rec: ", string(p))
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
			for conn := range ci.Clients {
				err := conn.WriteMessage(websocket.TextMessage, []byte(msg.MsgJson))
				if err != nil {
					log.Println("Socket error: ", err)
					conn.Close()
					delete(ci.Clients, conn)
				}
			}
		}
	}
}

func checkReconnect(ciNew *ClientInfo) {
	if len(disconnectingClients) == 0 {
		return
	}
	log.Println("Check for reconnect")
	for _, ci := range disconnectingClients {
		if ciNew != nil { //ciNew.Username == ci.Username { // TODO use ==
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
		disconnectingClients[ci.ConnName] = ci
		if ci.GameInProg != nil { // Test TODO remove != and use ==
			log.Printf("Client %q disconnect immediately\n", ci.ConnName)
			disconnectClient(ci)
		} else {
			go delayedDisconnect(ci)
		}
	}
}

func delayedDisconnect(clientInfo *ClientInfo) {
	log.Println("Delayed disconnect for ", clientInfo.ConnName)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	for {
		select {
		case crNew := <-clientInfo.GetReconnectCh(true):
			log.Println("Client reconnect", crNew)
			log.Printf("Good news, %q reconnect with this connection: %q", clientInfo.ConnName, crNew.ConnName)
			disconnectClient(clientInfo)
			// TODO restore game in progress with now crNew
			return
		case <-ctx.Done():
			log.Printf("Context done, disconnect %q", clientInfo.ConnName)
			disconnectClient(clientInfo)
			return
		}
	}
}

func disconnectClient(ci *ClientInfo) {
	log.Printf("Disconnect client %q", ci.ConnName)
	ci.DisposeReconnectCh()
	delete(clients, ci.ConnName)
	log.Println("Connected clients: ", len(clients))
}

func StartWS() {
	go broadcastMsg()
	go handleDisconnect()
}

func EndWS() {
	log.Println("End od websocket service")
	for _, ci := range clients {
		for conn := range ci.Clients {
			conn.Close()
		}
	}
}
