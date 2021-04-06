import React from 'react';
import { Modal, ModalHeader, ModalBody, } from 'reactstrap';
import { APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
import Banner from '../components/UI/Banner';

export const Unsubscribed = () => {

  return (
    <Modal modalClassName="auth-modal" isOpen={true} fade={false}>
      <ModalHeader>
        <Banner titleText={APP_INFO.NAME} />
      </ModalHeader>
      <ModalBody>You have been successfully unsubscribed from the {APP_INFO.NAME}. We are sorry to see you go. If you change your mind, you can always re-subscribe
        at <a href={APP_INFO.URL}>{APP_INFO.URL}</a>. You can now close the page.
      </ModalBody>
    </Modal>
  );
};

export default Unsubscribed;
