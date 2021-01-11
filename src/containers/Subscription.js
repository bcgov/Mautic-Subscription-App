import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
import Banner from '../components/UI/Banner';
import { useKeycloak } from '@react-keycloak/web';
import jwt_decode from "jwt-decode";
import { Redirect } from 'react-router-dom';

// const subscription = (subscriptionType) => {
//     var form = document.createElement('form');
//     form.setAttribute('method', 'post');
//     form.setAttribute('email','97andrewjun@gmail.com')
//     if (subscriptionType === 'subscribe'){
//       form.setAttribute('action', 'http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=1');
//     } else {
//       form.setAttribute('action', 'http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=2');
//     }
    
//     document.body.appendChild(form)
//     form.submit();
// }

const getEmail = (idToken) => {
  if (idToken){
    const decodedToken = jwt_decode(idToken);
    return decodedToken.email;
  }
};

export const Subscription = () => {
  const { keycloak } = useKeycloak();

  // Back to root route if the user is not authenticated
  if (keycloak.authenticated == false){
    return (
      <Redirect to="/" />
    )
  }

  const userEmail = getEmail(keycloak.idToken); 

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
        <div className="auth-buttons">
          {/* <button className="auth-button" onclick={subscription("subscribe")}>Subscribe</button> 
          <button className="auth-button" onclick={subscription("unsubscribe")}>Unsubscribe</button>  */}
          <form action="http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=1" method="post">
            <input className="auth-button" type="submit" value="Subscribe"/>
            <input type="hidden" name="mauticform[emailsubscribe]" value="97andrewjun@gmail.com" ></input>
            <input type="hidden" name="mauticform[formId]" id="mauticform_subscribe_id" value="1"></input>
            <input type="hidden" name="mauticform[return]" id="mauticform_subscribe_return" value="localhost:3000"></input>
            <input type="hidden" name="mauticform[formName]" id="mauticform_subscribe_name" value="subscribe"></input>
          </form>
          <form action="http://mautic-de0974-tools.apps.silver.devops.gov.bc.ca/form/submit?formId=2" method="post">
            <input className="auth-button" type="submit" value="Unsubscribe"/>
            <input type="hidden" name="mauticform[emailunsubscribe]" value="97andrewjun@gmail.com"></input>
            <input type="hidden" name="mauticform[formId]" id="mauticform_unsubscribe_id" value="2"></input>
            <input type="hidden" name="mauticform[return]" id="mauticform_unsubscribe_return" value="localhost:3001"></input>
            <input type="hidden" name="mauticform[formName]" id="mauticform_unsubscribe_name" value="unsubscribe"></input>
          </form>
        </div>
      </ModalFooter>
    </Modal>
  );
};



export default Subscription;
