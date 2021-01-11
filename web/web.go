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

	"github.com/aaaasmile/cupservice/conf"
	"github.com/aaaasmile/cupservice/web/cup"
)

func RunService(configfile string) error {

	conf.ReadConfig(configfile)
	log.Println("Configuration is read")

	serverurl := conf.Current.ServiceURL
	cupServURL := fmt.Sprintf("http://%s%s", strings.Replace(serverurl, "0.0.0.0", "localhost", 1), conf.Current.RootURLPattern)
	cupServURL = strings.Replace(cupServURL, "127.0.0.1", "localhost", 1)
	log.Println("Server started with URL ", serverurl)
	log.Println("Try this url: ", cupServURL)

	http.Handle(conf.Current.RootURLPattern+"static/", http.StripPrefix(conf.Current.RootURLPattern+"static/", http.FileServer(http.Dir("static"))))
	http.Handle(conf.Current.RootURLPattern+"static2/", http.StripPrefix(conf.Current.RootURLPattern+"static2/", http.FileServer(http.Dir("static2"))))
	http.HandleFunc(conf.Current.RootURLPattern, cup.APiHandler)
	if conf.Current.UseUnitTest {
		log.Printf("Unit test suport is enabled: %stest-jasmine", cupServURL)
		http.HandleFunc(conf.Current.RootURLPattern+"test-jasmine", cup.HandleTestJasmineGet)
	}
	if conf.Current.UseWebSocket {
		log.Println("Websocket handler enabled")
		http.HandleFunc("/websocket", cup.WsHandler)
		cup.WsInit()
	}

	srv := &http.Server{
		Addr:         serverurl,
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      nil,
	}

	chShutdown := make(chan struct{}, 1)
	go func(chs chan struct{}) {
		if err := srv.ListenAndServe(); err != nil {
			log.Println("Server is not listening anymore: ", err)
			chs <- struct{}{}
		}
	}(chShutdown)

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt)
	log.Println("Enter in server loop")
loop:
	for {
		select {
		case <-sig:
			log.Println("stop because interrupt")
			break loop
		case <-chShutdown:
			log.Println("stop because service shutdown on listening")
			log.Fatal("Force with an error to restart")
			break loop
		}
	}

	if conf.Current.UseWebSocket {
		cup.HandlerShutdown()
	}

	wait := 3 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), wait)
	defer cancel()
	err := srv.Shutdown(ctx)
	if err != nil {
		log.Println("Shutdown error: ", err)
	}

	log.Println("Bye, service")
	return nil
}
