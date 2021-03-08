import { useEffect, useState } from 'react';


const fetch = (path, method = 'GET') => {
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, path);
    xhr.onload = () => {
      if(xhr.status === 200) {
        resolve({status: xhr.status, body: xhr.response});
      } else {
        reject({status: xhr.status});
      }
    }
    xhr.onerror = () => reject({status: xhr.status});
    xhr.send();
  });

  return promise;
}
/**
 * react hook to get our app config from a static path
 */
export const useConfig = (filePath) => {
  const [ config, setConfig ] = useState(null);

  useEffect(() => {
    if(!config) {
      fetch(filePath).then(response => {
        console.log('start')
        setConfig(JSON.parse(response.body))
        console.log('end')
      });
    }
  }, [config])

  return config;
};