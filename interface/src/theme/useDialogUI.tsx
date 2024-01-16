import { Button, DialogActions, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, useTheme } from "@mui/material";

export type ColorVariant = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | undefined;

export default function useDialogUI() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const fieldColor:ColorVariant = dark ? 'info' : 'primary';
  const labelColor:ColorVariant = dark ? 'success' : 'primary';

  type ButtonProps = {
    onClick?: () => void;
    label?: string;
    disabled?: boolean;
    mode?: 'dark' | 'light';
  };

  const CancelButton = ({ onClick, label } : ButtonProps) => (
    <Button {...{ onClick }} variant={ dark ? 'outlined' : 'contained' } color={ dark ? 'warning' : 'error' } sx={{ textAlign: 'center', display: 'block', mr: 1 }} >{ label || 'Cancel' }</Button>
  );
  
  const ConfirmButton = ({ onClick, label, disabled } : ButtonProps) => (
    <Button sx={{ textAlign: 'center', display: 'block' }} variant="contained" color="success" {...{ disabled, onClick }} type="submit">{ label || 'OK' }</Button>
  )
  
  type DialogActionButtonsProps = {
    onCancel: () => void;
    onConfirm: () => void;
    confirmDisabled?: boolean;
    cancelLabel?: string;
    confirmLabel?: string;
    internal?: boolean;
    padding?: true;
    hideCancel?: true;
  };

  const DialogActionButtons = ({ onCancel, onConfirm, padding, confirmDisabled, cancelLabel, confirmLabel, internal, hideCancel } : DialogActionButtonsProps) => (
    <DialogActions sx={{ px: padding ? 3 : 0, pb: 0, pt:0, ...( internal ? { position: 'absolute', bottom: '.5rem', right: 0 } : {} ) }}>
      {!hideCancel && <CancelButton onClick={onCancel} mode={dark ? 'dark' : 'light'} label={cancelLabel} />}
      <ConfirmButton onClick={onConfirm} mode={dark ? 'dark' : 'light'} {...{ disabled: confirmDisabled }} label={confirmLabel} />
    </DialogActions>
  );

  type MuiRadioGroupProps = {
    name: string;
    label: string;
    defaultValue?: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
  }

  const MuiRadioGroup = ({ radioGroup }: { radioGroup: MuiRadioGroupProps }) => (
    <FormControl sx={{ mt: 2 }}>
      <FormLabel id="export-format-group-label" color={labelColor}>{ radioGroup.label }</FormLabel>
      <RadioGroup
        row
        color={fieldColor}
        aria-labelledby={radioGroup.name+'-label'}
        defaultValue={radioGroup.defaultValue}
        name={radioGroup.name}
        onChange={(e) => {
          if (radioGroup.onChange) {
            radioGroup.onChange(e.target.value);
          }
        }}
      >
        {
          radioGroup.options.map((option) => (
            <FormControlLabel key={option.value} value={option.value} control={<Radio color={fieldColor} />} label={option.label} />
          ))
        }
      </RadioGroup>
    </FormControl>
  );

  return { fieldColor, labelColor, dark, CancelButton, ConfirmButton, DialogActionButtons, MuiRadioGroup };
}

