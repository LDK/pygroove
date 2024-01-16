import { Box, SxProps, TextField, TextFieldVariants } from '@mui/material';
import * as yup from 'yup';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import useDialogUI from '../theme/useDialogUI';

type HasEmail = {
  email: true;
  username?: boolean;
};

type HasUsername = {
  username: true;
  email?: boolean;
};

type HasEmailAndUsername = HasEmail & HasUsername;

type HasAtLeastEmailOrUsername = HasEmail | HasUsername | HasEmailAndUsername;

type RegistrationFormOptions = {
  confirmPassword?: boolean;
  inputVariant?: TextFieldVariants;
  onSubmit: (data: any) => void;
  buttonSx?: SxProps;
  onCancel?: () => void;
  loading: boolean;
} & HasAtLeastEmailOrUsername;

const RegistrationForm = (options: RegistrationFormOptions) => {
  const { DialogActionButtons } = useDialogUI();
  const inputVariant:TextFieldVariants = options.inputVariant || "outlined";

  const schema = yup.object().shape({
    username: options.username ? yup.string().required() : yup.string(),
    email: options.email ? yup.string().email().required() : yup.string(),
    password: yup.string().required(),
    passwordConfirm: options.confirmPassword ? yup.string().oneOf([yup.ref("password"), undefined], "Passwords must match") : yup.string(),
  });

  const methods = useForm({
    resolver: yupResolver(schema)
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(options.onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "start" }} textAlign="left">
          {options.username && (
            <Controller
              name="username"
              control={methods.control}
              defaultValue=""
              render={({ field }) => <TextField disabled={options.loading} fullWidth {...field} autoComplete="username" InputProps={{ autoComplete: 'login' }} label="Username" variant={inputVariant} sx={{ marginBottom: "1rem" }} />}
            />
          )}

          {options.email && (
            <Controller
              name="email"
              control={methods.control}
              defaultValue=""
              render={({ field }) => <TextField disabled={options.loading} fullWidth autoComplete="email" {...field} label="Email" color="primary" InputProps={{ autoComplete: 'email' }} variant={inputVariant} type="email" sx={{ marginBottom: "1rem" }} />}
            />
          )}

          <Controller
            name="password"
            control={methods.control}
            defaultValue=""
            render={({ field }) => <TextField disabled={options.loading} fullWidth autoComplete="new-password" {...field} label="Password" variant={inputVariant} type="password" sx={{ marginBottom: "1rem" }} />}
          />

          {options.confirmPassword && (
            <Controller
              name="passwordConfirm"
              control={methods.control}
              defaultValue=""
              render={({ field }) => <TextField disabled={options.loading} fullWidth autoComplete="new-password" {...field} label="Confirm Password" variant={inputVariant} type="password" sx={{ marginBottom: "1rem" }} />}
            />
          )}
        </Box>

        <DialogActionButtons
          internal
          padding
          onCancel={options.onCancel || (() => {})}
          onConfirm={() => {}}
        />

      </form>
    </FormProvider>
  );
}

export default RegistrationForm;