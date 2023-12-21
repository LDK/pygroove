// axios.ts
import axios from "axios";
import { UserToken } from "./redux/userSlice";
import exp from "constants";

const axiosWithIntercept = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

let userToken:(UserToken | null) = null;
let tokenCallback:((token:UserToken) => void) | null = null;
let expiredCallback:(() => void) | null = null;
let refreshCallback:(() => void) | null = null;

export const updateAxiosToken = (token:(UserToken | null)) => {
  userToken = token;

  if (!token) {
    delete axiosWithIntercept.defaults.headers.common['Authorization'];
    return;
  }

  axiosWithIntercept.defaults.headers.common['Authorization'] = `Bearer ${token.access}`;
}

export const setAxiosTokenCallback = (callback:(token:UserToken) => void) => {
  tokenCallback = callback;
}

export const setAxiosRefreshExpiredCallback = (callback:() => void) => {
  expiredCallback = callback;
}

export const setAxiosRefreshCallback = (callback:() => void) => {
  refreshCallback = callback;
}

axiosWithIntercept.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && error.response.data.code === 'token_not_valid' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!userToken) { 
          return Promise.reject(error);
        }

        const res = await axiosWithIntercept.post(`/token/refresh/`, { ...userToken });
        if (res.status === 200) {
          updateAxiosToken({ refresh: userToken.refresh, access: res.data.access } as UserToken);
          tokenCallback?.({ refresh: userToken.refresh, access: res.data.access } as UserToken);
          refreshCallback?.();
          axiosWithIntercept.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.access;
          const retryRequest = { ...originalRequest, headers: {...originalRequest.headers, 'Authorization': 'Bearer ' + res.data.access } };
          return axiosWithIntercept(retryRequest);
        }
      } catch (refreshError) {
        console.error('Refresh token expired or invalid', refreshError);
        // Handle logout or token refresh failure
      }
    }
    return Promise.reject(error);
  }
);

export default axiosWithIntercept;
