import { Menu, Typography, Divider, MenuItem, useTheme } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, getActiveUser } from "../redux/userSlice";

export default function useUser () {
  const user = useSelector(getActiveUser);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null);

  const handleOpenUserMenu = (event:React.MouseEvent) => {
    setAnchorElUser(event.currentTarget as HTMLElement);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(clearUser());
    handleCloseUserMenu();
  }

  const UserMenu:React.FC<any> = () => {
    
    const handleSettings = () => {
      handleCloseUserMenu();
    }
  
    if (!user.id) return null;

    console.log('user', user, anchorElUser);

    return (
      <Menu
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        sx={{
          display: { xs: 'block' },
          py: 0
        }}
      >
        <Typography variant="body2" sx={{ px: 2, py: 1, color: theme.palette.text.primary }}>Hello {user.username}!</Typography>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout}>Sign out</MenuItem>
        <MenuItem onClick={handleSettings}>User Settings</MenuItem>
      </Menu>
    )
  };

  return { user, UserMenu, handleOpenUserMenu, handleCloseUserMenu, handleLogout };
}

