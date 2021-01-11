import React from 'react';
import { Modal, ModalHeader, ModalBody, } from 'reactstrap';
import { APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
import Banner from '../components/UI/Banner';

export const Unsubscribed = () => {
  const { keycloak } = useKeycloak();

  // Back to root route if the user is not authenticated
  if (keycloak.authenticated == false){
    return (
      <Redirect to="/" />
    )
  }
  
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
