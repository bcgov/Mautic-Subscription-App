//
// Mautic Subscription App
//
// Copyright © 2018 Province of British Columbia
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
// Created by Shelly Xue Han on 2019-01-10.
//

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import 'bootstrap-css-only/css/bootstrap-reboot.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import './index.css';
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'
import serviceWorker from './serviceWorker';
import configureStore from './configureStore';
import { BrowserRouter } from 'react-router-dom';

const store = configureStore();

ReactDOM.render(
  <ReactKeycloakProvider initOptions={{ checkLoginIframe:false }} authClient={keycloak}>
  <Provider store={store}>
    <BrowserRouter>
      <App /> 
    </BrowserRouter>
  </Provider>
  </ReactKeycloakProvider>,
  document.getElementById('root')
);

serviceWorker();
