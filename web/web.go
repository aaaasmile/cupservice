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
	"./cup"
)

func RunService(configfile string) {

	conf.ReadConfig(configfile)
	log.Println("Configuration is read")
	if conf.Current.DatabaseEngine != "DatabaseNone" {
		db.OpenDatabase()
	}

	var wait time.Duration
	serverurl := conf.Current.ServiceURL
	cupServURL := fmt.Sprintf("http://%s%s", strings.Replace(serverurl, "0.0.0.0", "localhost", 1), conf.Current.RootURLPattern)
	cupServURL = strings.Replace(cupServURL, "127.0.0.1", "localhost", 1)
	log.Println("Server started with URL ", serverurl)
	log.Println("Try this url: ", cupServURL)

	http.Handle(conf.Current.RootURLPattern+"static/", http.StripPrefix(conf.Current.RootURLPattern+"static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc(conf.Current.RootURLPattern, cup.CupAPiHandler)
	http.HandleFunc("/websocket", cup.WsHandler)

	srv := &http.Server{
		Addr: serverurl,
		// Good practice to set timeouts to avoid Slowloris attacks.
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
	signal.Notify(sig, os.Interrupt) //We'll accept graceful shutdowns when quit via SIGINT (Ctrl+C)
	cup.StartWS()
	log.Println("Enter in server loop")
loop:
	for {
		select {
		case <-sig:
			log.Println("stop because interrupt")
			break loop
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), wait)
	defer cancel()
	srv.Shutdown(ctx)

	log.Println("Bye, service")
}
