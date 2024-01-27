import { AxiosResponse } from "axios";
import { useState, useMemo, useEffect } from "react";
import { PatternPreviewPayload, RenderPayload } from "./useSong";
import useApi from "./useApi";
import { Button } from "@mui/material";
import { PlayArrowTwoTone, StopCircleTwoTone } from "@mui/icons-material";

const useAudioPreview = (changeDeps:any[], uri:string, preparePayload: () => RenderPayload | PatternPreviewPayload | undefined) => {
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(false);
  const [previewAudio, setPreviewAudio] = useState<AudioBufferSourceNode | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewResult, setPreviewResult] = useState<AxiosResponse | null>(null);

  const { apiCall } = useApi();

  const audioContext = useMemo(() => {
    return new AudioContext();
  }, []);

  const reader = useMemo(() => {
    return new FileReader();
  }, []);

  const updatePreviewAudio = (result: ArrayBuffer) => {
    if (!audioContext) return;

    audioContext.decodeAudioData(result as ArrayBuffer, (buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.loop = true;

      setPreviewAudio(source);
      setPreviewPlaying(true);
      // previewAudio?.start();
    });
  };

  const stopPreview = () => {
    if (previewPlaying) {
      previewAudio?.stop();
      setPreviewAudio(null);
    }
  }

  const StopPlayButton = () => (
    <Button color={previewPlaying ? 'error' : 'primary'} sx={{ my: 1, mr: 1 }} disabled={previewLoading} onClick={() => { handleRenderPreview(); }}>
      {!previewPlaying  ? <PlayArrowTwoTone sx={{ mr: 1 }} /> : <StopCircleTwoTone sx={{ mr: 1 }} />}
      {!previewPlaying ? 'Play' : 'Stop'}
    </Button>
  );

  const handleRenderPreview = async () => {
    if (!previewAudio) {
      const payload = preparePayload();

      if (previewPlaying) {
        setPreviewPlaying(false);
      }

      if (!previewResult) {
        setPreviewLoading(true);

        await apiCall({
          method: 'post',
          uri: uri,
          payload,
          sendAuth: false,
          config: { responseType: 'blob' }, // Set responseType to 'blob'
          onSuccess: (res) => {
            setPreviewLoading(false);
            setPreviewResult(res);
            setPreviewPlaying(true);
          },
          onError: (error:any) => {
            setPreviewLoading(false);
            console.error('Error during render:', error);
          }
        });
      } else {
        reader.readAsArrayBuffer(previewResult.data);
        reader.onloadend = () => {
          updatePreviewAudio(reader.result as ArrayBuffer);
        }
      }
    } else {
      if (previewPlaying) {
        setPreviewPlaying(false);
        previewAudio.stop();
        setPreviewAudio(null);
      } else {
        setPreviewPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (previewPlaying) {
      previewAudio?.start();
    }
  }, [previewAudio, previewPlaying]);

  useEffect(() => {
    if (previewPlaying && previewAudio) {
      previewAudio.stop();
    }

    setPreviewLoading(false);
    setPreviewResult(null);
    setPreviewPlaying(false);
    setPreviewAudio(null);
  }, changeDeps);

  useEffect(() => {
    if (previewResult) {
      // Store the audio using AudioContext
      reader.readAsArrayBuffer(previewResult.data);
      reader.onloadend = () => {
        // Next step: refactor so that audioContext is kept in state and reused
        // source will also need to be kept in state and stopped/cleared whenever activePattern changes
        // also stopped if the button is clicked again
        updatePreviewAudio(reader.result as ArrayBuffer);
      }; 
    }
  }, [previewResult]);

  return { StopPlayButton, stopPreview, audioContext, reader, previewPlaying, setPreviewPlaying, previewAudio, setPreviewAudio, previewLoading, setPreviewLoading, previewResult, setPreviewResult, handleRenderPreview };
};

export default useAudioPreview;