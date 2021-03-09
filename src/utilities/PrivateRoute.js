
import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useConfig } from '../hooks/useConfig';

export const PrivateRoute = ({ component: Component, ...rest }) => {
    const { keycloak, initialized } = useKeycloak();
    const authorizedRolesJSON = useConfig('/config/authorizedRoles.json');

    const isMember = ( userRoles, authorizedRoles) => {
      /**
       * @param {string[]} userRoles user's roles in the realm
       * @param {string} authorizedRoles comma separated values of roles that are authorized
       *  @returns {boolean} 
       */
      const splitAuthorizedRoles = authorizedRoles.split(',');

      // return true if there are no defined authorized roles since everyone is authorized   
      if (authorizedRoles.length === 1 && splitAuthorizedRoles[0] === '') return true
      
      // check if the user is authorized
      const result = userRoles.filter(role => splitAuthorizedRoles.indexOf(role) > -1);
      return result.length > 0
    }

    return initialized && (
        <Route
            {...rest}
            render={props => {
                return keycloak.authenticated && isMember(keycloak.realmAccess.roles, authorizedRolesJSON.authorizedRoles)
                    ? <Component {...props} />
                    : <Redirect to={{ pathname: '/401', }} />
            }}
        />
    )
}

export default PrivateRoute;    