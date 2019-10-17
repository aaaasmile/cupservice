package cup

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// type ClientRequest struct {
// 	Type     string
// 	Username string
// }

type ClientInfo struct {
	Username string
	Clients  map[*websocket.Conn]bool
}

type Message struct {
	MsgJson           string
	TargetClientInfos []string
}

var upgrader websocket.Upgrader

var clients = make(map[string]*ClientInfo)
var clientCount = 0
var broadcast = make(chan *Message)

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
	log.Println("Client is connected")
	name := getConnName()
	info := ClientInfo{}
	info.Clients = make(map[*websocket.Conn]bool)
	info.Clients[conn] = true
	info.Username = name
	clients[name] = &info

	mm := &Message{MsgJson: cmdInfo("WELCOME_SERVER_CUPERATIVA_WS - 10.0.0")}
	mm.TargetClientInfos = []string{name}
	broadcast <- mm

	// for {
	// 	clientReq := &ClientRequest{}
	// 	err := conn.ReadJSON(clientReq)
	// 	if err != nil {
	// 		log.Println(err)
	// 		return
	// 	}
	// 	log.Printf("Message from client: %#v", clientReq)
	// 	if 0 == len(clientReq.Username) {
	// 		return
	// 	}
	// }
}

func broadcastMsg() {
	log.Println("Waiting for broadcast")
	for {
		msg := <-broadcast
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

func StartWS() {
	go broadcastMsg()
}
