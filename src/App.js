
import './App.css';
import Layout from './hoc/Layout';
import AuthModal from './components/Auth/AuthModal'; 
import { Route, Switch } from 'react-router-dom';
import { Subscription } from './containers/Subscription'
import { Subscribed } from './containers/Subscribed'
import { Unsubscribed } from './containers/Unsubscribed'
import { Unauthorized } from './containers/Unauthorized'

import { PrivateRoute } from './utilities/PrivateRoute'

function App() {
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
          <Route path="/" component={AuthModal} />
          <Route path="/401" component={Unauthorized} />
        </Switch>
      </Layout>
  );
}

export default App;
