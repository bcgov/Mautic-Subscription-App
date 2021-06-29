import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { APP_INFO, SUBSCRIPTION_FORM } from '../constants';
import '../components/Auth/AuthModal.css';
import Banner from '../components/UI/Banner';
import { useKeycloak } from '@react-keycloak/web';
import { useConfig } from '../hooks/useConfig';
import axios from 'axios';

export const Subscription = () => {
  const { keycloak } = useKeycloak();
  const config = useConfig('/config/form.json');
  const userEmail = keycloak.idTokenParsed.email; 
  const userName = keycloak.idTokenParsed.given_name;
  const userToken = keycloak.token;
  const [ segments, setSegments ] = useState(null);

  const getformID = ( actionLink ) => {
    return actionLink.charAt(actionLink.length-1)
  }

  useEffect(() => {
    const fetchSegments = async () => {
      const result = await axios(
        'https://mautic-theme-de0974-dev.apps.silver.devops.gov.bc.ca/api/segments',
      );
      setSegments(result.data);
    };

    fetchSegments();
  }, []);
  console.log(segments)
  return (

    <div>
      <h1>Welcome to the {APP_INFO.DISPLAY_NAME}</h1>
      
            {segments ?
            
            (<div>
            
              {
                segments.map(
                  (contents, x) => (
                    <div key={x}> {contents.SegmentName} </div>
                  )
                )
              }
            
            </div>
            ): <div>loading...</div>
            }
        
      <div>
        
        <p>
          Hello {userName}, subscribe/unsubscribe from the {APP_INFO.NAME}.
          <br />
          Your email address is {userEmail}.
        </p>
        {config ? (
          <div className="auth-buttons">
            <div className="subscription-buttons">
              <div className="subscription-buttons-spacer">
                <form action={config.subscribeActionURL} method="post">
                  <input className="auth-button" type="submit" value="Subscribe"/>
                  <input type="hidden" name="mauticform[email]" value={userEmail}></input>
                  <input type="hidden" name="mauticform[formId]" value={getformID(config.subscribeActionURL)}></input>
                  <input type="hidden" name="mauticform[return]" value=""></input>
                  <input type="hidden" name="mauticform[formName]" value={config.subscribeFormName}></input>
                </form>
              </div>
              <div className="subscription-buttons-spacer">
                <form action={config.unsubscribeActionURL} method="post">
                  <input className="auth-button" type="submit" value="Unsubscribe"/>
                  <input type="hidden" name="mauticform[email]" value={userEmail}></input>
                  <input type="hidden" name="mauticform[formId]" value={getformID(config.unsubscribeActionURL)}></input>
                  <input type="hidden" name="mauticform[return]" value=""></input>
                  <input type="hidden" name="mauticform[formName]" value={config.unsubscribeFormName}></input>
                </form>
              </div>
            </div>
          </div>
          ): <div>loading...</div>
        }
      </div>         
    </div>
  );

};



export default Subscription;