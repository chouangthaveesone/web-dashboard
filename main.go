package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	// Simple static file server serving the "static" directory
	staticDir := "./static"
	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		log.Fatalf("Directory %s does not exist", staticDir)
	}

	fs := http.FileServer(http.Dir(staticDir))
	http.Handle("/", fs)

	port := "8080"
	if p := os.Getenv("PORT"); p != "" {
		port = p
	}

	log.Printf("Starting web-dashboard server on http://localhost:%s", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
