package ws

import (
	"fmt"
	"log"
	"sync"
)

type Clients struct {
	clients map[string]*ClientInfo
	mux     sync.Mutex
}

func (c *Clients) AddConn(ci *ClientInfo) {
	c.mux.Lock()
	c.clients[ci.ConnName] = ci
	c.mux.Unlock()
	log.Printf("Client %q is connected. Connected clients %d", ci.ConnName, len(c.clients))
}

func (c *Clients) RemoveConn(connName string) {
	c.mux.Lock()
	delete(c.clients, connName)
	c.mux.Unlock()
	log.Printf("Clients still connected %d", len(c.clients))
}

func (c *Clients) CloseAllConn() {
	for _, ci := range c.clients {
		for conn := range ci.WsConn {
			conn.Close()
		}
	}
}

func (c *Clients) GetClientInfo(connName string) (*ClientInfo, error) {
	if val, ok := c.clients[connName]; ok {
		return val, nil
	}
	return nil, fmt.Errorf("%s not found", connName)
}
