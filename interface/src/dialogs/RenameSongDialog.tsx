import { Dialog, DialogContent, DialogContentText, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { isFunction } from "@mui/x-data-grid/internals";
import useDialogUI from "../theme/useDialogUI";
import { Song, getActiveSong, setActiveSong } from "../redux/songSlice";
import useApi from "../hooks/useApi";
import { useSelector } from "react-redux";
import { getActiveUser } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import useSong from "../hooks/useSong";

type RenameSongDialogProps = {
  open: boolean;
  onClose: () => void;
  song?: Song;
  callback?: () => void;
}
  
const RenameSongDialog = ({ open, onClose, song, callback }: RenameSongDialogProps) => {
  const user = useSelector(getActiveUser);

  const { apiPut } = useApi();

  const activeSong = useSelector(getActiveSong);

  const [title, setTitle] = useState<string>(song?.title || '');

  const { DialogActionButtons } = useDialogUI();

  const dispatch = useDispatch();

  const { getUserSongs } = useSong();

  const handleRenameClick = () => {
    // console.log('rename project', project?.id, projectName);
    if (!song || !user || !user.token) {
      return;
    }

    apiPut({
      uri: `/song/${song?.id}/rename/`,
      payload: { title: title },
      onSuccess: (res) => {
        console.log('rename response', res.data);
        if (isFunction(callback)) {
          callback();
        }

        if (activeSong?.id === song.id) {
          dispatch(setActiveSong({...song, title: title}));
        }

        getUserSongs();
        onClose();
      },
      sendAuth: true,
      onError: (err) => {
        console.log('rename error', err);
      }
    });

    // setOpen(false);
  };

  useEffect(() => {
    if (open && song) {
      setTitle(song.title || '');
    }
  }, [open, song]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ mb: 4 }}>
        <DialogContentText>
          Please enter a new name for this project.
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

      </DialogContent>

      <DialogActionButtons
        internal padding 
        onConfirm={handleRenameClick}
        onCancel={onClose}
        confirmDisabled={!title}
        confirmLabel="Rename Song"
      />
    </Dialog>
  );
}

export default RenameSongDialog;