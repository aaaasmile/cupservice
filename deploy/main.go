package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"strings"
	"time"

	"github.com/aaaasmile/cupservice/deploy/depl"
)

var (
	defOutDir = "~/app/go/cupservice/zips/"
)

func main() {
	const (
		cupservice = "cupservice"
	)
	var outdir = flag.String("outdir", "",
		fmt.Sprintf("Output zip directory. If empty use the hardcoded one: %s\n", defOutDir))

	var target = flag.String("target", "",
		fmt.Sprintf("Target of deployment: %s", cupservice))

	flag.Parse()

	rootDirRel := ".."
	pathItems := []string{"cupservice.bin", "static", "templates"}
	switch *target {
	case cupservice:
		pathItems = append(pathItems, "deploy/config_files/cup_config.toml")
		pathItems[0] = "cupservice.bin"
	default:
		log.Fatalf("Deployment target %s is not recognized or not specified", *target)
	}
	log.Printf("Create the zip package for target %s", *target)

	outFn := getOutFileName(*outdir, *target)
	depl.CreateDeployZip(rootDirRel, pathItems, outFn, func(pathItem string) string {
		if strings.HasPrefix(pathItem, "deploy/config_files") {
			return "config.toml"
		}
		return pathItem
	})
}

func getOutFileName(outdir string, tgt string) string {
	if outdir == "" {
		outdir = defOutDir
	}
	vn := depl.GetVersionNrFromFile("../web/idl/idl.go", "")
	log.Println("Version is ", vn)

	currentTime := time.Now()
	s := fmt.Sprintf("cupservice_%s_%s_%s.zip", strings.Replace(vn, ".", "-", -1), currentTime.Format("02012006-150405"), tgt) // current date-time stamp using 2006 date time format template
	s = filepath.Join(outdir, s)
	return s
}

func testGetVersion() {
	buf, err := ioutil.ReadFile("../web/idl/idl.go")
	if err != nil {
		log.Fatalln("Cannot read input file", err)
	}
	s := string(buf)
	fmt.Println(s)
	vn := depl.GetBuildVersionNr(s, "")
	if vn == "" {
		log.Fatalln("Version not found")
	}
	fmt.Println("Version is ", vn)
}
