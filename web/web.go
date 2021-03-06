package web

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"

	"time"

	"../conf"
	"../db"
	"./cup/rest"
	"./cup/ws"
)

func RunService(configfile string) {

	conf.ReadConfig(configfile)
	log.Println("Configuration is read")
	if conf.Current.DatabaseEngine != "DatabaseNone" {
		db.OpenDatabase()
	}

	serverurl := conf.Current.ServiceURL
	cupServURL := fmt.Sprintf("http://%s%s", strings.Replace(serverurl, "0.0.0.0", "localhost", 1), conf.Current.RootURLPattern)
	cupServURL = strings.Replace(cupServURL, "127.0.0.1", "localhost", 1)
	log.Println("Server started with URL ", serverurl)
	log.Println("Try this url: ", cupServURL)

	http.Handle(conf.Current.RootURLPattern+"static/", http.StripPrefix(conf.Current.RootURLPattern+"static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc(conf.Current.RootURLPattern, rest.CupAPiHandler)
	http.HandleFunc("/websocket", ws.WsHandler)

	srv := &http.Server{
		Addr:         serverurl,
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      nil,
	}
	go func() {
		if err := srv.ListenAndServe(); err != nil {
			log.Println("Server is not listening anymore: ", err)
		}
	}()

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt)
	ws.StartWS()
	log.Println("Enter in server loop")
loop:
	for {
		select {
		case <-sig:
			log.Println("stop because interrupt")
			break loop
		}
	}

	var wait time.Duration = 5 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), wait)
	defer cancel()
	srv.Shutdown(ctx)
	ws.EndWS()
	log.Println("Bye, service")
}
