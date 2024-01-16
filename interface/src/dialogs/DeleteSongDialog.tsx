import { Dialog, DialogContent, DialogContentText, DialogActions, useTheme, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../components/DialogButtons";
import { isFunction } from "@mui/x-data-grid/internals";
import { Song, getActiveSong, setActiveSong } from "../redux/songSlice";
import { useDispatch, useSelector } from "react-redux";
import { getActiveUser } from "../redux/userSlice";
import useApi from "../hooks/useApi";
import useSong from "../hooks/useSong";

type DeleteSongDialogProps = {
  open: boolean;
  onClose: () => void;
  song?: Song;
  callback?: (id?: number) => void;
}
  
const DeleteSongDialog = ({ open, onClose, song, callback }: DeleteSongDialogProps) => {
  const theme = useTheme();

  const [songName, setSongName] = useState<string>(song?.title || '');
  const user = useSelector(getActiveUser);
  const { apiDelete } = useApi();
  const { getUserSongs } = useSong();

  const activeSong = useSelector(getActiveSong);

  const dispatch = useDispatch();

  const handleDeleteClick = () => {
    if (!song || !user || !user.token) {
      return;
    }

    apiDelete({
      uri: `/song/${song.id}/`,
      onSuccess: (res) => {
        if (isFunction(callback)) {
          callback(song.id);
        }

        if (res?.data?.id ) {
          if (activeSong?.id === res.data.id) {
            dispatch(setActiveSong(null));
          }
        }

        console.log('delete data', res);

        getUserSongs();
        onClose();
      },
      onError: (error) => {
        console.log('error', error);
      },
      sendAuth: true,
    });

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
      <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Do you really want to delete {song.title}?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClose} {...{ mode }} />
        <ConfirmButton onClick={handleDeleteClick} {...{ mode }} disabled={!songName} label="Delete Song" />
      </DialogActions>    
    </Dialog>
  );
}

export default DeleteSongDialog;