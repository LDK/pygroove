import { useDispatch } from "react-redux";
import { Track, setTrackPan, setTrackVolume } from "../redux/songSlice";
import { Box } from "@mui/material";
import Range from "../components/Range";

const useTrackControls = ({ track }:{ track?: Track }) => {
  const dispatch = useDispatch();

    // A vertical slider for volume with db labels beneath
  const VolumeSlider = () => (
    <Box pt={0} px={0} position="relative">
      <Range
        orientation="vertical"
        defaultValue={track?.volume || 0}
        callback={(value:number) => {
          dispatch(setTrackVolume({ position: track?.position || 0, volume: value }));
        }}
        label="Vol"
        labelVariant="caption"
        labelSuffix="dB"
        labelColor="text.secondary"
        height="3rem"
        width="2rem"
        min={-36}
        max={12}
        step={.1}
      />
    </Box>
  );

  // A horizontal slider for pan with L/R labels beneath
  const PanSlider = () => (
    <Box pt={1} position="relative" display="block">
      <Range
        defaultValue={track?.pan || 0}
        callback={(value:number) => {
          dispatch(setTrackPan({ position: track?.position || 0, pan: value }));
        }}
        height="2.5rem"
        width="100%"
        min={-100}
        max={100}
        step={1}
        label="Pan"
        labelVariant="caption"
        labelColor="text.secondary"
      />
    </Box>
  );

  return {
    VolumeSlider, PanSlider,
  };
};

export default useTrackControls;