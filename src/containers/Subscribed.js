import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
import Banner from '../components/UI/Banner';
import { useKeycloak } from '@react-keycloak/web';
import { Redirect } from 'react-router-dom';

export const Subscribed = () => {
  const { keycloak } = useKeycloak();

  return (
    <Modal modalClassName="auth-modal" isOpen={true} fade={false}>
      <ModalHeader>
        <Banner titleText={APP_INFO.NAME} />
      </ModalHeader>
      <ModalBody>You have been successfully subscribed to the {APP_INFO.NAME}. You can now close the page.</ModalBody>
    </Modal>
  );
};

export default Subscribed;
