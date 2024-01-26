import { useState, useMemo, ReactElement, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { BlackKey, WhiteKey } from "../components/PianoKey";
import { PianoRollProps } from "../components/PianoRoll";
import { getActivePattern, getActiveSong, Loc, Step } from "../redux/songSlice";
import { getTicks, getOverallStep, getLoc } from "./useSteps";

const usePianoRoll = ({ track, stepSettings }:PianoRollProps) => {
  const { barDiv, beatStep } = stepSettings;

  const tickDivs = getTicks(beatStep);

  const [pitchStart, setPitchStart] = useState(71);

  const defaultPitchRange = 16;
  const [pitchRange, setPitchRange] = useState(defaultPitchRange);

  const [barStart, setBarStart] = useState(0);
  const barRange = 2;

  const keyHeight = 28;

  const notes:string[] = useMemo(() => {
    const octaves = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4];
    const pitches = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];

    const list:string[] = [];

    for (let i = 0; i < octaves.length; i++) {
      for (let j = 0; j < pitches.length; j++) {
        const pitch = pitches[j] + octaves[i];
        list.push(pitch);
      }
    }

    return list;
  }, []);

  const keys:ReactElement[] = useMemo(() => {
    const list:ReactElement[] = [];

    for (let idx = pitchStart; idx < Math.min(pitchStart + pitchRange, notes.length); idx++) {
      const note = notes[idx];
      if (note.includes('#')) {
        list.push(<BlackKey height={keyHeight} pitch={note} idx={idx - pitchStart} />);
      } else {
        list.push(<WhiteKey height={keyHeight} pitch={note} idx={idx - pitchStart} />);
      }
    }

    return list;
  }, [pitchStart, notes, pitchRange, keyHeight]);

  const activePattern = useSelector(getActivePattern);
  const activeSong = useSelector(getActiveSong);

  const originalSteps = useMemo(() => (!activePattern || !track) ? [] as Step[] : 
    activePattern.steps.filter(step => step.track.position === track.position),
    [activePattern, track]);

  const [steps, setSteps] = useState<Step[]>(originalSteps);

  const reindex = (steps:Step[]) => {
    const newSteps = steps.map((step, i) => {
      return {
        ...step,
        index: i,
      };
    });

    return newSteps;
  };

  const removeStep = (step:Step) => {
    const newSteps = steps.filter(s => s.index !== step.index);

    setSteps(newSteps);
  };

  const updateStep = (step:Step) => {
    console.log('update step', step);
    if (step.index === selected?.index) {
      setSelected(step);
    }

    const newSteps = steps.map(s => {
      if (s.index === step.index) {
        return step;
      }

      return s;
    });

    setSteps(newSteps);
  }

  const addStep = (step:Step) => {
    const newSteps:Step[] = [];

    let newStep:Step = {...step}

    steps.forEach((s, i) => {
      newSteps.push({
        ...s,
        index: i,
      });
    });

    newStep.index = newSteps.length;

    newSteps.push(newStep);

    setSteps(newSteps);

    return newStep;
  };

  const moveStep = (step:Step, loc:Loc, pitch?:string, duration?:number, drop?:boolean) => {
    let newStep:Step;

    const newSteps = steps.map(s => {
      if (s.index === step.index) {
        newStep = {
          ...s,
          loc,
          pitch: pitch || s.pitch,
          duration: duration || s.duration,
        };

        if (dragging && !drop) {
          setDragging(newStep);
        }

        if (dragStart) {
          const diff = getOverallStep(newStep.loc, tickDivs, barDiv, beatStep) - getOverallStep(step.loc, tickDivs, barDiv, beatStep);
          setDragStart(diff + dragStart);
        }
        return newStep;
      }

      return s;
    });

    setSteps(newSteps);
  }

  const sizeStep = (step:Step, duration:number) => {
    const newSteps = steps.map(s => {
      if (s.index === step.index) {
        return {
          ...s,
          duration,
        };
      }

      return s;
    });

    setSteps(newSteps);
  }

  const splitStep = (step:Step, split:number) => {
    const newSteps = steps.map(s => {
      if (s.index === step.index) {
        return {
          ...s,
          duration: split,
        };
      }

      return s;
    });

    newSteps.push({
      ...step,
      duration: step.duration - split,
      loc: getLoc(getOverallStep(step.loc, tickDivs, barDiv, beatStep) + split, tickDivs, barDiv, beatStep),
    });

    setSteps(reindex(newSteps));
  }

  const [selected, setSelected] = useState<Step | undefined>(undefined);
  const [dragging, setDragging] = useState<Step | false>(false);
  const [dragStart, setDragStart] = useState<number | false>(false);
  const [erasing, setErasing] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [sizing, setSizing] = useState<Step | false>(false);
  
  useEffect(() => {
    setSteps(originalSteps);
  }, [originalSteps]);

  const checkHeight = useCallback(() => {
    if (window.innerHeight < 700) {
      const keysBelow = Math.ceil((700 - window.innerHeight) / keyHeight);
      setPitchRange(Math.max(defaultPitchRange - keysBelow, 1));
    } else {
      setPitchRange(defaultPitchRange);
    }
  }, [defaultPitchRange, keyHeight]);

  // when window height changes
  useEffect(() => { 
    window.removeEventListener('resize', checkHeight);
    window.addEventListener('resize', checkHeight);
  }, [checkHeight]);
  
  return {
    tickDivs, pitchStart, pitchRange, barStart, barRange,
    setPitchStart, setPitchRange, setBarStart,
    keyHeight, notes, keys,
    steps, setSteps, reindex, removeStep, updateStep, addStep, moveStep, sizeStep, splitStep,
    selected, setSelected, dragging, setDragging, dragStart, setDragStart,
    erasing, setErasing, drawing, setDrawing, sizing, setSizing,
    bars: activePattern?.bars || 2,
    patternName: activePattern?.name || '',
    activePattern, activeSong
  };

};

export default usePianoRoll;