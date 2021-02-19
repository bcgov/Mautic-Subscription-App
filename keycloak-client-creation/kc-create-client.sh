#!/bin/sh

# Reference:
# https://www.keycloak.org/docs-api/3.3/rest-api/#_identity_providers_resource
# dependancies
# - jq
# environment variables
# TARGET_NAMESPACE <string>
# KEYCLOAK_URL <string>
# KEYCLOAK_CLIENT_ID <string>
# KEYCLOAK_CLIENT_SECRET <string>
# REALM_NAME <string>
set -euf -o pipefail
# set -x

if echo $TARGET_NAMESPACE | grep -e '-test' -e '-prod' 
    then exit 0
fi

# get sso variables:
REDIRECT_URI="$1"

echo "Request to $KEYCLOAK_URL"

# get auth token:
KEYCLOAK_ACCESS_TOKEN=$(curl --fail -sX POST -u "$KEYCLOAK_CLIENT_ID:$KEYCLOAK_CLIENT_SECRET" "$KEYCLOAK_URL/auth/realms/$REALM_NAME/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d 'grant_type=client_credentials' | jq -r '.access_token')

 _curl(){
     curl -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$@"
 }

# check if client exists:
CLIENT_ID=$(curl --fail -sX GET "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients" -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" | jq -r --arg CLIENT "$NAME-$PR" '.[] | select(.clientId==$CLIENT) | .id')
# Create client:
if [ "${CLIENT_ID}" == "" ]; then
    echo "Creating '$NAME-$PR' client..."
    payload=$(cat keycloak-client-creation/new-client.json | sed -e "s|#{PR}|${PR}|g")

    echo $payload |  sed -e "s|#{REDIRECT_URI}|${REDIRECT_URI}|g" | \
   
    curl --fail -i -sX POST -d '@-' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients"
fi

# return the client-id:
echo "$NAME-$PR"