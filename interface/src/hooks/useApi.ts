// useApi.ts

/*
  Custom hook to make API calls using Axios
  - Automatically handles token refresh
  - Automatically handles authentication
  - Automatically handles error responses
  - Automatically handles success responses
*/

import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import useUser from "./useUser";
import axios from "../axiosWithIntercept";
import { useEffect } from "react";

export type ApiMethodCallProps = {
  uri: string;
  payload?: any;
  onSuccess?: (res:AxiosResponse) => void;
  onError?: (err:AxiosError) => void;
  sendAuth?: boolean;
  config?: AxiosRequestConfig;
};

export type ApiCallProps = {
  method: 'get' | 'post' | 'put' | 'delete';
} & ApiMethodCallProps;

const useApi = () => {
  const { user } = useUser();

  useEffect(() => {
    apiGet({
      uri: '/user/songs',
      onSuccess: (res) => {
        console.log('Songs:', res.data);
      },
      onError: (err) => {
        console.error('Error getting user data:', err);
      }
    });
  }, [user.token]);

  const apiCall = ({ uri, method, payload, config, onSuccess, onError, sendAuth = true }:ApiCallProps) => {
    let callFunction: typeof axios.post | typeof axios.get;

    if (sendAuth && !user?.token) {
      console.error(`Token is required for ${method.toUpperCase()} ${uri}`);
      return;
    }
    switch (method) {
      case 'get':
        callFunction = axios.get;
        break;
      case 'post':
        callFunction = axios.post;
        break;
      case 'put':
        callFunction = axios.put;
        break;
      case 'delete':
        callFunction = axios.delete;
        break;
    }

    switch (method) {
      case 'post':
      case 'put':
        (callFunction as typeof axios.post)(`${uri}`, payload, config)
          .then(res => {
            if (res?.data) {
              onSuccess && onSuccess(res);
            }
          })
          .catch(error => {
            console.error('API call error:', error);
            onError && onError(error);
          });

          break;
      
      case 'get':
      case 'delete':
        (callFunction as typeof axios.get)(`${uri}`, config)
          .then(res => {
            if (res?.data) {
              onSuccess && onSuccess(res);
            }
          })
          .catch(error => {
            console.error('API call error:', error);
            onError && onError(error);
          });

          break;
    }
  }

  const apiGet = ({ uri, config, onSuccess, onError, sendAuth = true }:ApiMethodCallProps) => {
    apiCall({ uri, method: 'get', config, onSuccess, onError, sendAuth });
  }
  
  const apiDelete = ({ uri, config, onSuccess, onError, sendAuth = true }:ApiMethodCallProps) => {
    apiCall({ uri, method: 'delete', config, onSuccess, onError, sendAuth });
  }

  const apiPost = ({ uri, payload, onSuccess, onError, sendAuth = true }:ApiMethodCallProps) => {
    apiCall({ uri, method: 'post', payload, onSuccess, onError, sendAuth });
  }

  const apiPut = ({ uri, payload, onSuccess, onError, sendAuth = true }:ApiMethodCallProps) => {
    apiCall({ uri, method: 'put', payload, onSuccess, onError, sendAuth });
  }

  return { apiCall, apiGet, apiPost, apiPut, apiDelete, user };
};

export default useApi;