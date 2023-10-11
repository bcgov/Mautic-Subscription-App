import os
import requests
import re

text = '''
helen@example.com
shelly@example.com
'''
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
emailList = re.findall(email_pattern, text)
#compile email list from input text
emailList = list(set(emailList))
payload = {}
headers = {'Accept': "application/json"}
params = {}
#specify the segment to add contacts to
segmentId = 14
for email in emailList:
    url = f'https://admin.subscribe.developer.gov.bc.ca/api/contacts?search=email:%2B{email}'
    #get contact by email
    response = requests.get(url, params=params, data=payload, auth=(os.getenv('MAUTIC_USER'), os.getenv('MAUTIC_PW'))).json()
    #if no contact exists, create new contact
    if(response['total'] == '0'):
        payload = {'email': email}
        url = 'https://admin.subscribe.developer.gov.bc.ca/api/contacts/new'
        response = requests.post(url, params=params, data=payload, auth=(os.getenv('MAUTIC_USER'), os.getenv('MAUTIC_PW'))).json()
        contactId = response['contact']['id']
        url = f'https://admin.subscribe.developer.gov.bc.ca/api/segments/{segmentId}/contact/{contactId}/add'
    else:
        #get contactId from response
        contactId = list(response['contacts'].keys())
        url = f'https://admin.subscribe.developer.gov.bc.ca/api/segments/{segmentId}/contact/{contactId[0]}/add'
    payload={}
    #make request to add user to specified segment
    response = requests.post(url, params=params, data=payload, auth=(os.getenv('MAUTIC_USER'), os.getenv('MAUTIC_PW'))).json()
    print(response)