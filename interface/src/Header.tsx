import LoginIcon from '@mui/icons-material/AccountCircleOutlined';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import MenuArrow from '@mui/icons-material/ArrowDropDownTwoTone';
import { AppBar, Grid, Typography, Box, useTheme, MenuItem, Divider } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import LoginRegisterDialog from "./dialogs/LoginRegisterDialog";
import { useDispatch, useSelector } from 'react-redux';
import { UserState, clearUser } from './redux/userSlice';
import SongManagement from './components/SongManagement';
import NewSongDialog from './dialogs/NewSongDialog';
import SaveSongDialog from './dialogs/SaveSongDialog';
import Menu from './components/CustomMenu';
import RenderDialog from './dialogs/RenderDialog';
import { SongState, getActiveSong, setActiveSong } from './redux/songSlice';

interface HeaderProps {
  user: UserState,
  UserMenu: React.FC<any>,
  tokenExpired: boolean,
  setTokenExpired: (arg:boolean) => void,
  handleOpenUserMenu: (event:React.MouseEvent) => void,
};

export const exportSongToJson = (song: SongState, fileName:string) => {
  // Add the .json extension if it's not already present
  if (!fileName.endsWith('.json')) {
    fileName += '.json';
  }

  const { id, selectedPatternPosition, loading, ...songData } = song;

  // Convert the project data object into a JSON-formatted string
  const jsonString = JSON.stringify(songData, null, 2);

  // Create a new Blob object containing the JSON string, with the MIME type set to 'application/json'
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create a new URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create and configure a temporary anchor element to initiate the download
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;

  // Add the anchor to the document, initiate the download, and remove the anchor
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
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
  
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const handleOpenSongMenu = (event:React.MouseEvent) => {
    setAnchorElSong(event.currentTarget as HTMLElement);
  };

  const handleCloseSongMenu = () => {
    setAnchorElSong(null);
  };

  const importSongFromJson = (file:File) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result;

        if (typeof content === 'string') {
          const songData:SongState = JSON.parse(content);

          if (songData) {
            dispatch(setActiveSong(songData));
          }
        }
      } catch (error) {

      }
    };
    reader.readAsText(file);
  };
  
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target ? event.target.files?.[0] : null;
  
    if (!file) return;
  
    switch (file.type) {
      case 'application/json':
        importSongFromJson(file);
      break;
    }

    // Reset the file input value so the same file can be imported again if needed
    if (event.target) {
      event.target.value = '';
    }

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
      {user.token && [
        <MenuItem onClick={() => { setNewOpen(true); handleCloseSongMenu(); }}>New Song</MenuItem>,
        <MenuItem onClick={() => { setSaveOpen(true); handleCloseSongMenu(); }}>Save Song</MenuItem>,
        <MenuItem onClick={() => { setSongListOpen(true); handleCloseSongMenu(); }}>Explore Songs</MenuItem>,
        <Divider sx={{ my: 1, backgroundColor: 'white' }} />
      ]}
      <MenuItem onClick={() => { setRendering(true); handleCloseSongMenu(); }}>Render to MP3</MenuItem>
      <MenuItem onClick={() => { exportSongToJson(activeSong, activeSong.title) }}>Export to JSON</MenuItem>
      <MenuItem onClick={() => { fileInputRef?.click() }}>Import from JSON</MenuItem>
      {
        !user.token && [
          <Divider sx={{ my: 1, backgroundColor: 'white' }} />,
          <MenuItem onClick={() => { setLoginOpen(true); handleCloseSongMenu(); }}>
            <Typography variant="caption" fontWeight={600}>Log In or Register to save your songs!</Typography></MenuItem>
        ]
      }
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
    <input type="file" accept=".zip, .json" ref={setFileInputRef} onChange={handleUpload} style={{ display: 'none' }} />

  </AppBar>);
};

export default Header;