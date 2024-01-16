import { Dialog, DialogContent, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import useSong from "../hooks/useSong";
import { getActiveSong } from "../redux/songSlice";
import useDialogUI from "../theme/useDialogUI";

const SaveSongDialog = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  const activeSong = useSelector(getActiveSong);
  const { handleSave } = useSong();
  const { DialogActionButtons } = useDialogUI();

  if (!activeSong) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} sx={{ mb: 4, py: 8 }}>
      <DialogContent>
        <Typography variant="subtitle1" pb={4}>
          Save changes to <Typography component="span" fontWeight={700}>
            {activeSong.title}
          </Typography>?
          </Typography>
      </DialogContent>
      <DialogActionButtons
        onCancel={onClose}
        onConfirm={() => { handleSave(); onClose(); }}
        confirmLabel="Save"
        cancelLabel="Cancel"
        internal padding 
      />
    </Dialog>
  );
};

export default SaveSongDialog;