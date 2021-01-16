
import './App.css';
import Layout from './hoc/Layout';
import AuthModal from './components/Auth/AuthModal';
import { KeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'
import { Route, Switch } from 'react-router-dom';
import { Subscription } from './containers/Subscription'
import { Subscribed } from './containers/Subscribed'
import { Unsubscribed } from './containers/Unsubscribed'

function App() {
  return (
    <KeycloakProvider keycloak={keycloak}>
      <Layout >
        <AuthModal />
        <Switch>
          <Route
            path="/subscription"
            component={Subscription}
            authClient={keycloak}
            /* authentication={this.props.authentication}
            authorization={this.props.authorization}
            verifyEmail={this.props.verifyEmail} */
          />
          <Route
            path="/subscribed"
            component={Subscribed}
            authClient={keycloak}
          />
          <Route
            path="/unsubscribed"
            component={Unsubscribed}
            authClient={keycloak}
          />
        </Switch>
      </Layout>
    </KeycloakProvider>
  );
}

export default App;
