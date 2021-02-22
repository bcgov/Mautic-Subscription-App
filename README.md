# Setting up Mautic Subscription App on Openshift

Start by granting imagepull access to the tools namespace for the dev, test, and prod namespaces
`oc process -f openshift/mautic.subscribe.rolebindings.yaml -p LICENSE_PLATE=[licenseplate-name] | oc apply -f -`
- Example: 

    `oc process -f openshift/mautic.subscribe.rolebindings.yaml -p NAMESPACE=de0974 | oc apply -f -`


## Setting up caddy s2i

## Using Argo
#### Installing Argo and setting up the environment
To use Argo, Start by updating the parameters in the `openshift/argo/install.param` file. Do not include any periods, slashes, spaces or other characters inappropriate for a URL. 

Perform the argo installation like this: 
`oc process -f install.yaml --param-file=install.param | oc apply -n [tools-namespace] -f -`
- Example: 

    `oc process -f install.yaml --param-file=install.param | oc apply -n de0974-tools -f -`

And to allow the service account `workflow-creator` to have edit access to the dev, test, and prod namespaces, run the commands:
`oc process -f serviceaccount.access.tools.yaml -p TOOLS_NAMESPACE=[tools-namespace] | oc apply -n [tools-namespace] -f -`
`oc process -f serviceaccount.access.dev.yaml -p TOOLS_NAMESPACE=[tools-namespace] -p DEV_NAMESPACE=[dev-namespace] | oc apply -n [dev-namespace] -f -`
`oc process -f serviceaccount.access.test.yaml -p TOOLS_NAMESPACE=[tools-namespace] -p TEST_NAMESPACE=[test-namespace] | oc apply -n [test-namespace] -f -`
`oc process -f serviceaccount.access.prod.yaml -p TOOLS_NAMESPACE=[tools-namespace] -p PROD_NAMESPACE=[prod-namespace] | oc apply -n [prod-namespace] -f -`

Now argo should be set up to run the workflows.
#### Build and Deploy
To build the subscription app in the tools namespace and deploy to the dev namespace, run the command:
`argo submit openshift/argo/mautic.subscribe.build.yaml -p PR=[pr-number] -p BRANCH=[git-branch] -p REALM_NAME=[sso-realm-name] -p REPO=[git-repo] -p DEV_NAMESPACE=de0974-dev -p NAME=[app-name] -p TOOLS_NAMESPACE=[tools-namespace] -p HOST_ADDRESS=[host-address]  -p KEYCLOAK_URL=[keycloak-url] -p SUBSCRIBE_FORM=[subscribe-form-name]-p UNSUBSCRIBE_FORM=[unsubscribe-form-name]-p SUBSCRIBE_URL=[subscribe-form-url] -p UNSUBSCRIBE_URL=[unsubscribe-form-url]`

- Example: 

    `argo submit openshift/argo/mautic.subscribe.build.yaml -p PR=1 -p BRANCH=clean-state -p REALM_NAME=devhub -p REPO=https://github.com/bcgov/Mautic-Subscription-App -p DEV_NAMESPACE=de0974-dev  -p NAME=mautic-subscription -p IMAGE_TAG=1 -p TOOLS_NAMESPACE=de0974-tools -p HOST_ADDRESS=apps.silver.devops.gov.bc.ca  -p KEYCLOAK_URL=https://dev.oidc.gov.bc.ca -p SUBSCRIBE_FORM=subscribe -p UNSUBSCRIBE_FORM=unsubscribe -p SUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=5 -p UNSUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=2  -p SSO_REALM=devhub`


To promote the app in higher environments, run the command:
`argo submit openshift/argo/mautic.subscribe.promote.yaml -p PR=[pr-number] -p BRANCH=[git-branch] -p REALM_NAME=[sso-realm-name] -p REPO=[git-repo] -p TARGET_NAMESPACE=[target-namespace] -p NAME=[app-name] -p IMAGE_TAG=[environment-name] -p TOOLS_NAMESPACE=[tools-namespace] -p HOST_ADDRESS=[host-address] -p KEYCLOAK_URL=[keycloak-url] -p SUBSCRIBE_FORM=[subscribe-form-name]-p UNSUBSCRIBE_FORM=[unsubscribe-form-name]-p SUBSCRIBE_URL=[subscribe-form-url] -p UNSUBSCRIBE_URL=[unsubscribe-form-url]`

- Example promoting the app to the test namespace: 

    `argo submit openshift/argo/mautic.subscribe.promote.yaml -p PR=1 -p BRANCH=clean-state -p REALM_NAME=devhub -p REPO=https://github.com/bcgov/Mautic-Subscription-App -p TARGET_NAMESPACE=de0974-test -p NAME=mautic-subscription -p IMAGE_TAG=test -p TOOLS_NAMESPACE=de0974-tools -p HOST_ADDRESS=apps.silver.devops.gov.bc.ca -p KEYCLOAK_URL=https://test.oidc.gov.bc.ca -p SUBSCRIBE_FORM=subscribe -p UNSUBSCRIBE_FORM=unsubscribe -p SUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=5 -p UNSUBSCRIBE_URL=http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=2`

#### Cleanup

To cleanup the artifacts in a namespace, run the command:
`argo submit openshift/argo/mautic.subscribe.cleanup.yaml -p PR=[pr-number] -p BRANCH=[git-branch] -p REALM_NAME=[sso-realm-name] -p REPO=[git-repo] -p TARGET_NAMESPACE=[target-namespace] -p NAME=[app-name]-p KEYCLOAK_URL=[keycloak-url]`

- Example cleaning up the dev namespace:

    `argo submit openshift/argo/mautic.subscribe.cleanup.yaml -p PR=1 -p BRANCH=clean-state -p REALM_NAME=devhub -p REPO=https://github.com/bcgov/Mautic-Subscription-App -p TARGET_NAMESPACE=de0974-dev -p NAME=mautic-subscription -p KEYCLOAK_URL=https://dev.oidc.gov.bc.ca`


--------------
Change cleanup code to only delete pr in dev, and test/prod in test/prod
--------------


## Using openshift commands
