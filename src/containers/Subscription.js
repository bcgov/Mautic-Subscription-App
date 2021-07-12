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
  const [ segments, setSegments ] = useState(null);
  const [ httpError, sethttpError] = useState(null);
  const [ checkboxes, setCheckboxes] = useState(null);
  const [ selectAll, setSelectAll] = useState(false);

  const selectAllCheckboxes = () => {
    
    const updatedCheckedboxes = checkboxes.map(
      x => [!selectAll, x[1]]
    )

    setCheckboxes(updatedCheckedboxes)
    setSelectAll(!selectAll)
  }

  const createCheckboxes = () => {
      return (
        <div >
          <div className="checkboxContent">
            <input type ="checkbox" id="select_all" onChange={() => selectAllCheckboxes(true)}/>
            <label htmlFor="select_all">
              Select all
            </label>
          </div>

          <div className="checkboxContent">
            {segments.map((contents, x) => (
                <div key={contents.SegmentID} className="checkboxContent"> 
                  <input type ="checkbox" id ={contents.SegmentID} checked={checkboxes[x][0]} onChange={() => handleCheckbox(x)}/>
                    <label htmlFor={contents.SegmentID}>
                      {contents.SegmentName}, ischecked={String(checkboxes[x])}
                    </label>
                </div>
            ))}
          </div>
        </div>
      )
  }

  const handleCheckbox = (updateIndex) => {
    const updatedCheckedboxes = [...checkboxes]
    updatedCheckedboxes[updateIndex][0] = !updatedCheckedboxes[updateIndex][0]

    setCheckboxes(updatedCheckedboxes)
  }

  // Fetch segments when config file is loaded/changed
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
          
          // store segments in lexicographic order
          setSegments(segmentResponse.data.sort((segmentA, segmentB) => segmentA.SegmentName.localeCompare(segmentB.SegmentName)));
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
  
  // Set checkboxes when segments are fetched
  useEffect(() => {
    if (segments){
      const initializeCheckedboxes = segments.map((contents) => (
          [false, contents.SegmentID]
      ))
      setCheckboxes(initializeCheckedboxes)
    }
  }, [segments]);

  
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
   
        {segments && checkboxes ? (
          <div className="checkboxContainer">{createCheckboxes()}</div>
        ) : (
          <div>loading segments...</div>
        )}
          
      </div>         
    </div>
  );
  }
};



export default Subscription;