#!/bin/sh

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

set -euf -o pipefail
#set -x

if [ "$1" == "" ]; then
    echo "Skip this step in test or prod enviroments"
    exit 0
fi

# get sso variables:
KEYCLOAK_URL=https://dev.oidc.gov.bc.ca
REALM_NAME=devhub
PR_NUMBER="$1"
NAMESPACE="$2"

echo $KEYCLOAK_URL
echo $KEYCLOAK_ACCESS_TOKEN
echo $KEYCLOAK_CLIENT_ID
echo $REALM_NAME
echo $NAME
echo $PR_NUMBER
# # oc get secret for sso service account:
# KEYCLOAK_CLIENT_ID=$(oc -n $NAMESPACE get secret/sso-service-account --template={{.data.KEYCLOAK_CLIENT_ID}} | base64 --decode)
# KEYCLOAK_CLIENT_SECRET=$(oc -n $NAMESPACE get secret/sso-service-account --template={{.data.KEYCLOAK_CLIENT_SECRET}} | base64 --decode)

echo "Request to $KEYCLOAK_URL"

# get auth token:
KEYCLOAK_ACCESS_TOKEN=$(curl -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/auth/realms/$REALM_NAME/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' | jq -r '.access_token')

 _curl(){
     curl -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$@"
 }
echo $(_curl -sX GET "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients" -H "Accept: application/json")
# check if client exists:
CLIENT_ID=$(_curl -sX GET "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients" -H "Accept: application/json" | jq -r --arg CLIENT "$NAME-$PR_NUMBER" '.[] | select(.clientId==$CLIENT) | .id')
echo $CLIENT_ID
# Remove client:
if [ "${CLIENT_ID}" != "" ]; then
    echo "Delete '$NAME-$PR_NUMBER' client..."
    curl -sX DELETE -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients/${CLIENT_ID}"
fi

echo "DONE"