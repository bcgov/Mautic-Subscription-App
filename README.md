# Architecture Diagram

!(architecture-diagram.png)
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
Start by creating a `argo.workflow.param` file with the parameters in the `openshift/argo/argo.workflow.param.example` file. 

Of particular note are the parameters SUBSCRIBE_FORM, UNSUBSCRIBE_FORM, SUBSCRIBE_URL, and UNSUBSCRIBE_URL.

The SUBSCRIBE_FORM and UNSUBSCRIBE_FORM parameters are the names of the subscribe and unsubscribe forms in lower case. Under Components -> Forms in the Mautic App, you can find the names of each form listed under the `Name` column.

The SUBSCRIBE_URL and UNSUBSCRIBE_URL are the subscribe and unsubscribe form URLs. They are expressed in the following format: ```<mautic-app-url>/form/submit?formId=[form-id]``` where the `form-id` are listed under the `ID` column in Components -> Forms in the Mautic App

Leave the HOST_URL value as "". This parameter will only be used when promoting the app to the prod environment.

Example:
```
{
    "APP_NAME":"mautic-subscription",
    "SOURCE_REPOSITORY_URL":"https://github.com/bcgov/Mautic-Subscription-App",
    "SOURCE_REPOSITORY_REF":"installation-guide",
    "TOOLS_NAMESPACE":"de0974-tools",
    "DEV_NAMESPACE":"de0974-dev",
    "TEST_NAMESPACE":"de0974-test",
    "PROD_NAMESPACE":"de0974-prod",
    "IMAGE_REGISTRY":"image-registry.openshift-image-registry.svc:5000",
    "SUBSCRIBE_FORM":"subscribe",
    "UNSUBSCRIBE_FORM":"unsubscribe",
    "SUBSCRIBE_URL":"http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=1",
    "UNSUBSCRIBE_URL":"http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=2",
    "SSO_REALM":"devhub",
    "HOST_ADDRESS":"apps.silver.devops.gov.bc.ca",
    "HOST_URL":""
}
```
#### Installing Argo and setting up the environment
To use Argo, start by updating the parameters in the `openshift/argo/install.param` file. Do not include any periods, slashes, spaces or other characters inappropriate for a URL. 

Perform the argo installation using the command: 
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
`oc process -f ./openshift/sso_sa.secret.yaml -p SSO_SA_CLIENT_ID=[client-id-name] -p SSO_SA_PASSWORD=[service-account-password] -p TOOLS_NAMESPACE=[tools-namespace] | oc apply -f - -n [tools-namespace]`

the service account password can be found labelled as `secret` under the credentials tab of the keycloak service account client

For the test and prod namespaces, one keycloak client for each of the namespaces must be created. Their Client IDs should match the convention: [app-name]-[image-tag].
- Example: `mautic-subscription-test` and `mautic-subscription-prod`

Keycloak clients for the test and prod environments should be created with the following properties:
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

Now argo should be set up to run the workflows.
#### Build and Deploy
To submit a workflow, a previously submitted workflow with the same name must be deleted using the command `argo delete [workflow-name]`

For example, if there is a submitted workflow called `mautic-subscribe-build`, you must delete the workflow using the command `argo delete mautic-subscribe-build` 

Alternatively, you can delete all argo workflows using `argo delete --all`

To build the subscription app in the tools namespace and deploy to the dev namespace, run the commands:
`argo submit openshift/argo/mautic.subscribe.build.yaml -f openshift/argo/argo.workflow.param -p KEYCLOAK_URL=[keycloak-url] -p IMAGE_TAG=[image-tag] -p SSO_AUTHORIZED_ROLES=[authorized-roles]`

- Example: 
`argo submit openshift/argo/mautic.subscribe.build.yaml -f openshift/argo/argo.workflow.param -p KEYCLOAK_URL=https://dev.oidc.gov.bc.ca -p IMAGE_TAG=pr10 -p SSO_AUTHORIZED_ROLES="github-org-bcgov,github-org-bcgov-c,github-org-bcdevops,idir-user"`

To promote the app in higher environments, run the command:

`argo submit openshift/argo/mautic.subscribe.promote.yaml -f openshift/argo/argo.workflow.param -p KEYCLOAK_URL=https://test.oidc.gov.bc.ca -p IMAGE_TAG=[image-tag] -p TARGET_NAMESPACE=[target-namespace] -p PR=pr[pr-number] -p HOST_URL=[host-url] -p SSO_AUTHORIZED_ROLES=[authorized-roles]`

