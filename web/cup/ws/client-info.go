package ws

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type ClientInfo struct {
	Username   string
	ConnName   string
	WsConn     map[*websocket.Conn]bool
	GameInProg *GameInProgress
	reconCh    chan *ClientInfo
}

func (ci *ClientInfo) Init(conn *websocket.Conn) {
	connName := ci.getConnName()
	ci.WsConn = make(map[*websocket.Conn]bool)
	ci.WsConn[conn] = true
	ci.ConnName = connName
}

func (ci *ClientInfo) getConnName() string {
	clientCount++ // TODO use rnd id
	return fmt.Sprintf("Client %d", clientCount)
}

func (ci *ClientInfo) GetReconnectCh(create bool) chan *ClientInfo {
	if ci.reconCh == nil {
		if create {
			ci.reconCh = make(chan *ClientInfo)
		}
	}
	return ci.reconCh
}

func (ci *ClientInfo) DisposeReconnectCh(dc *DisconnClient) {
	if ci.reconCh != nil {
		close(ci.reconCh)
		ci.reconCh = nil
		dc.EndDisconn(ci)
	}
}

func NewClientInfo(conn *websocket.Conn) *ClientInfo {
	info := ClientInfo{}
	info.Init(conn)
	return &info
}
