package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	http.HandleFunc("/segments", getSegmentAndIds)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}
}

type SegmentData struct {
	Total int                `json:"total"`
	Lists map[string]Segment `json:"lists"`
}

type Segment struct {
	IsPublished        bool          `json:"isPublished"`
	DateAdded          time.Time     `json:"dateAdded"`
	DateModified       time.Time     `json:"dateModified"`
	CreatedBy          int           `json:"createdBy"`
	CreatedByUser      string        `json:"createdByUser"`
	ModifiedBy         int           `json:"modifiedBy"`
	ModifiedByUser     string        `json:"modifiedByUser"`
	ID                 int           `json:"id"`
	Name               string        `json:"name"`
	Alias              string        `json:"alias"`
	Description        interface{}   `json:"description"`
	Filters            []interface{} `json:"filters"`
	IsGlobal           bool          `json:"isGlobal"`
	IsPreferenceCenter bool          `json:"isPreferenceCenter"`
}

type SegmentAndID struct {
	SegmentName string
	SegmentID   string
}

func getSegmentAndIds(w http.ResponseWriter, r *http.Request) {
	// Load env variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	mauticUser := os.Getenv("MAUTIC_USER")
	mauticPW := os.Getenv("MAUTIC_PW")
	mauticURL := os.Getenv("MAUTIC_URL")

	client := &http.Client{}
	req, err := http.NewRequest("GET", mauticURL+"api/segments", nil)
	req.SetBasicAuth(mauticUser, mauticPW)

	resp, err := client.Do(req)

	if err != nil {
		fmt.Fprintf(w, "The HTTP request failed with error %s\n", err)
	} else {
		bodyText, _ := ioutil.ReadAll(resp.Body)
		dec := json.NewDecoder(strings.NewReader(string(bodyText)))
		segmentAndIDs := []SegmentAndID{}

		for {
			var data SegmentData
			if err := dec.Decode(&data); err == io.EOF {
				break
			} else if err != nil {
				log.Fatal(err)
			}
			// Append segment and ID to output
			for _, value := range data.Lists {
				curSegmentAndID := SegmentAndID{strconv.Itoa(value.ID), value.Name}
				segmentAndIDs = append(segmentAndIDs, curSegmentAndID)
			}

			// Marshall array to json
			b, err := json.Marshal(segmentAndIDs)
			if err != nil {
				fmt.Fprintf(w, "Marshal failed with error %s\n", err)
			}
			fmt.Fprintf(w, "%s \n", b)
		}
	}
}
