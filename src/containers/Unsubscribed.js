import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { SSO_IDP, APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
import IdpButton from '../components/Auth/IdpButton.js';
import Banner from '../components/UI/Banner';

export const Unsubscribed = () => {
  return (
    <Modal modalClassName="auth-modal" isOpen={true} fade={false}>
      <ModalHeader>
        <Banner titleText={APP_INFO.NAME} />
      </ModalHeader>
      <ModalBody>Unsubscribed!</ModalBody>
    </Modal>
  );
};



export default Unsubscribed;
