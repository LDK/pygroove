import { PlayArrowTwoTone } from "@mui/icons-material";
import { Box, Grid, Button, Dialog, DialogTitle, DialogContent, Typography, TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { Filter, Track, Step, getActiveSong, PatternEntry, Song } from "../redux/songSlice";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { ApiCallProps } from "../hooks/useApi";
import { UserState } from "../redux/userSlice";
import useSong from "../hooks/useSong";
import useDialogUI from "../theme/useDialogUI";

interface ActionButtonsProps {
  user: UserState;
  apiCall: (props:ApiCallProps) => Promise<any>;
}

const RenderDialog = ({ open, onClose, song }: { open: boolean, onClose: () => void, song: Song }) => {
  const { DialogActionButtons } = useDialogUI();
  const { handleRender } = useSong();
  const [filename, setFilename] = useState<string>(`${song.title}.mp3`);

  useEffect(() => {
    if (open) {
      setFilename(`${song.title}.mp3`);
    }
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

const ActionButtons = ({ user, apiCall }:ActionButtonsProps) => {
  const activeSong = useSelector(getActiveSong);
  const [rendering, setRendering] = useState<boolean>(false);

  const { handleRender } = useSong();

  return (
    <Box textAlign="center" position="absolute" bottom={0} zIndex={2} left={0} right={0} bgcolor="primary.dark" color="primary.contrastText" p={0}>
      <Grid container>
        <Grid item xs={4}>
          <Button variant="contained" color="primary" sx={{ float: 'right', my: 1, mr: 1 }}>
            <PlayArrowTwoTone sx={{ mr: 1 }} />
            Play
          </Button>
        </Grid>

        <Grid item xs={4}>
          <Button onClick={() => { setRendering(true); }} variant="contained" color="primary" sx={{ float: 'left', my: 1, ml: 1 }}>
            Render to MP3
          </Button>
        </Grid>

      </Grid>

      <RenderDialog open={rendering} onClose={() => { setRendering(false); }} song={activeSong} />
    </Box>
  );
}

export default ActionButtons;