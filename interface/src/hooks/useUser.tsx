import { Menu, Typography, Divider, MenuItem, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserToken, clearUser, getActiveUser, setUser } from "../redux/userSlice";
import { setAxiosTokenCallback, setAxiosRefreshExpiredCallback, updateAxiosToken } from "../axiosWithIntercept";

const useUser = () => {
  const user = useSelector(getActiveUser);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    // dispatch(setUser({ ...user, token }));
    setAxiosTokenCallback((token:UserToken) => 
      dispatch(setUser({ ...user, token }))
    );

    setAxiosRefreshExpiredCallback(() => {
      setTokenExpired(true);
    });

    updateAxiosToken(user.token);

  }, [user.token, dispatch, user]);

  const handleOpenUserMenu = (event:React.MouseEvent) => {
    setAnchorElUser(event.currentTarget as HTMLElement);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(clearUser());
    handleCloseUserMenu();
    setTokenExpired(false);
  }

  const UserMenu:React.FC<any> = () => {
    
    const handleSettings = () => {
      handleCloseUserMenu();
    }
  
    if (!user.id) return null;

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

  return { user, UserMenu, handleOpenUserMenu, handleCloseUserMenu, handleLogout, tokenExpired, setTokenExpired };
}

export default useUser;