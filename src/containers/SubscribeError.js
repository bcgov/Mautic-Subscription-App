import React from 'react';
import { Modal, ModalHeader, ModalBody, } from 'reactstrap';
import { APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
import Banner from '../components/UI/Banner';

export const SubscribeError = () => {

  return (
    <Modal modalClassName="auth-modal" isOpen={true} fade={false}>
      <ModalHeader>
        <Banner titleText={APP_INFO.NAME} />
      </ModalHeader>
      <ModalBody>There was an unexpected error. Please try again in a few moments. If the error persists, please contact the Platform Services team for more information.
      </ModalBody>
    </Modal>
  );
};

export default SubscribeError;
