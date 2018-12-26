package db

import (
	"database/sql"
	"fmt"
	"log"

	"../conf"
	_ "github.com/lib/pq"
)

var (
	connDb *sql.DB
)

const (
	pageSize = 30
)

func OpenDatabase() {
	dbConf := conf.Current.DataBase
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		dbConf.Host, dbConf.Port, dbConf.User, dbConf.Password, dbConf.DatabaseName)

	var err error
	connDb, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal("Db connection error: ", err)
	}
	log.Println("Database open OK")
}

func Close() {
	log.Println("Close DB connection")
	connDb.Close()
}
