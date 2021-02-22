# Setting up Mautic Subscription App on Openshift

Start by granting imagepull access to the tools namespace for the dev, test, and prod namespaces
`oc process -f openshift/mautic.subscribe.rolebindings.yaml -p LICENSE_PLATE=[licenseplate-name] | oc apply -f -`
- Example: 

    `oc process -f openshift/mautic.subscribe.rolebindings.yaml -p LICENSE_PLATE=de0974 | oc apply -f -`


## Setting up caddy s2i
Create a new build config for caddy using the command: 
`oc process -f https://raw.githubusercontent.com/bcgov/s2i-caddy-nodejs/master/openshift/templates/build.yaml | oc apply -f -`

The OCP builder will need to pull a base image from the RedHat Container Registry. To let your builder do this, sign-up for a free RedHat Developer to this [site](https://catalog.redhat.com/software/containers/search). Once you have credentials, create a secret the builder can use to pull image from the catalog:
`oc create secret docker-registry rh-registry --docker-server=registry.redhat.io --docker-username=<USERNAME> --docker-password=<PASSWORD> --docker-email=unused`

Link the secret so the builder can use it using the command:
`oc set build-secret --pull bc/caddy-s2i-builder rh-registry`

The final step is to trigger the build which will make the s2i caddy image and store a copy in your namespace:

`oc start-build bc/caddy-s2i-builder --follow`

For more information on the caddy s2i builder, visit [here](https://github.com/bcgov/s2i-caddy-nodejs)

## Building and Deploying the App
This guide will go over two strategies that can be used to build and deploy the Mautic Subscription App: `using Argo` and `using openshift commands`

## Using Argo
#### Installing Argo and setting up the environment
To use Argo, Start by updating the parameters in the `openshift/argo/install.param` file. Do not include any periods, slashes, spaces or other characters inappropriate for a URL. 

Perform the argo installation like this: 
`oc process -f install.yaml --param-file=install.param | oc apply -n [tools-namespace] -f -`
- Example: 

    `oc process -f install.yaml --param-file=install.param | oc apply -n de0974-tools -f -`

And to allow the service account `workflow-creator` to have edit access to the dev, test, and prod namespaces, run the commands:
`oc process -f serviceaccount.access.tools.yaml -p TOOLS_NAMESPACE=[tools-namespace] | oc apply -f - -n [tools-namespace]`
`oc process -f serviceaccount.access.dev.yaml -p TOOLS_NAMESPACE=[tools-namespace] -p DEV_NAMESPACE=[dev-namespace] | oc apply -f - -n [dev-namespace]`
`oc process -f serviceaccount.access.test.yaml -p TOOLS_NAMESPACE=[tools-namespace] -p TEST_NAMESPACE=[test-namespace] | oc apply -f - -n [test-namespace]`
`oc process -f serviceaccount.access.prod.yaml -p TOOLS_NAMESPACE=[tools-namespace] -p PROD_NAMESPACE=[prod-namespace] | oc apply -f - -n [prod-namespace]`

#### Setting up keycloak
To allow argo to create keycloak clients in the dev namespace, a service account must be created in the dev namespace in keycloak.

Create a keycloak client with the following properties:
```
Client-ID: [client-id-name]
Enabled: On
Consent Required: Off
Client Protocol: openid-connect
Access Type: confidential
Standard Flow Enabled: On
Implicit Flow Enabled: Off
Direct Access Grants Enabled: On
Service Accounts Enabled: On
Authorization Enabled: Off
Web Origins: *
```
and add an empty Valid Redirect URI.

After creating a keycloak service account client, create a secret with the service account credentials using the command:
`oc process -f ./openshift/sso_sa.secret.yaml -p SSO_SA_CLIENT_ID=[client-id-name] -p SSO_SA_PASSWORD=[service-account-password] -p TOOLS_NAMESPACE=[tools-namespace] | oc apply -f - -f - -n [tools-namespace]`

the service account password can be found labelled as `secret` under the credentials tab of the keycloak service account client

Now argo should be set up to run the workflows.
#### Build and Deploy
To build the subscription app in the tools namespace and deploy to the dev namespace, run the command:
`argo submit openshift/argo/mautic.subscribe.build.yaml -p PR=pr-[pr_number] -p BRANCH=[git-branch] -p REALM_NAME=[sso-realm-name] -p REPO=[git-repo] -p DEV_NAMESPACE=de0974-dev -p NAME=[app-name] -p TOOLS_NAMESPACE=[tools-namespace] -p HOST_ADDRESS=[host-address]  -p KEYCLOAK_URL=[keycloak-url] -p SUBSCRIBE_FORM=[subscribe-form-name]-p UNSUBSCRIBE_FORM=[unsubscribe-form-name]-p SUBSCRIBE_URL=[subscribe-form-url] -p UNSUBSCRIBE_URL=[unsubscribe-form-url]`

- Example: 

    `argo submit openshift/argo/mautic.subscribe.build.yaml -p PR=pr-1 -p BRANCH=clean-state -p REALM_NAME=devhub -p REPO=https://github.com/bcgov/Mautic-Subscription-App -p DEV_NAMESPACE=de0974-dev  -p NAME=mautic-subscription -p IMAGE_TAG=1 -p TOOLS_NAMESPACE=de0974-tools -p HOST_ADDRESS=apps.silver.devops.gov.bc.ca  -p KEYCLOAK_URL=https://dev.oidc.gov.bc.ca -p SUBSCRIBE_FORM=subscribe -p UNSUBSCRIBE_FORM=unsubscribe -p SUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=5 -p UNSUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=2  -p SSO_REALM=devhub`


To promote the app in higher environments, run the command:
`argo submit openshift/argo/mautic.subscribe.promote.yaml -p PR=[pr-number] -p BRANCH=[git-branch] -p REALM_NAME=[sso-realm-name] -p REPO=[git-repo] -p TARGET_NAMESPACE=[target-namespace] -p NAME=[app-name] -p IMAGE_TAG=[environment-name] -p TOOLS_NAMESPACE=[tools-namespace] -p HOST_ADDRESS=[host-address] -p KEYCLOAK_URL=[keycloak-url] -p SUBSCRIBE_FORM=[subscribe-form-name]-p UNSUBSCRIBE_FORM=[unsubscribe-form-name]-p SUBSCRIBE_URL=[subscribe-form-url] -p UNSUBSCRIBE_URL=[unsubscribe-form-url]`

- Example promoting the app to the test namespace: 

    `argo submit openshift/argo/mautic.subscribe.promote.yaml -p PR=pr-1 -p BRANCH=clean-state -p REALM_NAME=devhub -p REPO=https://github.com/bcgov/Mautic-Subscription-App -p TARGET_NAMESPACE=de0974-test -p NAME=mautic-subscription -p IMAGE_TAG=test -p TOOLS_NAMESPACE=de0974-tools -p HOST_ADDRESS=apps.silver.devops.gov.bc.ca -p KEYCLOAK_URL=https://test.oidc.gov.bc.ca -p SUBSCRIBE_FORM=subscribe -p UNSUBSCRIBE_FORM=unsubscribe -p SUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=5 -p UNSUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=2`

#### Cleanup

To cleanup the artifacts in a namespace, run the command:
`argo submit openshift/argo/mautic.subscribe.cleanup.yaml -p IMAGE_TAG=[image-tag] -p BRANCH=[git-branch] -p REALM_NAME=[sso-realm-name] -p REPO=[git-repo] -p TARGET_NAMESPACE=[target-namespace] -p NAME=[app-name]-p KEYCLOAK_URL=[keycloak-url]`

- Example cleaning up the dev namespace:

    `argo submit openshift/argo/mautic.subscribe.cleanup.yaml -p IMAGE_TAG=1 -p BRANCH=clean-state -p REALM_NAME=devhub -p REPO=https://github.com/bcgov/Mautic-Subscription-App -p TARGET_NAMESPACE=de0974-dev -p NAME=mautic-subscription -p KEYCLOAK_URL=https://dev.oidc.gov.bc.ca`

- Example cleaning up the test namespace:

    `argo submit openshift/argo/mautic.subscribe.cleanup.yaml -p IMAGE_TAG=test -p BRANCH=clean-state -p REALM_NAME=devhub -p REPO=https://github.com/bcgov/Mautic-Subscription-App -p TARGET_NAMESPACE=de0974-test -p NAME=mautic-subscription -p KEYCLOAK_URL=https://test.oidc.gov.bc.ca`

## Using openshift commands
#### Setting up keycloak clients
For each deployment in the dev namespace there must be a keycloak client created for it. The keycloak Client ID should match the deployment config name.

For the test and prod namespaces, one keycloak client for each of the namespaces must be created. Ex// `mautic-subscription-test` and `mautic-subscription-prod`

A keycloak client should be created with the following properties:
```
Client-ID: [client-id-name]
Enabled: On
Consent Required: Off
Client Protocol: openid-connect
Access Type: public
Standard Flow Enabled: On
Implicit Flow Enabled: Off
Direct Access Grants Enabled: Off
Service Accounts Enabled: Off
Authorization Enabled: Off
Valid Redirect URI: https://[app-name]-[image-tag]-[target-namespace].[host-address]/*
Web Origins: *
```
#### Creating the build
Create the build using the commands:
`oc process -f openshift/mautic.subscribe.bc.yaml --param-file=openshift/openshift-param --ignore-unknown-parameters=true | oc apply -f - `
and
`oc start-build -w [app-name]-[image-tag]`

#### Retag Images
Before deploying the app in the dev/test/prod namespaces run the following command to retag the image from the tools namespace:
`oc tag [tools-namespace]/[app-name]:[image-tag] [target-namespace]/[app-name]:[image-tag]`

Note for best practice, the pr number can be used as the image tag in the dev namespace but in the test/prod namespaces the image tag should be test/prod

Example to retag the image to the dev namespace:
`oc tag de0974-tools/mautic-subscription:1 de0974-dev/mautic-subscription:1`

Example to retag the image to the test namespace:
`oc tag de0974-tools/mautic-subscription:1 de0974-dev/mautic-subscription:test`

#### Deploying the app
After retagging the image, deploy the app in the target namespaces using the commands:
`oc delete configmap mautic-config-[image-tag]` 
and
`oc process -f openshift/mautic.subscribe.dc.yaml --param-file=openshift/openshift-param --ignore-unknown-parameters=true -p TARGET_NAMESPACE=[target-namespace] -p SSO_CLIENT_ID=[sso-client-id] | oc apply -f - -n [target-namespace]`

Example deploying to dev:
`oc delete configmap mautic-config-pr2`
`oc process -f openshift/mautic.subscribe.dc.yaml --param-file=openshift/openshift-param --ignore-unknown-parameters=true -p TARGET_NAMESPACE=de0974-dev -p SSO_CLIENT_ID=mautic-subscription-pr2| oc apply -f - -n de0974-dev`

#### Cleaning up
To clean up a deployment and its artifact in a namespace, run the command:
`oc delete all,configmap,pvc,secret,service -l name=[app-name]-[image-tag] -n [target-namespace]`

Example:
`oc delete all,configmap,pvc,secret,service -l name=mautic-subscription-PR1 -n de0974-dev`


Or, to cleanup all mautic subscription app related artifacts in a namespace, run the command:
`oc delete all,configmap,pvc,secret,service -l app=[app-name] -n [target-namespace]`

Example:
`oc delete all,configmap,pvc,secret,service -l app=mautic-subscription -n de0974-dev`