// Header/LoginRegisterDialog.tsx
import React, { useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Divider, Grid, Tabs, Tab } from '@mui/material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';

type LoginRegisterDialogProps = {
  open: boolean;
  onClose: () => void;
};

console.log('process.env', process.env);

const apiUrl = process.env.REACT_APP_API_URL;

const LoginRegisterDialog: React.FC<LoginRegisterDialogProps> = ({ open, onClose }) => {
  type TabState = 'Login' | 'Register';

  const dispatch = useDispatch();

  const [tab, setTab] = useState<TabState>('Login');
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [loginData, setLoginData] = useState({username: '', password: ''});
  const [registerData, setRegisterData] = useState({username: '', email: '', password: '', confirmPassword: ''});
  const [loading, setLoading] = useState(false);

  const tabStates:TabState[] = ['Login', 'Register'];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(tabStates[newValue]);
    setTabIndex(newValue);
  };

  const handleLogin = (data: typeof loginData) => {
    setLoading(true);
    setLoginData(data);

    axios.post(`${apiUrl}/login/`, data).then(res => {
      setLoading(false);

      if (res.status === 200 && res.data && res.data.id) {
        dispatch(setUser({
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          token: res.data.token.access
        }));
        onClose();
      }
    })
    .catch((err) => {
      setLoading(false);
      console.log(err);
    })
  };

  const handleRegister = (data: typeof registerData) => {
    setLoading(true);
    setRegisterData(data);

    axios.post(`${apiUrl}/register/`, data).then(res => {
      setLoading(false);

      console.log('registered', res);

      if (res.status === 201 && res.data && res.data.id) {
        dispatch(setUser({
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          token: res.data.token.access
        }));
        onClose();
      }
    })
    .catch((err) => {
      setLoading(false);
      console.log(err);
    })
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={'sm'}>
      <DialogTitle>Log in or Register</DialogTitle>

      <Divider />

      <DialogContent sx={{ height: '65vh' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="secondary" variant="fullWidth">
                <Tab label="Login" sx={tabIndex === 0 ? { background: "rgba(80,197,220,.9)" } : {}} />
                <Tab label="Register" sx={tabIndex === 1 ? { background: "rgba(80,197,220,.9)" } : {}} />
              </Tabs>
            </Box>
            {tab === 'Login' && 
              <Box width="100%" pt={4} pb={2}>
                <LoginForm
                  onSubmit={data => {
                    handleLogin(data);
                  }}
                  username={true}
                  buttonVariant="contained"
                  inputVariant="filled"
                  loading={loading}
                />
              </Box>
            }
            {tab === 'Register' && 
              <Box width="100%" pt={4} pb={2} display="flex" flexDirection="column">
                <RegistrationForm 
                  onSubmit={data => {
                    handleRegister(data);
                  }}
                  email={true}
                  username={true}
                  confirmPassword={true}
                  inputVariant="filled"
                  onCancel={handleClose}
                  loading={loading}
                />
              </Box>
            }
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default LoginRegisterDialog;
