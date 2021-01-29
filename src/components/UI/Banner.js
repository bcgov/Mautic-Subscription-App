//
// Mautic Subscription App
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
// Created by Jason Leach on 2018-09-04.
//

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Textfit } from 'react-textfit';
import logo from './bcgovlogo.svg';
import './Banner.css';

export const Banner = ({ link = '', titleText }) => {
  return (
    <div className="banner">
      <Link to={link}>
        <img src={logo} className="header-logo" alt="logo" />
      </Link>
      <Textfit className="header-title" mode="multi">
        {titleText}
      </Textfit>
    </div>
  );
};

Banner.propTypes = {
  link: PropTypes.string,
  titleText: PropTypes.string.isRequired,
};

export default Banner;
