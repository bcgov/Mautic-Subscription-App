import React, { useEffect, useState } from 'react';
import { APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
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
  const [ httpError, sethttpError] = useState(null);


  const getformID = ( actionLink ) => {
    return actionLink.charAt(actionLink.length-1)
  }

  useEffect(() => {
    const fetchSegments = async () => {
      if (config) {
        try {
          const segmentResponse = await axios.get(`${config.backendURL}segments`, {
              headers: {
                'Content-Type': "application/json",
                'Authorization': `bearer ${userToken}`
              }
            });
          
          setSegments(segmentResponse.data);
          sethttpError(false);
        } catch(error) {
          if (error.response) {
            // client received error response (5xx, 4xx)
            sethttpError(`Unable to fetch segments: ${error.response.data}`);
    
          } else if (error.request) {
            // The request was made but no response was received
            sethttpError("Unable to fetch segments")
    
          } else {
            // Something happened in setting up the request and triggered an Error
            sethttpError(`Unable to fetch segments: ${error.message}`);
        }
        }
        
      }
    };

    fetchSegments();
  }, [config]);
  
  if (httpError) {
    return (
      <div>
        <p>{httpError}</p>
      </div>
    )
  }
  else {
  return (
    <div>
      <h1>Welcome to the {APP_INFO.DISPLAY_NAME}</h1>

            {/* To be modified to display segments in a selectable list format */}
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
            ): <div>loading segments...</div>
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
  }
};



export default Subscription;