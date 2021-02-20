## Setting up Mautic Subscription App on Openshift

Start by granting imagepull access to the tools namespace for the dev, test, and prod namespaces
`oc process -f openshift/mautic.subscribe.rolebindings.yaml -p LICENSE_PLATE=[licenseplate name] | oc apply -f -`


### Using Argo
To use Argo, Start by updating the parameters in the `openshift/argo/install.param` file. Do not include any periods, slashes, spaces or other characters inappropriate for a URL. 

Perform the installation like this: 
`oc process -f install.yaml --param-file=install.param | oc apply -n [NAMESPACE] -f -`

And to allow the service account `workflow-creator` to have edit access to the dev, test, and prod namespaces, run the commands:
`oc process -f serviceaccount.access.tools.yaml -p TOOLS_NAMESPACE=[TOOLS_NAMESPACE] | oc apply -n [TOOLS_NAMESPACE] -f -`
`oc process -f serviceaccount.access.dev.yaml -p TOOLS_NAMESPACE=[TOOLS_NAMESPACE] -p DEV_NAMESPACE=[DEV_NAMESPACE] | oc apply -n [DEV_NAMESPACE] -f -`
`oc process -f serviceaccount.access.test.yaml -p TOOLS_NAMESPACE=[TOOLS_NAMESPACE] -p TEST_NAMESPACE=[TEST_NAMESPACE] | oc apply -n [TEST_NAMESPACE] -f -`
`oc process -f serviceaccount.access.prod.yaml -p TOOLS_NAMESPACE=[TOOLS_NAMESPACE] -p PROD_NAMESPACE=[PROD_NAMESPACE] | oc apply -n [PROD_NAMESPACE] -f -`



### Using openshift commands
