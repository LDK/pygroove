import { Step, Track, setStep, setTrackPan, setTrackVolume } from "../redux/songSlice";
import { Box } from "@mui/material";
import Range, { TypeVariants } from "../components/Range";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

const useControls = () => {
  type SliderProps = {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    callback?: (value: number) => void;
    useLabel?: boolean;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    defaultValue?: number;
    width?: string;
  } & ({
    target: Step;
    model: 'Step';
    updateState?: ActionCreatorWithPayload<number>;
  } | {
    target: Track;
    model: 'Track';
    updateState?: ActionCreatorWithPayload<{ value: number, position: number }>;
  });

  type SliderLabelData = {
    label: string;
    labelVariant?: TypeVariants;
    labelSuffix?: string;
    labelColor?: string;
    panDisplay?: true;
    percentage?: true;
  };

  const volumeLabelData:SliderLabelData = {
    label: 'Vol',
    labelVariant: 'caption',
    labelSuffix: 'dB',
    labelColor: 'text.secondary',
  };

  const panLabelData:SliderLabelData = {
    label: 'Pan',
    labelVariant: 'caption',
    labelColor: 'text.secondary',
    panDisplay: true,
  };

  const targetVolumeDefaults = {
    Step: 100,
    Track: -6,
  }

  const dispatch = useDispatch();

  type SliderSaveProps = {
    value: number;
  } & ({
    model: 'Track';
    target: Track;
    facet: 'pan' | 'volume';
  } | {
    model: 'Step';
    target: Step;
    facet: 'velocity' | 'pan';
  });

  const onSliderSave = ({ target, model, facet, value }:SliderSaveProps) => {
    if (model === 'Track') {
      if (facet === 'pan') {
        // Update the pan of the track
        dispatch(setTrackPan({ value, position: target.position }));
      } else if (facet === 'volume') {
        // Update the volume of the track
        dispatch(setTrackVolume({ value, position: target.position }));
      }
    } else if (model === 'Step') {
      if (facet === 'velocity') {
        // Update the velocity of the step
        target.velocity = value;
        dispatch(setStep(target));
      } else if (facet === 'pan') {
        // Update the pan of the step
        target.pan = value;
        dispatch(setStep(target));
      }
    }
  };
  
  
  // A vertical slider for volume with db labels beneath
  const VolumeSlider = ({ onChange, callback, useLabel, target, model, onBlur, defaultValue }:SliderProps) => {
    if (!model) throw new Error('model is required');
    
    return (
      <Box pt={0} px={0} position="relative">
        <Range
          orientation="vertical"
          defaultValue={
            (defaultValue || defaultValue === 0) ? defaultValue :
            (model === 'Step' ? (target as Step).velocity : (target as Track).volume) || targetVolumeDefaults[model]
          }
          {...{ onChange, callback, onBlur }}
          {...( useLabel ? volumeLabelData : {} )}
          height="3rem"
          width="2rem"
          min={-36}
          max={12}
          step={.1}
        />
      </Box>
    )
  };

  // A horizontal slider for pan with L/R labels beneath
  const PanSlider = ({ onChange, callback, useLabel, target, model, onBlur, width, defaultValue }:SliderProps) => {
    if (!model) throw new Error('model is required');

    return (
      <Box pt={1} position="relative" display="block">
        <Range
          defaultValue={
            (defaultValue || defaultValue === 0) ? defaultValue : target.pan || 0
          }
          {...{ onChange, callback, onBlur }}
          {...( useLabel ? panLabelData : {} )}
          height="2.5rem"
          width={width || "100%"}
          min={-100}
          max={100}
          step={1}
        />
      </Box>
    )
  };

  return {
    VolumeSlider, PanSlider, onSliderSave
  };
};

export default useControls;