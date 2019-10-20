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
	upgrader       websocket.Upgrader
	clients        = make(map[string]*ClientInfo)
	clientCount    = 0
	broadcastCh    = make(chan *MessageSnd)
	discClientCh   = make(chan *ClientInfo)
	reconnClientCh = make(chan *ClientInfo)
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
	connName := getConnName()
	info := ClientInfo{}
	info.Clients = make(map[*websocket.Conn]bool)
	info.Clients[conn] = true
	info.ConnName = connName
	clients[connName] = &info
	log.Printf("Client is connected. Connected clients %d", len(clients))

	mm := &MessageSnd{MsgJson: cmdInfo("WELCOME_SERVER_CUPERATIVA_WS - 10.0.0")}
	mm.TargetClientInfos = []string{connName}
	broadcastCh <- mm

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

func handleDisconnect() {
	for {
		ci := <-discClientCh
		if ci.GameInProg == nil {
			disconnectClient(ci)
		} else {
			go func(clientInfo *ClientInfo) {
				ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
				defer cancel()
				for {
					select {
					case cr := <-reconnClientCh:
						log.Println("Client reconnect", cr)
						if cr.Username == clientInfo.Username {
							log.Printf("Good news, %s reconnect", cr.Username)
							// TODO restore game in progress
							return
						}
					case <-ctx.Done():
						log.Println("Context done")
						disconnectClient(ci)
					}
				}
			}(ci)
		}
	}
}

func disconnectClient(ci *ClientInfo) {
	log.Printf("Client %s disconnect immediately\n", ci.ConnName)
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
