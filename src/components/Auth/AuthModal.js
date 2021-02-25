import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Banner from '../UI/Banner';
import { SSO_IDP, APP_INFO } from '../../constants';
import './AuthModal.css';
import IdpButton from './IdpButton.js';

export const AuthModal = () => {
  return (
    <Modal modalClassName="auth-modal" isOpen={true} fade={false}>
      <ModalHeader>
        <Banner titleText={APP_INFO.NAME} />
      </ModalHeader>
      <ModalBody>Please login to subscribe/unsubscribe from the Mautic Subscription List</ModalBody>
      <ModalFooter>
        <p>Login with:</p>
        <div className="auth-buttons">
          <IdpButton idp={SSO_IDP.IDIR}/>
          {/* Disable github button until github org filter is implemented */}
          {/* <IdpButton idp={SSO_IDP.GITHUB}/> */}
        </div>
      </ModalFooter>
    </Modal>
  );
};



export default AuthModal;
