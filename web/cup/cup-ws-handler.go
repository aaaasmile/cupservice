package cup

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type ClientRequest struct {
	Type     string
	Username string
}

var upgrader websocket.Upgrader

func WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WS error", err)
		return
	}

	for {
		clientReq := &ClientRequest{}
		err := conn.ReadJSON(clientReq)
		if err != nil {
			log.Println(err)
			return
		}
		log.Printf("Message from client: %#v", clientReq)
		if 0 == len(clientReq.Username) {
			return
		}
	}

}
