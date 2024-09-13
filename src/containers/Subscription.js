import React, { useEffect, useState } from 'react';
import { APP_INFO } from '../constants';
import '../components/Auth/AuthModal.css';
import { useKeycloak } from '@react-keycloak/web';
import { useConfig } from '../hooks/useConfig';
import axios from 'axios';
import './Subscription.css';
import { Redirect } from 'react-router';

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
  const [ submitButtonPressed, setSubmitButtonPressed] = useState(false);
  const [ redirect, setRedirect] = useState(null);

  const toggleCheckboxes = () => {
    const toggledCheckedboxes = segments.map(({isChecked, segmentName, ...others}) => {
      return { ...others, "isChecked": !selectAll, segmentName }; });
    setSegments(toggledCheckedboxes)
    setSelectAll(!selectAll)
  }

  const createCheckboxes = () => {
  
      return (
        <div >
          <div className="checkboxContent">
            <label className="checkbox" htmlFor="select_all">
              Select All
              <input type="checkbox" id="select_all" onChange={() => toggleCheckboxes()}/>
              <span className="checkmark"></span>
            </label>
       
             {/* {Other Segments} */}
            {segments.map((contents, x) => (
              <div key={contents.segmentID} className="checkboxContent">
                  <label className="checkbox" htmlFor={contents.segmentID}>
                    {contents.segmentName} {contents.description ? `- ${contents.description}` : ""}
                    <input type="checkbox" id={contents.segmentID} checked={contents.isChecked} onChange={() => handleCheckbox(x)}/><span className="checkmark"></span>
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

  const postSegments = async (event) => {
    event.preventDefault();
    setSubmitButtonPressed(true)

    if (segments && contactId) {
      try {
        //call backend api to update user segments
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
        setRedirect("/subscribe/success")

      } catch(error) {
        setRedirect("/subscribe/error")
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
          const errorMsg = "More than one contact associated with the email address."
          setContactId(segmentData.contactId)
          //check if response datatype is an object and will not return undefined
          if(segmentData.segmentsAndIds){
            const segmentObjects = segmentData.segmentsAndIds.map((contents) => ({
              isChecked: contents.IsChecked,
              segmentID: contents.SegmentID,
              segmentName: contents.SegmentName,
              description: contents.Description
            }));
            setSegments(segmentObjects.sort((segmentA, segmentB) => segmentA.segmentName.localeCompare(segmentB.segmentName)));
            sethttpError(false);
          }else if (segmentData.includes(errorMsg)){
            //mautic server allows multiple accounts to be associated with one email, need to return error if that's the case
            sethttpError(errorMsg)
          }
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


  if (submitButtonPressed) {
    if (redirect) {
      return <Redirect to={{
        pathname: redirect,
      }}/>
    }
    return (
      <div>
        <div className="bcgov-page-loader"></div>
        <div>Updating your subscription preferences... please wait</div>
      </div>
    )
  
  }



  if (httpError) {
    //return specific error message depending on the error
    if(httpError.includes("More than one contact associated with the email")){
      return (
        <div>
          <p>More than one contact associated with the email, please contact the Platform Services team to remove extraneous account(s).</p>
        </div>
      )
    }else{
      return (
        <div>
          <p>There was an unexpected error. Please try again in a few moments. If the error persists, please contact the Platform Services team for more information.</p>
        </div>
      )
    }

  }
  else {
  return (
    <div>
      <h1>Welcome to the {APP_INFO.DISPLAY_NAME}</h1>
      <div>
        <p className="displayMessage">
          Hello {userName}, select/unselect the checkboxes and click submit to
          update your subscription preferences.
          <br />
          Your email address is {userEmail}.
        </p>
        <div style="text-align: left">
          <b>To subscribe to: </b>
          <ul>
            <li>
              <b>
                Private Cloud updates 
                <a href="https://digital.gov.bc.ca/cloud/services/private/internal-resources/subscribe/">
                   sign up here
                </a>
              </b>
            </li>
            <li>
              <b>
                Public Cloud updates 
                <a href="https://digital.gov.bc.ca/cloud/services/public/internal-resources/subscribe/">
                   sign up here
                </a>
              </b>
            </li>
          </ul>
        </div>
        {segments ? (
          <div>
            <div className="checkboxContainer">{createCheckboxes()}</div>
            <div className="auth-buttons">
              <form onSubmit={postSegments}>
                <button className="auth-button" type="submit">
                  Submit
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <div className="bcgov-page-loader"></div>
            <div>Loading... please wait</div>
          </div>
        )}
      </div>
    </div>
  );
  }
};



export default Subscription;