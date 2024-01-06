// theme.tsx
import { createTheme, Palette, PaletteColor } from '@mui/material/styles';
import { ExtendedThemeOptions } from './ExtendedThemeOptions';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    hd: true;
  }
}

const baseThemeOptions:ExtendedThemeOptions = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          justifyContent: 'start',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          fontWeight: 600,
          fontSize: '.9rem',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      hd: 1800
    }
  },
  palette: {
    primary: {
      main: '#1976FF',
      light: '#85b6ff',
      contrastText: '#fff',
    },
    // something aquatic and greenish
    secondary: {
      main: '#306F6A',
      dark: '#3A4A3A',
      contrastText: '#fff',
    },
    // a neutral blue-green-grey
    info: {
      main: '#5C8D89',
      contrastText: '#fff',
    },
    tray: {
      main: "rgb(170 186 234 / 67%)",
    },
    // more yellow-orange than red-orange
    warning: {
      main: '#FFA500',
      contrastText: '#fff',
    },
  },
};

export const theme = createTheme({ ...baseThemeOptions});
export type ExtendedPalette = Palette & { tray: PaletteColor };