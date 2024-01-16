import { Dialog, DialogContent, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { clearSong } from "../redux/songSlice";
import useDialogUI from "../theme/useDialogUI";

const NewSongDialog = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  const { DialogActionButtons } = useDialogUI();
  const dispatch = useDispatch();

  return (
    <Dialog open={open} onClose={onClose} sx={{ mb: 4, py: 8 }}>
      <DialogContent>
        <Typography variant="subtitle1" pb={4}>
          Start a new song?  Any unsaved changes to the current song will be lost.
        </Typography>
      </DialogContent>
      <DialogActionButtons
        onCancel={onClose}
        onConfirm={() => {
          onClose();
          dispatch(clearSong());
        }}
        confirmLabel="OK"
        cancelLabel="Cancel"
        internal padding 
      />
    </Dialog>
  );
}

export default NewSongDialog;