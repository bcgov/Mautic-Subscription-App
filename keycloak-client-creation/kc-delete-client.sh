#!/bin/sh

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource

set -euf -o pipefail
#set -x

if echo $TARGET_NAMESPACE | grep -e '-test' -e '-prod' 
    then exit 0
fi

# This step is done on the argo workflow
# # oc get secret for sso service account:
# KC_CLIENT_ID=$(oc -n $NAMESPACE get secret/sso-service-account --template={{.data.KC_CLIENT_ID}} | base64 --decode)
# KC_CLIENT_SECRET=$(oc -n $NAMESPACE get secret/sso-service-account --template={{.data.KC_CLIENT_SECRET}} | base64 --decode)

echo "Request to $KC_URL"

# get auth token:
KC_ACCESS_TOKEN=$(curl -sX POST -u "$KC_CLIENT_ID:$KC_CLIENT_SECRET" "$KC_URL/auth/realms/$REALM_NAME/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' | jq -r '.access_token')

 _curl(){
     curl -H "Authorization: Bearer $KC_ACCESS_TOKEN" "$@"
 }
echo $(_curl -sX GET "$KC_URL/auth/admin/realms/$REALM_NAME/clients" -H "Accept: application/json")
# check if client exists:
CLIENT_ID=$(_curl -sX GET "$KC_URL/auth/admin/realms/$REALM_NAME/clients" -H "Accept: application/json" | jq -r --arg CLIENT "$NAME-$PR" '.[] | select(.clientId==$CLIENT) | .id')
echo $CLIENT_ID
# Remove client:
if [ "${CLIENT_ID}" != "" ]; then
    echo "Delete '$NAME-$PR' client..."
    curl -sX DELETE -H "Accept: application/json" -H "Authorization: Bearer $KC_ACCESS_TOKEN" "$KC_URL/auth/admin/realms/$REALM_NAME/clients/${CLIENT_ID}"
fi

echo "DONE"