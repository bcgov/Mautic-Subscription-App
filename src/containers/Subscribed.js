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
      <ModalBody>You have subscribed to the {APP_INFO.NAME}.</ModalBody>
    </Modal>
  );
};

export default Subscribed;
