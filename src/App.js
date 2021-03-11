
import './App.css';
import Layout from './hoc/Layout';
import AuthModal from './components/Auth/AuthModal'; 
import { Route, Switch } from 'react-router-dom';
import { Subscription } from './containers/Subscription'
import { Subscribed } from './containers/Subscribed'
import { Unsubscribed } from './containers/Unsubscribed'
import { Unauthorized } from './containers/Unauthorized'
import { Logout } from './components/Auth/Logout'

import { PrivateRoute } from './utilities/PrivateRoute'
import { useKeycloak } from '@react-keycloak/web';

function App() {
  const { keycloak, initialized } = useKeycloak();
  return (
      <Layout >
        <Switch>
          <PrivateRoute
            path="/subscription"
            component={Subscription}
          />
          <PrivateRoute
            path="/subscribed"
            component={Subscribed}
          />
          <PrivateRoute
            path="/unsubscribed"
            component={Unsubscribed}
          />
          <Route path="/logout" component={Logout} />
          <Route path="/401" component={Unauthorized} />
          <Route path="/" component={AuthModal} />
        </Switch>
      </Layout>
  );
}

export default App;
