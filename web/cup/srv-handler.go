package cup

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/aaaasmile/cupservice/conf"
	"github.com/aaaasmile/cupservice/web/idl"
)

type PageCtx struct {
	RootUrl    string
	Buildnr    string
	VueLibName string
}

func getURLForRoute(uri string) string {
	arr := strings.Split(uri, "/")
	//fmt.Println("split: ", arr, len(arr))
	for i := len(arr) - 1; i >= 0; i-- {
		ss := arr[i]
		if ss != "" {
			if !strings.HasPrefix(ss, "?") {
				//fmt.Printf("Url for route is %s\n", ss)
				return ss
			}
		}
	}
	return uri
}

func APiHandler(w http.ResponseWriter, req *http.Request) {
	start := time.Now()
	log.Println("Request: ", req.RequestURI)
	var err error
	switch req.Method {
	case "GET":
		err = handleGet(w, req)
	case "POST":
		log.Println("POST on ", req.RequestURI)
		err = handlePost(w, req)
	}
	if err != nil {
		log.Println("Error exec: ", err)
		http.Error(w, fmt.Sprintf("Internal error on execute: %v", err), http.StatusInternalServerError)
	}

	t := time.Now()
	elapsed := t.Sub(start)
	log.Printf("Service %s total call duration: %v\n", idl.Appname, elapsed)
}

func handleGet(w http.ResponseWriter, req *http.Request) error {
	u, _ := url.Parse(req.RequestURI)
	log.Println("GET requested ", u)

	pagectx := PageCtx{
		RootUrl:    conf.Current.RootURLPattern,
		Buildnr:    idl.Buildnr,
		VueLibName: conf.Current.VueLibName,
	}
	templName := "templates/index.html"

	tmplIndex := template.Must(template.New("AppIndex").ParseFiles(templName))

	err := tmplIndex.ExecuteTemplate(w, "base", pagectx)
	if err != nil {
		return err
	}
	return nil
}

func writeResponse(w http.ResponseWriter, resp interface{}) error {
	blobresp, err := json.Marshal(resp)
	if err != nil {
		return err
	}
	w.Write(blobresp)
	return nil
}

func writeErrorResponse(w http.ResponseWriter, errorcode int, resp interface{}) error {
	blobresp, err := json.Marshal(resp)
	if err != nil {
		return err
	}
	http.Error(w, string(blobresp), errorcode)
	return nil
}

func HandlerShutdown() {
	chstop := make(chan struct{})
	chTimeout := make(chan struct{})
	timeout := 3 * time.Second
	time.AfterFunc(timeout, func() {
		chTimeout <- struct{}{}
	})

	go func(chst chan struct{}) {
		WsHandlerShutdown()
	}(chstop)
	count := 1
	select {
	case <-chstop:
		log.Println("WS handler terminated ok")
		count--
		if count <= 0 {
			log.Println("Shutdown ok")
			break
		}

	case <-chTimeout:
		log.Println("Timeout on shutdown, something was blockd")
		break
	}
	log.Println("Exit from HandlerShutdown")
}

func init() {
}
