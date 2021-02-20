## Setting up Mautic Subscription App on Openshift

Start by granting imagepull access to the tools namespace for the dev, test, and prod namespaces
`oc process -f openshift/mautic.subscribe.rolebindings.yaml -p LICENSE_PLATE=[licenseplate-name] | oc apply -f -`

## caddy s2i

### Using Argo
To use Argo, Start by updating the parameters in the `openshift/argo/install.param` file. Do not include any periods, slashes, spaces or other characters inappropriate for a URL. 

Perform the argo installation like this: 
`oc process -f install.yaml --param-file=install.param | oc apply -n [tools-namespace] -f -`

And to allow the service account `workflow-creator` to have edit access to the dev, test, and prod namespaces, run the commands:
`oc process -f serviceaccount.access.tools.yaml -p TOOLS_NAMESPACE=[tools-namespace] | oc apply -n [tools-namespace] -f -`
`oc process -f serviceaccount.access.dev.yaml -p TOOLS_NAMESPACE=[tools-namespace] -p DEV_NAMESPACE=[dev-namespace] | oc apply -n [dev-namespace] -f -`
`oc process -f serviceaccount.access.test.yaml -p TOOLS_NAMESPACE=[tools-namespace] -p TEST_NAMESPACE=[test-namespace] | oc apply -n [test-namespace] -f -`
`oc process -f serviceaccount.access.prod.yaml -p TOOLS_NAMESPACE=[tools-namespace] -p PROD_NAMESPACE=[prod-namespace] | oc apply -n [prod-namespace] -f -`

Now argo should be set up to run the workflows.
To build and deploy the subscription app to the dev namespace, run the command:
`argo submit openshift/argo/mautic.subscribe.build.yaml -p PR=[pr-number] -p BRANCH=[git-branch] -p REALM_NAME=[sso-realm-name] -p REPO=[git-repo] -p DEV_NAMESPACE=de0974-dev -p NAME=[app-name] -p TOOLS_NAMESPACE=[tools-namespace] -p HOST_ADDRESS=[host-address]  -p KEYCLOAK_URL=[keycloak-url] -p SUBSCRIBE_FORM=[subscribe-form-name]-p UNSUBSCRIBE_FORM=[unsubscribe-form-name]-p SUBSCRIBE_URL=[subscribe-form-url] -p UNSUBSCRIBE_URL=[unsubscribe-form-url]`


### Using openshift commands
