import { Dialog, DialogContent, DialogActions, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { CancelButton, ConfirmButton } from "../components/DialogButtons";
import { SongState, getActiveSong, setSongId, setSongTitle } from "../redux/songSlice";
import { getActiveUser } from "../redux/userSlice";

type OpenSongDialogProps = {
  onClose: () => void;
  song?: SongState;
}

const OpenSongDialog = ({ onClose, song }: OpenSongDialogProps) => {
  const dispatch = useDispatch();
  const activeSong = useSelector(getActiveSong);
  const currentTitle = activeSong?.title;

  const user = useSelector(getActiveUser);

  if (!song) {
    return null;
  }

  const handleOpenSong = () => {
    onClose();
  };

  const handleSaveAndOpenSong = () => {
    handleOpenSong();
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogContent>
        <Typography fontWeight={500}>
          Open {song.title || 'this song'} and close {currentTitle || 'the current song'}?
        </Typography>
        <Typography variant="subtitle1">
          Anyone unsaved changes to the current song will be lost.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <CancelButton onClick={onClose} />
        <ConfirmButton onClick={handleSaveAndOpenSong} label="Save Changes and Open Song" />
        <ConfirmButton onClick={handleOpenSong} label="Open and Discard Changes" />
      </DialogActions>
    </Dialog>
  );
}

export default OpenSongDialog;