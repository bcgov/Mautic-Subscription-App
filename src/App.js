
import './App.css';
import Layout from './hoc/Layout';
import AuthModal from './components/Auth/AuthModal'; 
import { Route, Switch } from 'react-router-dom';
import { Subscription } from './containers/Subscription'
import { SubscribeSuccess } from './containers/SubscribeSuccess'
import { SubscribeError } from './containers/SubscribeError'
import { Unauthorized } from './containers/Unauthorized'
import { Logout } from './components/Auth/Logout'
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
            path="/subscribe/success"
            component={SubscribeSuccess}
          />
          <PrivateRoute
            path="/subscribe/error"
            component={SubscribeError}
          />
          <Route path="/logout" component={Logout} />
          <Route path="/401" component={Unauthorized} />
          <Route path="/" component={AuthModal} />
        </Switch>
      </Layout>
  );
}

export default App;
