import Keycloak from 'keycloak-js';
import { SSO_CONFIG } from './constants.js'

const keycloak = new Keycloak({
  url: `${SSO_CONFIG.baseURL}/auth`,
  realm: SSO_CONFIG.realmName,
  clientId: SSO_CONFIG.clientId,
});

// keycloak.init({ checkLoginIframe: true });

export default keycloak;