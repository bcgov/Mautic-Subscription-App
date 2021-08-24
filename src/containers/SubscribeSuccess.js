import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
import Banner from '../components/UI/Banner';

export const SubscribeSuccess = () => {

  return (
    <Modal modalClassName="auth-modal" isOpen={true} fade={false}>
      <ModalHeader>
        <Banner titleText={APP_INFO.NAME} />
      </ModalHeader>
      <ModalBody>Your subscription preferences have been updated successfully. You can now close the page.</ModalBody>
    </Modal>
  );
};

export default SubscribeSuccess;
