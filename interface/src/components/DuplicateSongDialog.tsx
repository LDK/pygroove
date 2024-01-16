import { Dialog, DialogContent, DialogContentText, TextField, DialogActions, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { CancelButton, ConfirmButton } from "../components/DialogButtons";
import { Song } from "../redux/songSlice";
import { useSelector } from "react-redux";
import { getActiveUser } from "../redux/userSlice";
import useSong from "../hooks/useSong";

type DuplicateSongDialogProps = {
  open: boolean;
  onClose: () => void;
  song?: Song;
  callback?: () => void;
}
  
const DuplicateSongDialog = ({ open, callback, onClose, song }: DuplicateSongDialogProps) => {

  const theme = useTheme();
  const user = useSelector(getActiveUser);
  
  const suggestedTitle = (songTitle:string) => {
    const srcName = songTitle;
    return `Copy of ${srcName}`;
  }

  const [songName, setSongName] = useState<string>(suggestedTitle(song?.title || ''));

  const { handleDuplicate, getUserSongs } = useSong();

  const handleDuplicateClick = () => {
    if (!song || !user || !user.token) {
      return;
    }

    handleDuplicate(songName);
    getUserSongs();
    onClose();
  };

  useEffect(() => {
    if (open && song) {
      setSongName(suggestedTitle(song.title || ''));
    }
  }, [open, song]);

  const mode = theme.palette.mode;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogContentText>
          Please enter a name for the duplicate song.
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
        />

      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClose} {...{ mode }} />
        <ConfirmButton onClick={handleDuplicateClick} {...{ mode }} disabled={!songName} label="Create duplicate song" />
      </DialogActions>    
    </Dialog>
  );
}

export default DuplicateSongDialog;