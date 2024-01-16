import LoginIcon from '@mui/icons-material/AccountCircleOutlined';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import { AppBar, Grid, Typography, Box, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import LoginRegisterDialog from "./dialogs/LoginRegisterDialog";
import { useDispatch } from 'react-redux';
import { UserState, clearUser } from './redux/userSlice';
import SongManagement from './components/SongManagement';
import { TextLink, dot } from './components/PatternManagement';
import NewSongDialog from './dialogs/NewSongDialog';
import SaveSongDialog from './dialogs/SaveSongDialog';

interface HeaderProps {
  user: UserState,
  UserMenu: React.FC<any>,
  tokenExpired: boolean,
  setTokenExpired: (arg:boolean) => void,
  handleOpenUserMenu: (event:React.MouseEvent) => void,
};

const Header = ({ user, tokenExpired, setTokenExpired, handleOpenUserMenu, UserMenu }:HeaderProps) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [songListOpen, setSongListOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);

  const theme = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    if (tokenExpired) {
      setLoginOpen(true);
      dispatch(clearUser());
      setTokenExpired(false);
    }
  }, [tokenExpired, dispatch, setTokenExpired]);

  return (
  <AppBar position="static" sx={{ pt: 1, pb: 2, px: 4, bgcolor: theme.palette.primary.dark }}>
    <Grid container>
      <Grid item xs={4}>
        <Typography variant="h5" align="left" sx={{ color: theme.palette.primary.contrastText }}>
          pyGroove
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Box sx={{ float: 'right' }} pt={0}>
          {Boolean(user.id) && (
            <Box p={0} m={0} mr={2} display="inline-block" px={2} py={1}>
              <TextLink text="New Song" variant="subtitle1" color="white" onClick={() => { setNewOpen(true); }} />  
              {dot}
              <TextLink text="Save Song" variant="subtitle1" color="white" onClick={() => { setSaveOpen(true) }} />
              {dot}
              <TextLink text="Explore Songs" variant="subtitle1" color="white" onClick={() => { setSongListOpen(true); }} />
            </Box>
          )}
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
    {(user.id && !tokenExpired) && <SongManagement open={songListOpen} onClose={() => { setSongListOpen(false); }} />}

    <NewSongDialog open={newOpen} onClose={() => { setNewOpen(false); }} />
    <SaveSongDialog open={saveOpen} onClose={() => { setSaveOpen(false); }} />

  </AppBar>);
};

export default Header;