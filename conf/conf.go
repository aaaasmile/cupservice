package conf

import (
	"log"
	"os"

	"github.com/BurntSushi/toml"
)

type DataBase struct {
	Host         string
	Port         int
	User         string
	Password     string
	DatabaseName string
}

type Config struct {
	ServiceURL        string
	RootURLPattern    string
	AlwaysReloadTempl bool
	UseProdTemplate   bool
	Framework         string
	DatabaseEngine    string
	DataBase          *DataBase
}

var Current = &Config{
	ServiceURL: "127.0.0.1:5568",
}

func ReadConfig(configfile string) *Config {
	_, err := os.Stat(configfile)
	if err != nil {
		log.Fatal(err)
	}
	if _, err := toml.DecodeFile(configfile, &Current); err != nil {
		log.Fatal(err)
	}
	return Current
}
