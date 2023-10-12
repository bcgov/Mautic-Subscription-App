import os
import requests
import json

#script to get all contacts subscribed to a specific segment in mautic
#fetch all contacts from mautic, memory issues if limit is not set to under 1000
url = 'https://admin.subscribe.developer.gov.bc.ca/api/contacts'
payload = ""
headers = {'Accept': "application/json"}
params = {'limit': 1000}
response = requests.get(url, params=params, data=payload, auth=(os.getenv('MAUTIC_USER'), os.getenv('MAUTIC_PW'))).json()

contactIds = list(response['contacts'].keys())
contacts = []
#filter out contacts without an email
for contactId in contactIds:
    if response['contacts'][contactId]['fields']['core']['email']['value']:
        contacts.append({'id': contactId, 'email': response['contacts'][contactId]['fields']['core']['email']['value']})
#currently 1800 contacts, re-call api to fetch the rest
params2 = {'limit': 1000, 'start': 1000}
response = requests.get(url, params=params2, data=payload, auth=(os.getenv('MAUTIC_USER'), os.getenv('MAUTIC_PW'))).json()
contactIds = list(response['contacts'].keys())
#filter out contacts without an email
for contactId in contactIds:
    if response['contacts'][contactId]['fields']['core']['email']['value']:
        contacts.append({'id': contactId, 'email': response['contacts'][contactId]['fields']['core']['email']['value']})

print(len(contacts))

#find all contacts subscribed to platform services update which has segment id of 1
segmentId = '1'
subscribers = []
for i, contact in enumerate(contacts):
    #get the segment list a contact is subscribed to
    url = f'https://admin.subscribe.developer.gov.bc.ca/api/contacts/{contact["id"]}/segments'
    response = requests.get(url, data=payload, auth=(os.getenv('MAUTIC_USER'),os.getenv('MAUTIC_PW'))).json()
    if(response['lists']):
        segments = list(response['lists'].keys())
        #check if list includes the segmentId
        if segmentId in segments:
            subscribers.append({'email' : contact['email']})

print(len(subscribers))
#output list of contacts by their emails to json file
with open('output.json', 'w') as file:
    file.write(json.dumps(subscribers, indent=4))
