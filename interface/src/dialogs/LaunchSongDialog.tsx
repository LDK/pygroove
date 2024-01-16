import { Dialog, DialogContent, DialogActions, useTheme, Typography, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../components/DialogButtons";
import { Song, getActiveSong, setActiveSong } from "../redux/songSlice";

import { useDispatch, useSelector } from "react-redux";
import { getActiveUser } from "../redux/userSlice";
import useSong from "../hooks/useSong";

type LaunchSongDialogProps = {
  open: boolean;
  onClose: () => void;
  song?: Song;
}
  
const LaunchSongDialog = ({ open, onClose, song }: LaunchSongDialogProps) => {
  const theme = useTheme();

  const { handleSave } = useSong();

  const [songName, setSongName] = useState<string>(song?.title || '');
  const user = useSelector(getActiveUser);
 
  const activeSong = useSelector(getActiveSong);

  const dispatch = useDispatch();

  const handleDiscardOpen = () => {
    if (!song || !user || !user.token) {
      return;
    }

    const launchSong = user.songs.find((s) => s.id === song.id);

    if (launchSong && launchSong.id !== activeSong?.id) {
      dispatch(setActiveSong(launchSong));
    }

    onClose();
  };

  const handleSaveOpen = () => {
    if (!song || !user || !user.token) {
      return;
    }

    if (activeSong) {
      handleSave();
    }

    const launchSong = user.songs.find((s) => s.id === song.id);

    if (launchSong && launchSong.id !== activeSong?.id) {
      dispatch(setActiveSong(launchSong));
    }

    onClose();
  };

  useEffect(() => {
    if (open && song) {
      setSongName(song.title || '');
    }
  }, [open, song]);

  const mode = theme.palette.mode;

  if (!song) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="alert-dialog-title">Confirm Song Open</DialogTitle>

      <DialogContent>
        <Typography variant="subtitle1">
          Do you really want to open {song.title}?
        </Typography>
        <Typography variant="caption">
          Any unsaved changes to the current song will be lost.
        </Typography>
      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClose} {...{ mode }} />
        <ConfirmButton onClick={handleDiscardOpen} {...{ mode }} disabled={!songName} label="Discard Changes" />
        <ConfirmButton onClick={handleSaveOpen} {...{ mode }} disabled={!songName} label="Save and Open" />
      </DialogActions>    
    </Dialog>
  );
}

export default LaunchSongDialog;