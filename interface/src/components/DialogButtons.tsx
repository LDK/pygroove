import { Button } from "@mui/material";

type ButtonProps = {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  mode?: 'dark' | 'light';
};

export const CancelButton = ({ onClick, label, mode } : ButtonProps) => (
  <Button {...{ onClick }} variant={ mode === 'dark' ? 'outlined' : 'contained' } color={ (mode === 'dark' ? 'warning' : 'error') } sx={{ mr: 1 }}>{ label || 'Cancel' }</Button>
);

export const ConfirmButton = ({ onClick, label, disabled, mode } : ButtonProps) => (
  <Button variant="contained" color="success" {...{ disabled, onClick }} type="submit">{ label || 'OK' }</Button>
)

