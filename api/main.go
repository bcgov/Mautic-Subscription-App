package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func main() {
	http.HandleFunc("/segments", getSegments)
	http.HandleFunc("/segments/ids", getSegmentAndIds)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}

	// response, err := http.Get("https://google.com")
	// if err != nil {
	// 	fmt.Printf("The HTTP request failed with error %s\n", err)
	// } else {
	// 	data, _ := ioutil.ReadAll(response.Body)
	// 	fmt.Println(string(data))
	// }

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
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://mautic-theme-de0974-dev.apps.silver.devops.gov.bc.ca/api/segments", nil)
	req.SetBasicAuth("mautic", "mautic")

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
			for _, value := range data.Lists {
				// output := strconv.Itoa(value.ID) + value.Name
				// fmt.Fprintf(w, output  + "\n")
				curSegmentAndID := SegmentAndID{strconv.Itoa(value.ID), value.Name}
				segmentAndIDs = append(segmentAndIDs, curSegmentAndID)

			}
			b, err := json.Marshal(segmentAndIDs)
			if err != nil {
				fmt.Fprintf(w, "Marshal failed with error %s\n", err)
			}
			fmt.Fprintf(w, "%s \n", b)
		}
	}
}

func getSegments(w http.ResponseWriter, r *http.Request) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://mautic-theme-de0974-dev.apps.silver.devops.gov.bc.ca/api/segments", nil)
	req.SetBasicAuth("mautic", "mautic")
	resp, err := client.Do(req)
	if err != nil {
		fmt.Fprintf(w, "The HTTP request failed with error %s\n", err)
	} else {
		bodyText, _ := ioutil.ReadAll(resp.Body)
		s := string(bodyText)

		fmt.Fprintf(w, s)
	}
}
