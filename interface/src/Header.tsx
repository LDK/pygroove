import LoginIcon from '@mui/icons-material/AccountCircleOutlined';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import { AppBar, Grid, Typography, Box, useTheme, Button } from "@mui/material";
import { useEffect, useState } from "react";
import LoginRegisterDialog from "./components/LoginRegisterDialog";
import { clearSong } from './redux/songSlice';
import { useDispatch } from 'react-redux';
import { UserState, clearUser } from './redux/userSlice';

interface HeaderProps {
  user: UserState,
  UserMenu: React.FC<any>,
  tokenExpired: boolean,
  setTokenExpired: (arg:boolean) => void,
  handleOpenUserMenu: (event:React.MouseEvent) => void,
};

const Header = ({ user, tokenExpired, setTokenExpired, handleOpenUserMenu, UserMenu }:HeaderProps) => {
  const [loginOpen, setLoginOpen] = useState(false);

  const theme = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    if (tokenExpired) {
      console.log('tokenExpired useEffect 2');
      setLoginOpen(true);
      dispatch(clearUser());
      setTokenExpired(false);
    }
  }, [tokenExpired]);

  return (
  <AppBar position="static" sx={{ pt: 1, pb: 2, px: 4, bgcolor: theme.palette.primary.dark }}>
    <Grid container>
      <Grid item xs={4}>
        <Typography variant="h5" align="left" sx={{ color: theme.palette.primary.contrastText }}>
          pyGroove
        </Typography>
        <Button onClick={() => { dispatch(clearSong()); }} variant="contained" color="secondary" sx={{ mt: 2, textWrap: 'nowrap', width: '80px', overflowX: 'ellipsis' }}>
          Clear
        </Button>
      </Grid>
      <Grid item xs={8}>
        <Box sx={{ float: 'right' }}>
          [Song Selector]
          {Boolean(user.id) ?
            <ProfileIcon color="action" sx={{ cursor: 'pointer', float: 'right', fontSize: '3rem' }}
              onClick={handleOpenUserMenu} /> :
            <LoginIcon color="action" sx={{ cursor: 'pointer', float: 'right', fontSize: '3rem' }}
              onClick={() => setLoginOpen(true)} />}

        </Box>
      </Grid>
    </Grid>
    <UserMenu />
    {(!user.id || tokenExpired) && <LoginRegisterDialog open={loginOpen || tokenExpired} onClose={() => { setLoginOpen(false); setTokenExpired(false); }} />}

  </AppBar>);
};

export default Header;