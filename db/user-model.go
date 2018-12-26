package db

import (
	"database/sql"
	"fmt"
	"log"
	"time"
)

type User struct {
	ID                int
	LoginName         string
	State             string
	Email             string
	Password          string
	Salt              string
	Fullname          string
	Gender            string
	RemToken          string
	PasswordResetCode string
	RemTokenExpiresAt time.Time
	LastLogin         time.Time
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

func GetUsers() []User {
	sqlStatement := `
	SELECT id, login, state, email, crypted_password, salt, fullname, gender, remember_token, password_reset_code,
	       remember_token_expires_at, lastlogin, created_at, updated_at
		FROM public.users LIMIT $1`

	result := []User{}
	log.Println("Execute query: ", sqlStatement)
	rows, err := connDb.Query(sqlStatement, 20)
	if err != nil {
		log.Println("SQL query error:", err)
		return result
	}
	defer rows.Close()
	for rows.Next() {
		var u User
		var remtokexp, lastlogin, created, updated sql.NullString
		var gender, fn, remtok, pwrese sql.NullString
		err = rows.Scan(&u.ID, &u.LoginName, &u.State, &u.Email, &u.Password, &u.Salt,
			&fn, &gender, &remtok, &pwrese,
			&remtokexp, &lastlogin, &created, &updated)
		if err != nil {
			log.Println("Query scan error:", err)
			return result
		}
		fmt.Println(u.ID, u.LoginName)
		if fn.Valid {
			u.Fullname = fn.String
		}
		if gender.Valid {
			u.Gender = gender.String
		}
		if remtok.Valid {
			u.RemToken = remtok.String
		}
		if pwrese.Valid {
			u.PasswordResetCode = pwrese.String
		}
		result = append(result, u)
	}
	// get any error encountered during iteration
	err = rows.Err()
	if err != nil {
		log.Println("Row error ", err)
	}

	return result
}
