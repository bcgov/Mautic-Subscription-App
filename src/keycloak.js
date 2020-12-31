import Keycloak from 'keycloak-js';
import { SSO_CONFIG } from './constants';

const keycloak = Keycloak({
  url: `${SSO_CONFIG.baseURL}/auth`,
  realm: SSO_CONFIG.realmName,
  clientId: SSO_CONFIG.clientId,
});

// keycloak.init({ checkLoginIframe: true });

export default keycloak;