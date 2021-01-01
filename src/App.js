
import './App.css';
import Layout from './hoc/Layout';
import AuthModal from './components/Auth/AuthModal';
import { KeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'

function App() {
  return (
    <KeycloakProvider keycloak={keycloak}>
      <Layout >
        <AuthModal />
      </Layout>
    </KeycloakProvider>
  );
}

export default App;
