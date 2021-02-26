import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { APP_INFO, SUBSCRIPTION_FORM } from '../constants';
import '../components/Auth/AuthModal.css';
import Banner from '../components/UI/Banner';
import { useKeycloak } from '@react-keycloak/web';
import { useConfig } from '../hooks/useConfig';

export const Subscription = () => {
  const { keycloak } = useKeycloak();
  const config = useConfig('/config/form.json');
  const userEmail = keycloak.idTokenParsed.email; 

  const getformID = ( actionLink ) => {
    return actionLink.charAt(actionLink.length-1)
  }

  return (
    <Modal modalClassName="auth-modal" isOpen={true} fade={false}>
      <ModalHeader>
        <Banner titleText={APP_INFO.NAME} />
      </ModalHeader>
      <ModalBody>
        Subscribe/unsubscribe from the mautic mailing list.
        <br />
        Your email address is <b>{userEmail}</b>.
      </ModalBody>
      <ModalFooter>
        {config ? (
        <div className="auth-buttons">
          <form action={config.subscribeActionURL} method="post">
            <input className="auth-button" type="submit" value="Subscribe"/>
            <input type="hidden" name="mauticform[f_subscribe]" value={userEmail}></input>
            <input type="hidden" name="mauticform[formId]" value={getformID(config.subscribeActionURL)}></input>
            <input type="hidden" name="mauticform[return]" value=""></input>
            <input type="hidden" name="mauticform[formName]" value={config.subscribeFormName}></input>
          </form>
          <form action={config.unsubscribeActionURL} method="post">
            <input className="auth-button" type="submit" value="Unsubscribe"/>
            <input type="hidden" name="mauticform[f_unsubscribe]" value={userEmail}></input>
            <input type="hidden" name="mauticform[formId]" value={getformID(config.unsubscribeActionURL)}></input>
            <input type="hidden" name="mauticform[return]" value=""></input>
            <input type="hidden" name="mauticform[formName]" value={config.unsubscribeFormName}></input>
          </form>
        </div>
        ): <div>loading...</div>
      }
      </ModalFooter>
    </Modal>
  );

};



export default Subscription;
