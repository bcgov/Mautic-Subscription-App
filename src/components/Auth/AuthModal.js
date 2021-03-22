import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Banner from '../UI/Banner';
import { SSO_IDP, APP_INFO } from '../../constants';
import './AuthModal.css';
import IdpButton from './IdpButton.js';
import { useKeycloak } from '@react-keycloak/web';
import { Redirect } from 'react-router';

export const AuthModal = () => {
  const { keycloak, initialized } = useKeycloak();
  const isAuthenticated = keycloak.authenticated;

  if (isAuthenticated) {
    return (
      <Redirect to={{ pathname: '/subscription', }} />
    )
  }

  return (
    <Modal modalClassName="auth-modal" isOpen={true} fade={false}>
      <ModalHeader>
        <Banner titleText={APP_INFO.NAME} />
      </ModalHeader>
      <ModalBody>Please login to subscribe/unsubscribe from the {APP_INFO.NAME}.</ModalBody>
      <ModalFooter>
        <p>Login with:</p>
        <div className="auth-buttons">
          <IdpButton idp={SSO_IDP.IDIR}/>
          <IdpButton idp={SSO_IDP.GITHUB}/>
        </div>
      </ModalFooter>
    </Modal>
  );
};



export default AuthModal;