
import './App.css';
import Layout from './hoc/Layout';
import AuthModal from './components/Auth/AuthModal'; 
import { Route, Switch } from 'react-router-dom';
import { Subscription } from './containers/Subscription'
import { Subscribed } from './containers/Subscribed'
import { Unsubscribed } from './containers/Unsubscribed'
import { PrivateRoute } from './utilities/PrivateRoute'
import { useKeycloak } from '@react-keycloak/web';

function App() {
  // const {keycloak, initialized} = useKeycloak();
  //   if (!initialized) {
  //       return <div/>;
  //   }

  return (
      <Layout >
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
          <Route path="/" component={AuthModal} />
        </Switch>
      </Layout>
  );
}

export default App;
