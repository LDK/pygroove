import { Box, Dialog, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { SampleData, Track, addTrack, getActiveSong, removeTrack } from "../redux/songSlice";
import useSamples from "../hooks/useSamples";
import useDialogUI from "../theme/useDialogUI";
import { useDispatch, useSelector } from "react-redux";

const RemoveTrackDialog = ({ handleClose, track, open }: { handleClose: () => void, track:Track, open: boolean }) => {
  const { DialogActionButtons } = useDialogUI();
  const dispatch = useDispatch();

  if (!track) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Remove Track</DialogTitle>

      <DialogContent sx={{ mb: 4}}>
        <Typography variant="body1" component="p">Are you sure you want to remove track {track.position}?</Typography>

        <DialogActionButtons internal padding
          onCancel={handleClose}
          onConfirm={() => {
            dispatch(removeTrack(track.position));
          }}
        />
          
      </DialogContent>
    </Dialog>
  );
};

export default RemoveTrackDialog;