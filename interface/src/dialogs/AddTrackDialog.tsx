import { Box, Dialog, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { SampleData, Track, addTrack, getActiveSong } from "../redux/songSlice";
import useSamples from "../hooks/useSamples";
import useDialogUI from "../theme/useDialogUI";
import { useDispatch, useSelector } from "react-redux";

const AddTrackDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  const [trackName, setTrackName] = useState('');
  const [sample, setSample] = useState<SampleData | undefined>(undefined);

  const { SampleBrowser, fetchSamples } = useSamples();
  
  useEffect(() => {
    if (open) {
      console.log('fetch samples');
      fetchSamples();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { DialogActionButtons } = useDialogUI();
  const dispatch = useDispatch();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Track</DialogTitle>

      <DialogContent sx={{ mb: 4}}>
        <TextField
          id="trackName"
          label="Track Name"
          defaultValue={"New Track Name"}
          value={trackName}
          variant="standard"
          sx={{ width: '100%', mb: 2 }}
          onChange={(e) => {
            setTrackName(e.target.value);
          }}
        />

        <SampleBrowser
          openCallback={(samp:SampleData) => {
            const oldSampleName = (trackName === (sample?.display || sample?.filename));
            console.log('trackName', trackName);
            console.log('sample')
            setSample(samp);
            setTrackName(((trackName.length && !oldSampleName) ? trackName : false) || samp.display || samp.filename);
            console.log('open callback', samp);
          }}
        />

        <DialogActionButtons internal padding
          onCancel={handleClose}
          onConfirm={() => {
            const newTrack:Track = {
              position: -1,
              name: trackName,
              sample: sample,
              volume: -6,
              pan: 0,
              disabled: false,
              rootPitch: 'C3',
              pitchShift: 0,
              transpose: 0,
              reverse: false,
              playMode: 'oneshot'
            };

            console.log('add track, newTrack:', newTrack);

            dispatch(addTrack(newTrack));
          }}
        />
          
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;