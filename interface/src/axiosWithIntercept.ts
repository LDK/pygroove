// axiosWithIntercept.ts
import axios from "axios";
import { UserToken } from "./redux/userSlice";

const axiosWithIntercept = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

let userToken: (UserToken | null) = null;
let tokenCallback: ((token: UserToken) => void) | null = null;
let expiredCallback: (() => void) | null = null;
let refreshCallback: (() => void) | null = null;

export const updateAxiosToken = (token: (UserToken | null)) => {
  userToken = token;
  
  if (!token) {
    delete axiosWithIntercept.defaults.headers.common['Authorization'];
    return;
  }

  axiosWithIntercept.defaults.headers.common['Authorization'] = `Bearer ${token.access}`;
}

export const setAxiosTokenCallback = (callback: (token: UserToken) => void) => {
  tokenCallback = callback;
}

export const setAxiosRefreshExpiredCallback = (callback: () => void) => {
  expiredCallback = callback;
}

export const setAxiosRefreshCallback = (callback: () => void) => {
  refreshCallback = callback;
}

let isRefreshingToken = false;

axiosWithIntercept.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && error.response.data.code === 'token_not_valid' && !isRefreshingToken) {
      isRefreshingToken = true;

      try {
        if (!userToken) { 
          expiredCallback?.();
          isRefreshingToken = false;
          return Promise.reject(error);
        }

        const res = await axiosWithIntercept.post(`/token/refresh/`, { refresh: userToken.refresh });

        if (res.status === 200) {
          updateAxiosToken({ refresh: userToken.refresh, access: res.data.access } as UserToken);
          tokenCallback?.({ refresh: userToken.refresh, access: res.data.access } as UserToken);
          refreshCallback?.();

          axiosWithIntercept.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.access;
          originalRequest.headers['Authorization'] = 'Bearer ' + res.data.access;
          isRefreshingToken = false;
          return axiosWithIntercept(originalRequest);
        }
      } catch (refreshError) {
        expiredCallback?.();
        isRefreshingToken = false;
        return Promise.reject(refreshError);
      }
    }

    isRefreshingToken = false;
    return Promise.reject(error);
  }
);

export default axiosWithIntercept;