Note that the HOST_URL will default to `https://[app-name]-[image-tag]-[namespace].[host-address]/` if not provided.
The HOST_URL is optional for deployments to dev and test namespaces but should be specified as the vanity url for the prod namespace.
The SSO_AUTHORIZED_ROLES is also optional and should be specified as csv when gating users with certain roles to sign up for the mailing list.

- Example promoting to the test namespace:
`argo submit openshift/argo/mautic.subscribe.promote.yaml -f openshift/argo/argo.workflow.param -p KEYCLOAK_URL=https://test.oidc.gov.bc.ca -p IMAGE_TAG=test -p TARGET_NAMESPACE=de0974-test -p PR=pr10 -p SSO_AUTHORIZED_ROLES="github-org-bcgov,github-org-bcgov-c,github-org-bcdevops,idir-user"`

- Example promoting to the prod namespace:
`argo submit openshift/argo/mautic.subscribe.promote.yaml -f openshift/argo/argo.workflow.param -p KEYCLOAK_URL=https://oidc.gov.bc.ca -p IMAGE_TAG=prod -p TARGET_NAMESPACE=de0974-prod -p PR=pr10 -p HOST_URL=https://platform.news.subscription.apps.silver.devops.gov.bc.ca -p SSO_AUTHORIZED_ROLES="github-org-bcgov,github-org-bcgov-c,github-org-bcdevops,idir-user"`

#### Cleanup

To cleanup the artifacts in a namespace, run the command:
`argo submit openshift/argo/mautic.subscribe.cleanup.yaml -p IMAGE_TAG=[image-tag] -p BRANCH=[git-branch] -p REALM_NAME=[sso-realm-name] -p REPO=[git-repo] -p TARGET_NAMESPACE=[target-namespace] -p APP_NAME=[app-name]-p KEYCLOAK_URL=[keycloak-url]`

- Example cleaning up the dev namespace:

    `argo submit openshift/argo/mautic.subscribe.cleanup.yaml -p IMAGE_TAG=pr10 -p BRANCH=installation-guide -p REALM_NAME=devhub -p REPO=https://github.com/bcgov/Mautic-Subscription-App -p TARGET_NAMESPACE=de0974-dev -p APP_NAME=mautic-subscription -p KEYCLOAK_URL=https://dev.oidc.gov.bc.ca`

- Example cleaning up the test namespace:

    `argo submit openshift/argo/mautic.subscribe.cleanup.yaml -p IMAGE_TAG=test -p BRANCH=installation-guide -p REALM_NAME=devhub -p REPO=https://github.com/bcgov/Mautic-Subscription-App -p TARGET_NAMESPACE=de0974-test -p APP_NAME=mautic-subscription -p KEYCLOAK_URL=https://test.oidc.gov.bc.ca`

Or, to cleanup all mautic subscription app related artifacts in a namespace, run the command:
`oc delete all,configmap,pvc,secret,service -l app=[app-name] -n [target-namespace]`

- Example:
`oc delete all,configmap,pvc,secret,service -l app=mautic-subscription -n de0974-dev`

## Using openshift commands
#### Setting up openshift parameters
Start by creating a `mautic.subscription.param` file with the parameters in the `openshift/mautic.subscription.param.example` file. 

Of particular note are the parameters SUBSCRIBE_FORM, UNSUBSCRIBE_FORM, SUBSCRIBE_URL, and UNSUBSCRIBE_URL.

The SUBSCRIBE_FORM and UNSUBSCRIBE_FORM parameters are the names of the subscribe and unsubscribe forms in lower case. Under Components -> Forms in the Mautic App, you can find the names of each form listed under the `Name` column.

The SUBSCRIBE_URL and UNSUBSCRIBE_URL are the subscribe and unsubscribe form URLs. They are expressed in the following format: ```<mautic-app-url>/form/submit?formId=[form-id]``` where the `form-id` are listed under the `ID` column in Components -> Forms in the Mautic App

Leave the HOST_URL value as "". This parameter will only be used when promoting the app to the prod environment.

- Example:
```
NAME=mautic-subscription
SOURCE_REPOSITORY_URL=https://github.com/bcgov/Mautic-Subscription-App
SOURCE_REPOSITORY_REF=clean-state
TOOLS_NAMESPACE=de0974-tools
DEV_NAMESPACE=de0974-dev
TEST_NAMESPACE=de0974-test
PROD_NAMESPACE=de0974-prod
IMAGE_TAG=pr10
IMAGE_REGISTRY=image-registry.openshift-image-registry.svc:5000
SUBSCRIBE_FORM=subscribe
UNSUBSCRIBE_FORM=unsubscribe
SUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=1
UNSUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=2
KEYCLOAK_URL=https://dev.oidc.gov.bc.ca
SSO_REALM=devhub
```
#### Setting up keycloak clients
For each deployment in the dev namespace there must be a keycloak client created for it. The keycloak Client ID should match the deployment config name.

