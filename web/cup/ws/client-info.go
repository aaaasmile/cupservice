package ws

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/gorilla/websocket"
)

const charset = "abcdefghijklmnopqrstuvwxyz" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

var seededRand *rand.Rand = rand.New(
	rand.NewSource(time.Now().UnixNano()))

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

func (ci *ClientInfo) stringWithCharset(length int, charset string) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func (ci *ClientInfo) getConnName() string {
	return fmt.Sprintf("Client-%s", ci.stringWithCharset(5, charset))
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
