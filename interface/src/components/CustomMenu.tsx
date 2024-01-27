import { MenuProps, Menu } from "@mui/material";
import { theme } from "../theme/theme";

const CustomMenu = ({children, ...props}:MenuProps) => (
  <Menu
    sx={{
      py: 0,
      '& .MuiMenu-paper': {
        bgcolor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        border: '1px solid #fff',
        borderRadius: 4
      },
    }}
    {...props}
  >
    {children}
  </Menu>
);

export default CustomMenu;