For the test and prod namespaces, one keycloak client for each of the namespaces must be created. Ex// `mautic-subscription-test` and `mautic-subscription-prod`

Keycloak clients for the test and prod environments should be created with the following properties:
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
`oc process -f openshift/mautic.subscribe.bc.yaml --param-file=openshift/mautic.subscription.param --ignore-unknown-parameters=true -p IMAGE_TAG=pr[pr-number] | oc apply -f - -n [tools-namespace]`
and
`oc start-build -w [app-name]-[image-tag]`

- Example:
`oc process -f openshift/mautic.subscribe.bc.yaml --param-file=openshift/mautic.subscription.param --ignore-unknown-parameters=true -p IMAGE_TAG=pr10 | oc apply -f - -n de0974-tools`
`oc start-build -w mautic-subscription-pr10`

#### Retag Images
Before deploying the app in the dev/test/prod namespaces run the following command to retag the image from the tools namespace:
`oc tag [tools-namespace]/[app-name]:[image-tag] [target-namespace]/[app-name]:[image-tag]`

Note for best practice, the pr number can be used as the image tag in the dev namespace but in the test/prod namespaces the image tag should be test/prod

- Example to retag the image to the dev namespace:
`oc tag de0974-tools/mautic-subscription:pr10 de0974-dev/mautic-subscription:pr10`

- Example to retag the image to the test namespace:
`oc tag de0974-tools/mautic-subscription:pr10 de0974-test/mautic-subscription:test`

#### Deploying the app
After retagging the image, delete the previously configured configmap if there is one:
`oc delete configmap mautic-config-[image-tag] -n [target-namespace]` 

Then deploy the app in the target namespaces using the command:
`oc process -f openshift/mautic.subscribe.dc.yaml --param-file=openshift/mautic.subscription.param --ignore-unknown-parameters=true -p TARGET_NAMESPACE=[target-namespace] -p SSO_CLIENT_ID=[sso-client-id] -p KEYCLOAK_URL=[keycloak-url] -p HOST_URL=[host-url] -p SSO_AUTHORIZED_ROLES=[authorized-roles]| oc apply -f - -n [target-namespace]`

Note that the HOST_URL will default to `https://[app-name]-[image-tag]-[namespace].[host-address]/` if not provided.
The HOST_URL is optional for deployments to dev and test namespaces but should be specified for the prod namespace to provide a relevant URL for users.
The SSO_AUTHORIZED_ROLES is also optional and should be specified as csv when gating users with certain roles to sign up for the mailing list.

- Example deploying to dev:
`oc delete configmap mautic-config-pr10 -n de0974-dev`
`oc process -f openshift/mautic.subscribe.dc.yaml --param-file=openshift/mautic.subscription.param --ignore-unknown-parameters=true -p TARGET_NAMESPACE=de0974-dev -p SSO_CLIENT_ID=mautic-subscription-pr10 -p IMAGE_TAG=pr10 -p KEYCLOAK_URL=https://dev.oidc.gov.bc.ca -p SSO_AUTHORIZED_ROLES="github-org-bcgov,github-org-bcgov-c,github-org-bcdevops,idir-user" | oc apply -f - -n de0974-dev`

- Example deploying to prod:
`oc delete configmap mautic-config-prod -n de0974-prod`
`oc process -f openshift/mautic.subscribe.dc.yaml --param-file=openshift/mautic.subscription.param --ignore-unknown-parameters=true -p TARGET_NAMESPACE=de0974-prod -p SSO_CLIENT_ID=mautic-subscription-prod -p IMAGE_TAG=prod -p KEYCLOAK_URL=https://oidc.gov.bc.ca -p SSO_AUTHORIZED_ROLES="github-org-bcgov,github-org-bcgov-c,github-org-bcdevops,idir-user" -p HOST_URL=https://platform.subscription.gov.bc.ca | oc apply -f - -n de0974-prod`

#### Cleaning up
To clean up a deployment and its artifact in a namespace, run the command:
`oc delete all,configmap,secret -l name=[app-name]-[image-tag] -n [target-namespace]`

- Example:
`oc delete all,configmap,secret -l name=mautic-subscription-pr10 -n de0974-dev`

Or, to cleanup all mautic subscription app related artifacts in a namespace, run the command:
`oc delete all,configmap,secret -l app=[app-name] -n [target-namespace]`

- Example:
`oc delete all,configmap,secret -l app=mautic-subscription -n de0974-dev`