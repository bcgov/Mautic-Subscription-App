import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { APP_INFO, SUBSCRIPTION_FORM } from '../constants';
import '../components/Auth/AuthModal.css';
import Banner from '../components/UI/Banner';
import { useKeycloak } from '@react-keycloak/web';

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


export const Subscription = () => {
  const { keycloak } = useKeycloak();

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
        <div className="auth-buttons">
          {/* <button className="auth-button" onclick={subscription("subscribe")}>Subscribe</button> 
          <button className="auth-button" onclick={subscription("unsubscribe")}>Unsubscribe</button>  */}
          <form action={SUBSCRIPTION_FORM.subscribeActionURL} method="post">
            <input className="auth-button" type="submit" value="Subscribe"/>
            <input type="hidden" name="mauticform[email]" value={userEmail}></input>
            <input type="hidden" name="mauticform[formId]" value={getformID(SUBSCRIPTION_FORM.subscribeActionURL)}></input>
            <input type="hidden" name="mauticform[return]" value=""></input>
            <input type="hidden" name="mauticform[formName]" value={SUBSCRIPTION_FORM.subscribeFormName}></input>
          </form>
          <form action={SUBSCRIPTION_FORM.unsubscribeActionURL} method="post">
            <input className="auth-button" type="submit" value="Unsubscribe"/>
            <input type="hidden" name="mauticform[email]" value={userEmail}></input>
            <input type="hidden" name="mauticform[formId]" value={getformID(SUBSCRIPTION_FORM.unsubscribeActionURL)}></input>
            <input type="hidden" name="mauticform[return]" value=""></input>
            <input type="hidden" name="mauticform[formName]" value={SUBSCRIPTION_FORM.unsubscribeFormName}></input>
          </form>
        </div>
      </ModalFooter>
    </Modal>
  );

};



export default Subscription;
