import config from './config.json';

export const APP_INFO = {
    NAME: 'Mautic Subscription App',
    DISPLAY_NAME: 'Mautic Subscription App',
};

export const SSO_IDP = {
    GITHUB: 'github',
    IDIR: 'idir',
};

export const SSO_CONFIG = {
    baseURL: process.env.REACT_APP_SSO_BASE_URL || config.ssoBaseUrl,
    realmName: process.env.REACT_APP_SSO_REALM_NAME || config.ssoRealmName,
    clientId: process.env.REACT_APP_SSO_CLIENT_ID || config.ssoClientId,
    kcIDPHint: null,
};

export const SUBSCRIPTION_FORM = {
    subscribe: 'http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=1',
    unsubscribe: 'http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=2',
};
