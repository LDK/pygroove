// ExtendedThemeOptions.tsx
import { ThemeOptions } from '@mui/material/styles';

export interface ExtendedThemeOptions extends ThemeOptions {
  palette?: ThemeOptions['palette'] & {
    tray?: {
      main: string;
    };
  };
}
