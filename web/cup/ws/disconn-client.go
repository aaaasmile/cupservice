package ws

import (
	"context"
	"log"
	"sync"
	"time"
)

type DisconnClient struct {
	disconnectingClients map[string]*ClientInfo
	discClientCh         chan *ClientInfo
	mux                  sync.Mutex
}

func (dc *DisconnClient) Init(discCh chan *ClientInfo) {
	dc.disconnectingClients = make(map[string]*ClientInfo)
	dc.discClientCh = discCh
}

func (dc *DisconnClient) StartDisconn(ci *ClientInfo) {
	dc.mux.Lock()
	dc.disconnectingClients[ci.ConnName] = ci
	dc.mux.Unlock()

	go dc.delayedDisconnect(ci)
}

func (dc *DisconnClient) EndDisconn(ci *ClientInfo) {
	dc.mux.Lock()
	delete(dc.disconnectingClients, ci.ConnName)
	dc.mux.Unlock()

}

func (dc *DisconnClient) ImmediateDisconn(ci *ClientInfo) {
	log.Printf("Client %q disconnect immediately\n", ci.ConnName)
	dc.discClientCh <- ci
}

func (dc *DisconnClient) CheckReconnect(ciNew *ClientInfo) {
	if len(dc.disconnectingClients) == 0 {
		return
	}
	log.Println("Check for reconnect")
	for _, ci := range dc.disconnectingClients {
		if ciNew.Username == ci.Username {
			crCh := ci.GetReconnectCh(false)
			if crCh != nil {
				crCh <- ciNew
				return
			}
		}
	}
}

func (dc *DisconnClient) delayedDisconnect(ci *ClientInfo) {
	log.Println("Delayed disconnect for ", ci.ConnName)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	for {
		select {
		case crNew := <-ci.GetReconnectCh(true):
			log.Println("Client reconnect", crNew)
			log.Printf("Good news, %q reconnect with this connection: %q", ci.ConnName, crNew.ConnName)
			dc.discClientCh <- ci
			// TODO restore game in progress with now crNew
			return
		case <-ctx.Done():
			log.Printf("Context done, disconnect %q", ci.ConnName)
			dc.discClientCh <- ci
			return
		}
	}
}

func NewDisconnClient(discCh chan *ClientInfo) *DisconnClient {
	dc := &DisconnClient{}
	dc.Init(discCh)
	return dc
}
