package cup

import (
	"log"
	"net/http"
	"net/url"
	"strings"
	"text/template"

	"../../conf"
	"../idl"
)

func checkDoRquest(reqURI string) bool {
	aa := strings.Split(reqURI, "/")
	cmd := aa[len(aa)-1]
	//fmt.Println(cmd)
	return strings.HasPrefix(cmd, "do")
}

func CupAPiHandler(w http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "GET":
		handleIndexGet(w, req)
	case "POST":
		log.Println("POST", req.RequestURI)
		handlePost(w, req)
	}
}

func handlePost(w http.ResponseWriter, req *http.Request) {
	u, err := url.Parse(req.RequestURI)
	if err != nil {
		log.Println("Error uri: ", err)
		return
	}
	if ok := checkDoRquest(req.RequestURI); !ok {
		log.Println("Command invalid", req.RequestURI)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("400 - Bad Request"))
		return
	}
	q := u.Query()
	log.Println(q) // interface: do?req=<string>

	log.Println("Command invalid", req.RequestURI)
	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte("400 - Bad Request"))
}

var (
	tmplIndex *template.Template
)

type PageCtx struct {
	Buildnr string
	RootUrl string
}

func handleIndexGet(w http.ResponseWriter, req *http.Request) {
	pagectx := PageCtx{
		RootUrl: conf.Current.RootURLPattern,
		Buildnr: idl.Buildnr,
	}
	templName := "templates/index.html"
	if conf.Current.UseProdTemplate {
		templName = "templates/index_prod.html"
	}
	if tmplIndex == nil || conf.Current.AlwaysReloadTempl {
		log.Println("Load the template, reload on request is ", conf.Current.AlwaysReloadTempl)
		tmplIndex = template.Must(template.New("AppIndex").ParseFiles(templName))
	}
	err := tmplIndex.ExecuteTemplate(w, "base", pagectx)
	if err != nil {
		log.Fatal(err)
	}
}
