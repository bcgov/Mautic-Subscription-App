
import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';


export const PrivateRoute= ({ component: Component, ...rest }) => {
    const { keycloak } = useKeycloak();

    const isAuthorized = () => {
        console.log(keycloak)
        if (keycloak?.authenticated) {
            return keycloak.authenticated;
        }
        return false;
    }

    return (
        <Route
            {...rest}
            render={props => {
                return isAuthorized()
                    ? <Component {...props} />
                    : <Redirect to={{ pathname: '/', }} />
            }}
        />
    )
}

export default PrivateRoute;