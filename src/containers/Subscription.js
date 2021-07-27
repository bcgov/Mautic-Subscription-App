import React, { useEffect, useState } from 'react';
import { APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
import { useKeycloak } from '@react-keycloak/web';
import { useConfig } from '../hooks/useConfig';
import axios from 'axios';
import './Subscription.css';

export const Subscription = () => {
  const { keycloak } = useKeycloak();
  const config = useConfig('/config/form.json');
  const userEmail = keycloak.idTokenParsed.email; 
  const userName = keycloak.idTokenParsed.given_name;
  const userToken = keycloak.token;
  // segments is an array of objects {isChecked, segmentID, segmentName}
  const [ segments, setSegments ] = useState(null);
  const [ httpError, sethttpError] = useState(null);
  const [ selectAll, setSelectAll] = useState(false);
  const [ contactId, setContactId] = useState(null);

  const toggleCheckboxes = () => {
    const toggledCheckedboxes = segments.map(({isChecked, ...others}) => ( { ...others, "isChecked": !selectAll } ));

    setSegments(toggledCheckedboxes)
    setSelectAll(!selectAll)
  }

  const createCheckboxes = () => {
      return (
        <div >
          <div className="checkboxContent">
            <input className="checkboxContent" type ="checkbox" id="select_all" onChange={() => toggleCheckboxes()}/>
            <label htmlFor="select_all" className="segmentNames">
              Select all
            </label>
          </div>

          <div className="checkboxContent">
            {segments.map((contents, x) => (
                <div key={contents.segmentID} className="checkboxContent"> 
                  <input type ="checkbox" id ={contents.segmentID} checked={contents.isChecked} onChange={() => handleCheckbox(x)}/>
                    <label htmlFor={contents.segmentID} className="segmentNames">
                      {contents.segmentName}
                    </label>
                </div>
            ))}
          </div>
        </div>
      )
  }

  const handleCheckbox = (updateIndex) => {
    const updatedSegments = [...segments]
    updatedSegments[updateIndex].isChecked = !updatedSegments[updateIndex].isChecked

    setSegments(updatedSegments)
  }

  const postSegments = async () => {
    if (segments && contactId) {
      try {
        await axios.post(`${config.backendURL}/segments/contact/add`,
          {
            ContactId: contactId,
            SegmentsAndIds: segments,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `bearer ${userToken}`,
            },
          }
        );
        
        sethttpError(false);
      } catch(error) {
        if (error.response) {
          // client received error response (5xx, 4xx)
          sethttpError(`Unable to post segments: ${error.response.data}`);
  
        } else if (error.request) {
          // The request was made but no response was received
          sethttpError("Unable to post segments")
  
        } else {
          // Something happened in setting up the request and triggered an Error
          sethttpError(`Unable to post segments: ${error.message}`);
        }
      }
      
    }
  };

  // Fetch segments when config file is loaded/changed
  useEffect(() => {
    const fetchSegments = async () => {
      if (config) {
        try {
          const segmentResponse = await axios.get(`${config.backendURL}/segments`, {
              headers: {
                'Content-Type': "application/json",
                'Authorization': `bearer ${userToken}`,
                'Email': `${userEmail}`
              }
            });
          
          // store segments in lexicographic order
          const segmentData = segmentResponse.data
          
          setContactId(segmentData.contactId)
          
          const segmentObjects = segmentData.segmentsAndIds.map((contents) => ({
            isChecked: contents.IsChecked,
            segmentID: contents.SegmentID,
            segmentName: contents.SegmentName
          }));
          
          setSegments(segmentObjects.sort((segmentA, segmentB) => segmentA.segmentName.localeCompare(segmentB.segmentName)));
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

    if (!segments) {
      fetchSegments();
    }
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
      <div>
        <p>
          Hello {userName}, subscribe/unsubscribe from the {APP_INFO.NAME}.
          <br />
          Your email address is {userEmail}.
        </p>
   
        {segments ? (
          <div>
            <div className="checkboxContainer">{createCheckboxes()}</div>
            <div className="auth-buttons">
              <form action="/subscribed"  onSubmit={postSegments}>
                <button className="auth-button" type="submit">Submit</button>
              </form>
            </div>
          </div>    
        ) : (
          <div>loading segments...</div>
        )}
          
      </div>     
    </div>
  );
  }
};



export default Subscription;