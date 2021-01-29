//
// Mautic Subscription App
//
// Copyright © 2019 Province of British Columbia
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
// Created by Shelly Xue Han on 2019-01-16.
//

export const AUTHENTICATION = {
  SUCCESS: 'AUTHENTICATE_SUCCESS',
  FAILED: 'AUTHENTICATE_FAILED',
};

export const AUTHORIZATION = {
  START: 'AUTHORIZATION_START',
  SUCCESS: 'AUTHORIZATION_SUCCESS',
  ERROR: 'AUTHORIZATION_ERROR',
  STOP: 'AUTHORIZATION_STOP',
};

export const INIVITE_USER = {
  START: 'INIVITE_USER_START',
  SUCCESS: 'INIVITE_USER_SUCCESS',
  ERROR: 'INIVITE_USER_ERROR',
};

export const VERIFY_EMAIL = {
  START: 'VERIFY_EMAIL_START',
  SUCCESS: 'VERIFY_EMAIL_SUCCESS',
  ERROR: 'VERIFY_EMAIL_ERROR',
};
