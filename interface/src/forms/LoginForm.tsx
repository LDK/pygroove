import { Box, SxProps, TextField, TextFieldVariants, Typography } from '@mui/material';
import * as yup from 'yup';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import useDialogUI from '../theme/useDialogUI';
import { useState } from 'react';
import ResetPassword from './ResetPasswordForm';

type LoginFormOptions = {
  inputVariant?: TextFieldVariants;
  buttonVariant?: "contained" | "outlined" | "text";
  onSubmit: (data: any) => void;
  buttonSx?: SxProps;
  onCancel?: () => void;
  loading: boolean;
} & ({ email: true; username?: boolean; } | { username: true; email?: boolean; });

const LoginForm = (options: LoginFormOptions) => {
  const inputVariant:TextFieldVariants = options.inputVariant || "outlined";
  const { DialogActionButtons } = useDialogUI();

  const [resetting, setResetting] = useState(false);

  const schema = yup.object().shape({
    username: options.username ? yup.string().required() : yup.string(),
    email: options.email ? yup.string().email().required() : yup.string(),
    password: yup.string().required(),
  });

  const methods = useForm({
    resolver: yupResolver(schema)
  });

  if (resetting) {
    return (
      <ResetPassword onCancel={() => setResetting(false)} loading={false} />
    );
  }

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
            render={({ field }) => <TextField disabled={options.loading} fullWidth autoComplete="password" {...field} label="Password" variant={inputVariant} type="password" sx={{ marginBottom: "1rem" }} />}
          />

          <Typography fontWeight={600} sx={{ cursor: "pointer" }} variant="body2" color="primary" onClick={() => setResetting(true)}>Forgot Password?</Typography>

          <DialogActionButtons
            internal
            padding
            onCancel={options.onCancel || (() => {})}
            onConfirm={() => {}}
          />

        </Box>
      </form>
    </FormProvider>
  );
}

export default LoginForm;