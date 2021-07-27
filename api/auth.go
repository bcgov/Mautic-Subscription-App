package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/Nerzal/gocloak/v8"
)

// keycloak authentication function that wraps handlers needing keycloak auth
func keycloakAuth(fn func(http.ResponseWriter, *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Access-Control-Allow-Credentials", "true")
		w.Header().Add("Access-Control-Allow-Headers", "Content-Type, Authorization, Email, ContactId, SegmentsAndIds")
		w.Header().Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")

		if r.Method == "OPTIONS" {
			http.Error(w, "No Content", http.StatusNoContent)
			return
		}
		authHeader := strings.Fields(r.Header.Get("Authorization"))

		if len(authHeader) < 2 {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, "Invalid authorization header")
			return
		}
		token := authHeader[1]
		kcClientID := os.Getenv("KC_CLIENT_ID")
		kcClientSecret := os.Getenv("KC_CLIENT_SECRET")
		kcRealm := os.Getenv("KC_REALM")
		kcURL := os.Getenv("KC_URL")
		kcClient := gocloak.NewClient((kcURL))

		ctx := context.Background()
		_, err := kcClient.LoginClient(ctx, kcClientID, kcClientSecret, kcRealm)

		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			fmt.Fprintf(w, "Keycloak Login failed:"+err.Error())
			return
		}

		
		_, err = kcClient.GetUserInfo(ctx, token, kcRealm)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			fmt.Fprintf(w, "Invalid Keycloak Token:"+err.Error())
			return
		}
		
		//Execute handler function if token is valid
		fn(w, r)
	}
}
