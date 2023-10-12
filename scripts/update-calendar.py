import json
from googleapiclient.discovery import build
from google.oauth2 import service_account

#script to update an event in google calendar via api
#load file containing the mailing list from mautic and set as new attendees list for event
with open('output.json', 'r') as file:
    data = json.load(file)
new_attendees = data

#authenticate with service account to google calendar api
#details of service account used can by found on google web console with the email admin-187@community-meeting-list-update.iam.gserviceaccount.com
#config map containing service account key can be found in dev namespace
#service account must be given write access to specific google calendar to be modified
credentials = service_account.Credentials.from_service_account_file('./service-account-key.json', scopes=['https://www.googleapis.com/auth/calendar.events'])
delegated_credentials = credentials.with_subject('helen@bcdevexchange.org')
service = build('calendar', 'v3', credentials=delegated_credentials)

# #find event id of event to be updated
# event_result = service.events().list(calendarId=calendar_id, q='Platform Community Meetup').execute()
# print(event_result)
# event = event_result.get('items', [])
# print(event)

#set calendar and event to be modified
calendar_id = 'lab@bcdevexchange.org'
recurring_event_id = '1kl8332dq5vvf040rso92fj7ka'

#update calendar event with new list of attendees
event = service.events().get(calendarId=calendar_id, eventId=recurring_event_id).execute()
print(event)
event['attendees'] = new_attendees
updated_event = service.events().update(calendarId=calendar_id, eventId=recurring_event_id, body=event, sendNotifications='true').execute()
print(updated_event)


