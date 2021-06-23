package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/Nerzal/gocloak/v8"
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	kcClientID := os.Getenv("KC_CLIENT_ID")
	kcClientSecret := os.Getenv("KC_CLIENT_SECRET")
	kcRealm := os.Getenv("KC_REALM")
	kcURL := os.Getenv("KC_URL")

	// Initialize keycloak client
	kcClient := gocloak.NewClient((kcURL))
	ctx := context.Background()
	_, err := kcClient.LoginClient(ctx, kcClientID, kcClientSecret, kcRealm)
	if err != nil {
		fmt.Printf("Login failed:" + err.Error())
	}

	http.HandleFunc("/segments", getSegmentAndIds)
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Printf(err.Error())
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
				fmt.Fprintf(w, "Decode failed with error %s\n", err)
			}
			// Append segment and ID to output
			for _, value := range data.Lists {
				curSegmentAndID := SegmentAndID{value.Name, strconv.Itoa(value.ID)}
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
