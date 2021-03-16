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
echo $CLIENT_ID
GET_ROLES=$(curl https://dev.oidc.gov.bc.ca/auth/admin/realms/devhub/clients/d5d9e7b1-0466-4f6b-9a8d-26464f0409ff/roles/authorized-user/composites -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN")


# Create client:
if [ "${CLIENT_ID}" == "" ]; then
    echo "Creating '$NAME-$PR' client..."
    payload=$(cat keycloak-client-creation/new-client.json | sed -e "s|#{PR}|${PR}|g")
    payload=$(echo $payload | sed -e "s|#{NAME}|${NAME}|g")
    echo $payload |  sed -e "s|#{REDIRECT_URI}|${REDIRECT_URI}|g" | \
    curl --fail -i -sX POST -d '@-' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients"
    CLIENT_ID=$(curl --fail -sX GET "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients" -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" | jq -r --arg CLIENT "$NAME-$PR" '.[] | select(.clientId==$CLIENT) | .id')

    # Add role
    curl -X POST https://dev.oidc.gov.bc.ca/auth/admin/realms/devhub/clients/$CLIENT_ID/roles -H "Content-Type: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -d @./keycloak-client-creation/add-role.json
    # Get Role ID
    ROLE_ID=$(curl https://dev.oidc.gov.bc.ca/auth/admin/realms/devhub/clients/$CLIENT_ID/roles -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" | jq -r '.[0].id')
    ROLE_NAME=$(cat ./keycloak-client-creation/add-role.json | jq -r '.name')
    echo $ROLE_ID
    echo $ROLE_NAME
    # Add composite roles
    curl -v -X POST https://dev.oidc.gov.bc.ca/auth/admin/realms/devhub/roles-by-id/$ROLE_ID/composites -H "Content-Type: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -d @./keycloak-client-creation/add-composite.json
fi


# return the client-id:
echo "$NAME-$PR"

