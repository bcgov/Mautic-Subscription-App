import os
import concurrent.futures
import requests
import json
import threading

#script to get all contacts subscribed to a specific segment in mautic, use multithreading to optimize run time
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
response = requests.get(url, params=params2, data=payload, auth=(os.getenv('MAUTIC_USER'),os.getenv('MAUTIC_PW'))).json()
contactIds = list(response['contacts'].keys())
#filter out contacts without an email
for contactId in contactIds:
    if response['contacts'][contactId]['fields']['core']['email']['value']:
        contacts.append({'id': contactId, 'email': response['contacts'][contactId]['fields']['core']['email']['value']})
print('Contacts:', len(contacts))
#find all contacts subscribed to platform services update which has segment id of 1
def getSubs(contacts, startIndex, count):
    localSubs = []
    for i in range(startIndex, startIndex+count):
        #get the segment list a contact is subscribed to
        url = f'https://admin.subscribe.developer.gov.bc.ca/api/contacts/{contacts[i]["id"]}/segments'
        response = requests.get(url, data=payload, auth=(os.getenv('MAUTIC_USER'), os.getenv('MAUTIC_PW'))).json()
        if response['lists']:
            segments = list(response['lists'].keys())
            #check if list includes the segmentId
            if segmentId in segments:
                localSubs.append({'email' : contacts[i]['email']})
        print(i)
    return localSubs
segmentId = '1'
subscribers = []
numThreads = 25
count = len(contacts) // numThreads + 1
lock = threading.Lock()
with concurrent.futures.ThreadPoolExecutor(max_workers=numThreads) as executor:
    futures = (executor.submit(getSubs, contacts, i * count, count) for i in range(numThreads-1))
    for future in concurrent.futures.as_completed(futures):
        try:
            localSubs = future.result()
            with lock:
                subscribers.extend(localSubs)
        except Exception as e:
            print(e)
    print('Subscribers to segment' + segmentId + ':', len(subscribers))
    #output list of contacts by their emails to json file
    with open('output.json', 'w') as file:
        file.write(json.dumps(subscribers, indent=4))