package ws

import (
	"fmt"
	"math/rand"
	"sync"
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
	mux        sync.Mutex
}

func (ci *ClientInfo) Init(conn *websocket.Conn) {
	connName := ci.getConnName()
	ci.WsConn = make(map[*websocket.Conn]bool)
	ci.WsConn[conn] = true
	ci.ConnName = connName
}

func (ci *ClientInfo) MergeConn(ciSource *ClientInfo) {
	ci.mux.Lock()
	for con := range ciSource.WsConn {
		ci.WsConn[con] = true
	}
	ci.mux.Unlock()
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

func (ci *ClientInfo) CloseWsConn(conn *websocket.Conn, dc *DisconnClient) {
	ci.WsConn[conn] = false
	ci.mux.Lock()
	delete(ci.WsConn, conn) // TODO use mutex
	ci.mux.Unlock()
	if len(ci.WsConn) == 0 {
		//if false && (ci.GameInProg == nil || ci.Username == "") {
		if ci.GameInProg == nil || ci.Username == "" {
			dc.ImmediateDisconn(ci)
		} else {
			dc.StartDisconn(ci)
		}
	}
}

func NewClientInfo(conn *websocket.Conn) *ClientInfo {
	info := ClientInfo{}
	info.Init(conn)
	return &info
}
