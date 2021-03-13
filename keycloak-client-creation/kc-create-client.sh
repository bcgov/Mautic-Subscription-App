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

# echo $GET_ROLES
# Create client:
if [ "${CLIENT_ID}" == "" ]; then
    echo "Creating '$NAME-$PR' client..."
    payload=$(cat keycloak-client-creation/new-client.json | sed -e "s|#{PR}|${PR}|g")
    payload=$(echo $payload | sed -e "s|#{NAME}|${NAME}|g")
    echo $payload |  sed -e "s|#{REDIRECT_URI}|${REDIRECT_URI}|g" | \
    curl --fail -i -sX POST -d '@-' -H 'Content-Type: application/json' -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients"
    CLIENT_ID=$(curl --fail -sX GET "$KEYCLOAK_URL/auth/admin/realms/$REALM_NAME/clients" -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" | jq -r --arg CLIENT "$NAME-$PR" '.[] | select(.clientId==$CLIENT) | .id')

    curl -X POST https://dev.oidc.gov.bc.ca/auth/admin/realms/devhub/clients/$CLIENT_ID/roles -H "Content-Type: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" -d @./keycloak-client-creation/add-role.json
    ROLE_ID=$(curl https://dev.oidc.gov.bc.ca/auth/admin/realms/devhub/clients/$CLIENT_ID/roles -H "Accept: application/json" -H "Authorization: Bearer $KEYCLOAK_ACCESS_TOKEN" | jq -r '.[0].id')
    ROLE_NAME=$(cat ./keycloak-client-creation/add-role.json | jq -r '.name')
    # curl -X POST https://dev.oidc.gov.bc.ca/auth/admin/realms/devhub/clients/$ROLE_ID/roles/$ROLE_NAME/composites
fi


# return the client-id:
echo "$NAME-$PR"


# [{"id":"f8760ed6-bfb4-47ac-9a4a-ff1948552262","name":"idir-user","description":"Users coming from IDIR IDP will be assigned with this role","composite":true,"clientRole":false,"containerId":"devhub"}
# ,{"id":"49badd97-9233-4d7c-9581-dcdc369dcda5","name":"github-org-bcdevops","description":"Users with membership in GitHub BCDevOps organization","composite":true,"clientRole":false,"containerId":"devhub"}
# ,{"id":"294d1229-9620-4d75-b4e6-8f772bc3b9b1","name":"github-org-bcgov","description":"Users with membership in GitHub bcgov organization","composite":true,"clientRole":false,"containerId":"devhub"}
# ,{"id":"387fc24a-7aff-43c9-9a6b-f249f34e1bc3","name":"github-org-bcgov-c","description":"Users with membership in GitHub bcgov-c organization","composite":true,"clientRole":false,"containerId":"devhub"}]