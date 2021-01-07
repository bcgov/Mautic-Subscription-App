//
// DevHub
//
// Copyright © 2018 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Created by Jason Leach on 2018-10-03.
//

import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import './AuthModal.css';

const actionForCurrentState = (keycloak, {idp} ) => {
  if (keycloak.authenticated) {
    return () => keycloak.logout();
  }
   
  return () =>  keycloak.login({ idpHint: idp, redirectUri: window.location.origin + `string text /subscription` });
};

const IdpButton = ({ idp }) => {
  const { keycloak } = useKeycloak();

  return (
    <button className="auth-button"
      onClick={actionForCurrentState(keycloak, idp)}
    >
    { idp }
    </button>
  );
};

IdpButton.defaultProps = {
  onClick: () => { }
};

export default IdpButton;