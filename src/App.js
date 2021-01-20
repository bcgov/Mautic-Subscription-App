
import './App.css';
import Layout from './hoc/Layout';
import AuthModal from './components/Auth/AuthModal';
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'
import { Route, Switch } from 'react-router-dom';
import { Subscription } from './containers/Subscription'
import { Subscribed } from './containers/Subscribed'
import { Unsubscribed } from './containers/Unsubscribed'
import { PrivateRoute } from './utilities/PrivateRoute'

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <Layout >
        <AuthModal />
        <Switch>
          <PrivateRoute
            path="/subscription"
            component={Subscription}
            /* authentication={this.props.authentication}
            authorization={this.props.authorization}
            verifyEmail={this.props.verifyEmail} */
          />
          <PrivateRoute
            path="/subscribed"
            component={Subscribed}
          />
          <PrivateRoute
            path="/unsubscribed"
            component={Unsubscribed}
          />
        </Switch>
      </Layout>
    </ReactKeycloakProvider>
  );
}

export default App;
