package cup

import (
	"fmt"
	"log"
	"net/http"
)

func handlePost(w http.ResponseWriter, req *http.Request) error {
	var err error
	lastPath := getURLForRoute(req.RequestURI)
	log.Println("Check the last path ", lastPath)
	switch lastPath {
	
	default:
		return fmt.Errorf("%s method is not supported", lastPath)
	}

	return err
}
