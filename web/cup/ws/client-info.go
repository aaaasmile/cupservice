package ws

import (
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

func NewClientInfo(conn *websocket.Conn) *ClientInfo {
	info := ClientInfo{}
	connName := getConnName()
	info.WsConn = make(map[*websocket.Conn]bool)
	info.WsConn[conn] = true
	info.ConnName = connName
	return &info
}
