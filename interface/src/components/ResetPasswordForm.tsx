import { Box, SxProps, TextField, TextFieldVariants, Typography } from '@mui/material';
import * as yup from 'yup';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import useDialogUI from '../theme/useDialogUI';
import { useState } from 'react';
import axios from 'axios';
import { isFunction } from '@mui/x-data-grid/internals';

type ResetPasswordOptions = {
  inputVariant?: TextFieldVariants;
  buttonVariant?: "contained" | "outlined" | "text";
  buttonSx?: SxProps;
  onCancel?: () => void;
  loading: boolean;
};

const ResetPasswordForm = ({ onCancel, ...options }: ResetPasswordOptions) => {
  const inputVariant:TextFieldVariants = options.inputVariant || "outlined";
  const { DialogActionButtons } = useDialogUI();

  const schema = yup.object().shape({
    email: yup.string().email().required()
  });

  const methods = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = (data: any) => {
    axios.post(`${process.env.REACT_APP_API_URL}/user/forgot-password`, data).then(res => {
      if (isFunction(onCancel)) { onCancel(); }
    })
    .catch(err => {
      console.log(err);
    });
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "start" }} textAlign="left">
          <Typography variant="h6" sx={{ marginBottom: "1rem" }}>Reset Password</Typography>

          <Typography variant="body2" sx={{ marginBottom: "1rem" }}>Enter your email address below and we'll send you a link to reset your password.</Typography>

          <Controller
            name="email"
            control={methods.control}
            defaultValue=""
            render={({ field }) => <TextField disabled={options.loading} fullWidth autoComplete="email" {...field} label="Email" color="primary" InputProps={{ autoComplete: 'email' }} variant={inputVariant} type="email" sx={{ marginBottom: "1rem" }} />}
          />

          <DialogActionButtons
            internal
            padding
            onCancel={onCancel || (() => {})}
            onConfirm={() => {}}
          />

        </Box>
      </form>
    </FormProvider>
  );
}

export default ResetPasswordForm;