import Keycloak from 'keycloak-js';
import { useConfig } from '../hooks/useConfig';

const config = useConfig('/config/sso.json');

const keycloak = new Keycloak({
  url: `${config.baseURL}/auth`,
  realm: config.realmName,
  clientId: config.clientId
});

// keycloak.init({ checkLoginIframe: true });

export default keycloak;