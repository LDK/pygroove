import LoginIcon from '@mui/icons-material/AccountCircleOutlined';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import { AppBar, Grid, Typography, Box, useTheme, Button } from "@mui/material";
import { useState } from "react";
import LoginRegisterDialog from "./components/LoginRegisterDialog";
import useUser from "./hooks/useUser";
import { clearSong } from './redux/songSlice';
import { useDispatch } from 'react-redux';

const Header = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, UserMenu, handleOpenUserMenu } = useUser();
  
  const theme = useTheme();
  const dispatch = useDispatch();

  return (
  <AppBar position="static" sx={{ pt: 2, pb: 3, px: 4, bgcolor: theme.palette.primary.dark }}>
    <Grid container>
      <Grid item xs={4}>
        <Typography variant="h4" align="left" sx={{ color: theme.palette.primary.contrastText }}>
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
    {!user.id && <LoginRegisterDialog open={loginOpen} onClose={() => setLoginOpen(false)} />}

  </AppBar>);
};

export default Header;