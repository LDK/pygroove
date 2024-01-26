import LoginIcon from '@mui/icons-material/AccountCircleOutlined';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import MenuArrow from '@mui/icons-material/ArrowDropDownTwoTone';
import { AppBar, Grid, Typography, Box, useTheme, MenuItem } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import LoginRegisterDialog from "./dialogs/LoginRegisterDialog";
import { useDispatch, useSelector } from 'react-redux';
import { UserState, clearUser } from './redux/userSlice';
import SongManagement from './components/SongManagement';
import NewSongDialog from './dialogs/NewSongDialog';
import SaveSongDialog from './dialogs/SaveSongDialog';
import Menu from './components/CustomMenu';
import RenderDialog from './dialogs/RenderDialog';
import { getActiveSong } from './redux/songSlice';

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
  const [rendering, setRendering] = useState<boolean>(false);
  
  const [anchorElSong, setAnchorElSong] = useState<HTMLElement | null>(null);

  const theme = useTheme();
  const dispatch = useDispatch();

  const activeSong = useSelector(getActiveSong);
  
  const handleOpenSongMenu = (event:React.MouseEvent) => {
    setAnchorElSong(event.currentTarget as HTMLElement);
  };

  const handleCloseSongMenu = () => {
    setAnchorElSong(null);
  };

  const SongMenu = useCallback(() => (
    <Menu
      id="header-song-menu"
      open={Boolean(anchorElSong)}
      anchorEl={anchorElSong}
      onClose={handleCloseSongMenu}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {user.token && <>
        <MenuItem onClick={() => { setNewOpen(true); handleCloseSongMenu(); }}>New Song</MenuItem>
        <MenuItem onClick={() => { setSaveOpen(true); handleCloseSongMenu(); }}>Save Song</MenuItem>
        <MenuItem onClick={() => { setSongListOpen(true); handleCloseSongMenu(); }}>Explore Songs</MenuItem>
      </>}
      <MenuItem onClick={() => { setRendering(true); handleCloseSongMenu(); }}>Render to MP3</MenuItem>
    </Menu>
  ), [anchorElSong, user.token]);

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
          <Box p={0} m={0} onClick={handleOpenSongMenu} display="inline-block" px={2} py={1} sx={{ cursor: 'pointer' }}>
            <Typography variant="subtitle1" color="white" fontWeight={600}>
              Song <MenuArrow sx={{ position: 'relative', top: 6 }} />
            </Typography>
          </Box>
          {Boolean(user.id) ?
            <ProfileIcon color="action" sx={{ cursor: 'pointer', float: 'right', fontSize: '3rem' }}
              onClick={handleOpenUserMenu} /> :
            <LoginIcon color="action" sx={{ cursor: 'pointer', float: 'right', fontSize: '3rem' }}
              onClick={() => setLoginOpen(true)} />}

        </Box>
      </Grid>
    </Grid>
    <UserMenu />
    <SongMenu />
    {(!user.id || tokenExpired) && <LoginRegisterDialog open={loginOpen || tokenExpired} onClose={() => { setLoginOpen(false); setTokenExpired(false); }} />}
    {(user.id && !tokenExpired) && <SongManagement open={songListOpen} onClose={() => { setSongListOpen(false); }} />}

    <NewSongDialog open={newOpen} onClose={() => { setNewOpen(false); }} />
    <SaveSongDialog open={saveOpen} onClose={() => { setSaveOpen(false); }} />
    <RenderDialog open={rendering} onClose={() => { setRendering(false); }} song={activeSong} />

  </AppBar>);
};

export default Header;