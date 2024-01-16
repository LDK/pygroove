import { Dialog, DialogTitle, DialogContent, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import useSong from "../hooks/useSong";
import { Song } from "../redux/songSlice";
import useDialogUI from "../theme/useDialogUI";

const RenderDialog = ({ open, onClose, song }: { open: boolean, onClose: () => void, song: Song }) => {
  const { DialogActionButtons } = useDialogUI();
  const { handleRender } = useSong();
  const [filename, setFilename] = useState<string>(`${song.title}.mp3`);

  useEffect(() => {
    setFilename(`${song.title}.mp3`);
  }, [song.title]);

  return (
    <Dialog open={open} onClose={onClose} sx={{ py: 8 }} fullWidth maxWidth="xs">
      <DialogTitle>Render to MP3</DialogTitle>
      <DialogContent sx={{ mb: 2, pb: 0 }}>
        <TextField 
          autoFocus
          margin="dense"
          label="Filename"
          type="text"
          defaultValue={filename}
          onChange={(e) => { setFilename(e.target.value); }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <DialogActionButtons  
          onCancel={onClose}
          onConfirm={() => { handleRender(filename); onClose(); }}
          confirmLabel="Render"
          cancelLabel="Cancel"

        />
      </DialogContent>
      
    </Dialog>
  );
};

export default RenderDialog;