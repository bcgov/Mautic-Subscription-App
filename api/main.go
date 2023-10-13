package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/joho/godotenv/autoload"
)

// Global Mautic credentials
var mauticUser = os.Getenv("MAUTIC_USER")
var mauticPW = os.Getenv("MAUTIC_PW")
var mauticURL = os.Getenv("MAUTIC_URL")

func main() {
	//api endpoints
	http.HandleFunc("/segments", keycloakAuth(getSegmentAndIdInfo))
	http.HandleFunc("/segments/contact/add", keycloakAuth(updateContactSegments))
	http.HandleFunc("/segments/contact/cluster/add", keycloakAuth(updateContactSegmentsByCluster))

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Printf(err.Error())
	}

}

type MauticSegmentData struct {
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

type ContactSegmentsAndIds struct {
	ContactID      string         `json:"contactId"`
	SegmentsAndIds []SegmentAndId `json:"segmentsAndIds"`
}

type ContactAndClusterData struct {
	ContactID    string `json:"contactId"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	Email        string `json:"email"`
	ClusterName  string `json:"clusterName"`
	PlatformName string `json:"platformName"`
}

type SegmentAndId struct {
	IsChecked   bool
	SegmentName string
	SegmentID   string
	Description string
}

type ContactInfoByEmail struct {
	Total    string      `json:"total"`
	Contacts interface{} `json:"contacts"`
}

type ContactSegmentsById struct {
	Total int         `json:"total"`
	Lists interface{} `json:"lists"`
}

type newContact struct {
	Contact struct {
		ID int `json:"id"`
	} `json:"contact"`
}

func getSegmentAndIdInfo(w http.ResponseWriter, r *http.Request) {
	// Get contact's email
	contactEmailHeader := strings.Fields(r.Header.Get("Email"))
	if len(contactEmailHeader) != 1 {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid Email header. Only one email is accepted")
		return
	}
	contactEmail := contactEmailHeader[0]

	// Mautic auth
	client := &http.Client{}
	req, err := http.NewRequest("GET", mauticURL+"api/segments", nil)
	req.SetBasicAuth(mauticUser, mauticPW)
	resp, err := client.Do(req)

	contactSegmentsAndIds := ContactSegmentsAndIds{}
	// Get contact ID by email
	contactId := getContactIdByEmail(w, r, contactEmail)
	contactSegmentsAndIds.ContactID = contactId

	// Get contact Segments by email. returns hashmap as {"segmentID": true/false}
	contactSegments := getContactSegmentsById(w, r, contactId)

	// Get all Segment Names and IDs and mark contact segments
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
	} else {
		bodyText, _ := ioutil.ReadAll(resp.Body)
		dec := json.NewDecoder(strings.NewReader(string(bodyText)))

		for {
			var data MauticSegmentData
			if err := dec.Decode(&data); err == io.EOF {
				break
			} else if err != nil {
				fmt.Fprintf(w, "Decode failed with error %s\n", err)
			}
			// Append segment and ID to output
			for _, value := range data.Lists {
				_, isSubscribed := contactSegments[strconv.Itoa(value.ID)]

				description := ""

				if descriptionExists(value.Description) {
					description = value.Description.(string)
				}
				curSegmentAndId := SegmentAndId{isSubscribed, value.Name, strconv.Itoa(value.ID), description}
				contactSegmentsAndIds.SegmentsAndIds = append(contactSegmentsAndIds.SegmentsAndIds, curSegmentAndId)
			}

			// Marshall array to json
			b, err := json.Marshal(contactSegmentsAndIds)
			if err != nil {
				fmt.Fprintf(w, "Marshal failed with error %s\n", err)
			}
			fmt.Fprintf(w, "%s \n", b)
		}
	}

}

func descriptionExists(description interface{}) bool {
	switch description.(type) {
	default:
		return false
	case string:
		return true
	}
}

func getContactIdByEmail(w http.ResponseWriter, r *http.Request, contactEmail string) string {
	// Mautic auth
	client := &http.Client{}
	req, err := http.NewRequest("GET", mauticURL+"api/contacts?search=email:%2B"+contactEmail, nil)
	req.SetBasicAuth(mauticUser, mauticPW)
	resp, err := client.Do(req)

	contactId := ""

	// Get contact ID from response
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
		return contactId
	}

	bodyText, _ := ioutil.ReadAll(resp.Body)
	dec := json.NewDecoder(strings.NewReader(string(bodyText)))
	for {
		var data ContactInfoByEmail
		if err := dec.Decode(&data); err == io.EOF {
			break
		} else if err != nil {
			fmt.Fprintf(w, "Decode failed with error %s\n", err)
		}

		switch contactList := data.Contacts.(type) {
		case []interface{}:
			// if no contact found, create contact ID for new user
			contactId = createNewContactByEmail(w, r, contactEmail)

		case map[string]interface{}:
			// Get contact ID
			// Error if more than 1 contact is found in Mautic
			if len(contactList) > 1 {
				fmt.Fprintf(w, "More than one contact associated with the email address.")
			} else {
				for key := range contactList {
					contactId = key
				}
			}

		}
	}
	return contactId
}

func createNewContactByEmail(w http.ResponseWriter, r *http.Request, contactEmail string) string {
	contactId := ""

	postData := url.Values{}
	postData.Set("email", contactEmail)
	encodedPostData := bytes.NewBufferString(postData.Encode())
	// Mautic auth
	client := &http.Client{}
	// call mautic api and decode response
	req, err := http.NewRequest("POST", mauticURL+"api/contacts/new", encodedPostData)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	req.SetBasicAuth(mauticUser, mauticPW)
	resp, err := client.Do(req)

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
		return contactId
	}

	bodyText, _ := ioutil.ReadAll(resp.Body)
	dec := json.NewDecoder(strings.NewReader(string(bodyText)))

	for {
		var data newContact
		if err := dec.Decode(&data); err == io.EOF {
			break
		} else if err != nil {
			fmt.Fprintf(w, "Decode failed with error %s\n", err)
		}
		//extract contact id from response
		contactId = strconv.Itoa(data.Contact.ID)
	}

	return contactId
}

func getContactSegmentsById(w http.ResponseWriter, r *http.Request, contactId string) map[string]bool {
	// Mautic auth
	client := &http.Client{}
	req, err := http.NewRequest("GET", mauticURL+"api/contacts/"+contactId+"/segments", nil)
	req.SetBasicAuth(mauticUser, mauticPW)
	resp, err := client.Do(req)

	contactSegments := make(map[string]bool)

	// Get contact segments from response
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
		return contactSegments
	}

	bodyText, _ := ioutil.ReadAll(resp.Body)
	dec := json.NewDecoder(strings.NewReader(string(bodyText)))
	for {
		var data ContactSegmentsById
		if err := dec.Decode(&data); err == io.EOF {
			break
		} else if err != nil {
			fmt.Fprintf(w, "Decode failed with error %s\n", err)
		}

		switch segmentList := data.Lists.(type) {
		case []interface{}:
			// do nothing if segmentList is an array (user is not subscribed to any segments)
		case map[string]interface{}:
			// Construct contact segments list
			for key := range segmentList {
				contactSegments[key] = true
			}
		}
	}
	return contactSegments

}

func updateContactSegments(w http.ResponseWriter, r *http.Request) {
	// Mautic auth
	client := &http.Client{}
	// decode input or return error
	newContactSegmentsAndIds := ContactSegmentsAndIds{}
	err := json.NewDecoder(r.Body).Decode(&newContactSegmentsAndIds)
	if err != nil {
		w.WriteHeader(400)
		fmt.Fprintf(w, "Decode error! please check your JSON formating.")
		return
	}
	contactId := newContactSegmentsAndIds.ContactID
	// Get contact Segments by email. returns hashmap as {"segmentID": true/false}
	contactSegments := getContactSegmentsById(w, r, contactId)

	for _, value := range newContactSegmentsAndIds.SegmentsAndIds {
		// Only add/remove segments if they need to be updated
		if value.IsChecked && !contactSegments[value.SegmentID] {
			req, err := http.NewRequest("POST", mauticURL+"api/segments/"+value.SegmentID+"/contact/"+contactId+"/add", nil)
			req.SetBasicAuth(mauticUser, mauticPW)
			_, err = client.Do(req)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
			}
		} else if !value.IsChecked && contactSegments[value.SegmentID] {
			req, err := http.NewRequest("POST", mauticURL+"api/segments/"+value.SegmentID+"/contact/"+contactId+"/remove", nil)
			req.SetBasicAuth(mauticUser, mauticPW)
			_, err = client.Do(req)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
			}
		}
	}

	err = sendConfirmationEmail(w, r, contactId)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
	}
}
func updateContactSegmentsByCluster(w http.ResponseWriter, r *http.Request) {
	client := &http.Client{}
	newContactAndClusterData := ContactAndClusterData{}
	//get data from post request body
	err := json.NewDecoder(r.Body).Decode(&newContactAndClusterData)
	if err != nil {
		w.WriteHeader(400)
		fmt.Fprintf(w, "Decode error! please check your JSON formating.")
		return
	}
	//extract contactId and cluster information
	clusterName := newContactAndClusterData.ClusterName
	contactId := newContactAndClusterData.ContactID
	//for each cluster the contact is part of, subscribe them to segments by segment id accordingly, contact is subscribed to segment 14 by default
	switch clusterName {
	case "emerald":
		//subscribe contact to critical updates emerald
		req, err := http.NewRequest("POST", mauticURL+"api/segments/19/contact/"+contactId+"/add", nil)
		req.SetBasicAuth(mauticUser, mauticPW)
		_, err = client.Do(req)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
		}
	case "gold":
		//subscribe contact to critical updates gold
		req, err := http.NewRequest("POST", mauticURL+"api/segments/18/contact/"+contactId+"/add", nil)
		req.SetBasicAuth(mauticUser, mauticPW)
		_, err = client.Do(req)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
		}
	case "silver":
		//subscribe contact to critical updates silver
		req, err := http.NewRequest("POST", mauticURL+"api/segments/17/contact/"+contactId+"/add", nil)
		req.SetBasicAuth(mauticUser, mauticPW)
		_, err = client.Do(req)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
		}
	}
	//subscribe contact to critical updates
	req, err := http.NewRequest("POST", mauticURL+"api/segments/14/contact/"+contactId+"/add", nil)
	req.SetBasicAuth(mauticUser, mauticPW)
	_, err = client.Do(req)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintf(w, "Mautic HTTP request failed with error %s\n", err)
	}
}
func sendConfirmationEmail(w http.ResponseWriter, r *http.Request, contactId string) error {
	err := error(nil)
	confirmationEmailId := os.Getenv("CONFIRMATION_EMAIL_ID")

	// Mautic auth
	client := &http.Client{}
	req, err := http.NewRequest("POST", mauticURL+"api/emails/"+confirmationEmailId+"/contact/"+contactId+"/send", nil)
	req.SetBasicAuth(mauticUser, mauticPW)
	resp, err := client.Do(req)
	if resp.StatusCode != 200 {
		err = errors.New("Mautic request status code" + strconv.Itoa(resp.StatusCode))
	}
	return err
}
