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
import { useCallback, useEffect, useState } from "react";
import { UserToken, setUserSongs } from "../redux/userSlice";
import { useDispatch } from "react-redux";

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
  const { user, UserMenu, handleOpenUserMenu, setTokenExpired, tokenExpired } = useUser();
  const [token, setToken] = useState<UserToken | null>(null);

  const apiCall = useCallback(async ({ uri, method, payload, config, onSuccess, onError, sendAuth = true }:ApiCallProps) => {
    let callFunction: typeof axios.post | typeof axios.get;

    if (sendAuth && !user?.token) {
      // console.error(`Token is required for ${method.toUpperCase()} ${uri}`);
      return;
    }

    let useConfig = config;

    if (!sendAuth) {
      const { headers, ...rest } = config || {};
      useConfig = rest;
      console.log('useConfig', useConfig);
    } else {
      console.log('useConfig', useConfig);
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
        (callFunction as typeof axios.post)(`${uri}`, payload, useConfig)
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
        (callFunction as typeof axios.get)(`${uri}`, useConfig)
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
  }, [user?.token]);

  const apiGet = useCallback(async ({ uri, config, onSuccess, onError, sendAuth = true }:ApiMethodCallProps) => {
    await apiCall({ uri, method: 'get', config, onSuccess, onError, sendAuth });
  }, [apiCall]);
  
  const apiDelete = useCallback(async ({ uri, config, onSuccess, onError, sendAuth = true }:ApiMethodCallProps) => {
    await apiCall({ uri, method: 'delete', config, onSuccess, onError, sendAuth });
  }, [apiCall]);

  const apiPost = useCallback(async ({ uri, payload, onSuccess, onError, sendAuth = true }:ApiMethodCallProps) => {
    await apiCall({ uri, method: 'post', payload, onSuccess, onError, sendAuth });
  }, [apiCall]);

  const apiPut = useCallback(async ({ uri, payload, onSuccess, onError, sendAuth = true }:ApiMethodCallProps) => {
    await apiCall({ uri, method: 'put', payload, onSuccess, onError, sendAuth });
  }, [apiCall]);

  const dispatch = useDispatch();

  // When user logs in, set the token and fetch user song data
  useEffect(() => {
    if (user?.token && user.token.access !== token?.access) {
      setToken(user?.token);

      apiGet({
        uri: '/user/songs',
        onSuccess: (res) => {
          dispatch(setUserSongs(res.data));
        },
        onError: (err) => {
          console.error('Error getting user data:', err);
        }
      });
    }
  }, [user.token, token?.access, apiGet, dispatch]);

  return { apiCall, apiGet, apiPost, apiPut, apiDelete, user, UserMenu, handleOpenUserMenu, setTokenExpired, tokenExpired };
};

export default useApi;