import { useDispatch, useSelector } from "react-redux";
import { clearPattern, copyPattern, firstEmptyPattern, getActivePattern, getActiveSong, renamePattern, setActivePattern } from "../redux/songSlice";
import { OpenInFullTwoTone, ArrowLeftTwoTone, ArrowRightTwoTone } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, Typography, Box, RadioGroup, FormControlLabel, Radio, Divider, Select, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import useDialogUI from "../theme/useDialogUI";
import { Variant } from "@mui/material/styles/createTypography";

export const TextLink = ({ text, onClick, variant, color }:{ color?: string, text: string, variant?: Variant, onClick: (e?:React.MouseEvent) => void }) => (
  <Typography fontWeight={600} color={color || "primary.dark"} display="inline" sx={{ cursor: 'pointer' }} variant={`${variant || 'caption'}`} component="span" onClick={onClick}>
    {text}
  </Typography>
);

export const dot = <Typography display="inline" fontWeight={700} variant="caption" px={"3px"}>&middot;</Typography>;

const PatternManagement = () => {
  const dispatch = useDispatch();
  
  const activePattern = useSelector(getActivePattern);

  const { name: patternName, position } = activePattern || { name: '', position: 0 };

  const firstEmptyPatternPosition = useSelector(firstEmptyPattern);

  const [patternPosition, setPatternPosition] = useState(position || 1);
  const [copyOpen, setCopyOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const [renamingPattern, setRenamingPattern] = useState(false);
  const [workingPatternName, setWorkingPatternName] = useState(patternName || 'Pattern ' + patternPosition);
  const [workingPatternPosition, setWorkingPatternPosition] = useState<number | undefined>(patternPosition);

  useEffect(() => {
    if (patternPosition !== position) {
      setWorkingPatternName(patternName || 'Pattern ' + patternPosition);
      setWorkingPatternPosition(undefined);
      dispatch(setActivePattern(patternPosition));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternPosition, patternName, dispatch]);

  const { DialogActionButtons } = useDialogUI();

  const CopyPatternDialog = ({ open }:{ open: boolean }) => {
    const [copyMode, setCopyMode] = useState<'firstEmpty' | 'byPosition'>('firstEmpty');
    const [destinationPosition, setDestinationPosition] = useState<number | null>(null);

    const firstEmptyText = firstEmptyPatternPosition ? `${firstEmptyPatternPosition}` : 'No empty patterns';

    const patterns = useSelector(getActiveSong).patterns;

    const handleClose = () => {
      setCopyOpen(false);
    };

    const handleConfirm = () => {
      // Copy pattern
      if (activePattern) {
        const toPosition:number = (copyMode === 'byPosition' && destinationPosition) ? destinationPosition : firstEmptyPatternPosition;

        dispatch(copyPattern({
          from: activePattern.position,
          to: toPosition,
        }));

        setPatternPosition(toPosition);
      }

      handleClose();
    };

    return (
    <Dialog
      fullWidth={true}
      maxWidth={'sm'}
      open={open}
      onClose={() => {}}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle>Copy Pattern</DialogTitle>

      <DialogContent>
        <Typography component="span">Copy </Typography>
        <Typography component="span" fontWeight={600}>{activePattern?.name || 'current pattern'}</Typography>
        <Typography component="span"> into:</Typography>

        <Box>
          <RadioGroup aria-label="Copy Mode" name="copyMode" value={copyMode} onChange={(e) => {
            setCopyMode(e.target.value as 'firstEmpty' | 'byPosition');
          }}>
            <FormControlLabel disabled={!firstEmptyPatternPosition} value={"firstEmpty"} control={<Radio />} label={`First Empty Pattern (${firstEmptyText})`} />

            <Divider sx={{ my: 1 }} />

            <FormControlLabel value={"byPosition"} control={<Radio />} label="Select a Pattern:" />

            <Select
              native
              disabled={copyMode !== 'byPosition'}
              value={destinationPosition}
              onChange={(e) => {
                setDestinationPosition(parseInt(e.target.value as string));
              }}
              inputProps={{
                name: 'copyPosition',
                id: 'copy-position',
              }}
            >
              <option value={0}>-- None Selected --</option>
              {
                [...Array(64)].map((_, i) => {
                  const position = i + 1;
                  const pattern = patterns.find((p) => p.position === position);
                  return (
                    <option key={position} value={position}>{pattern ? `#${position}: ${pattern.name}` : `${position}: Empty`}</option>
                  );
                })
              }
            </Select>

            <Typography color="warning" variant="caption" fontWeight={500} mt={1} mb={4}>
              Any existing content in the selected pattern will be overwritten.
            </Typography>
          </RadioGroup>

          <DialogActionButtons
            internal
            padding
            onCancel={handleClose}
            onConfirm={handleConfirm}
          />

        </Box>

      </DialogContent>

    </Dialog>
  );
  }

  const SelectPatternDialog = ({ open }:{ open: boolean }) => {
    const [selectedPosition, setSelectedPosition] = useState<number | null>(patternPosition);

    const patterns = useSelector(getActiveSong).patterns;

    return (
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={open}
        onClose={() => {}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Select Pattern</DialogTitle>

        <DialogContent>
          <Box height="300px" p={2} mb={4} sx={{ overflowY: 'scroll' }} borderRadius=".5rem"
            bgcolor={'primary.dark'}
          
          >
              {
                [...Array(64)].map((_, i) => {
                  const position = i + 1;
                  const pattern = patterns.find((p) => p.position === position);
                  return (
                    <Typography variant="subtitle2" pb={1} key={`pattern-select-${position}`} onClick={() => {
                      setSelectedPosition(position);
                    }}
                      color={selectedPosition === position ? 'warning.light' : 'primary.contrastText'}
                    >
                      {pattern ? `#${position}: ${pattern.name}` : `#${position}: Empty`}
                    </Typography>
                  );
                })
              }
          </Box>

          <DialogActionButtons
            internal
            padding
            onCancel={() => {
              setSelectOpen(false);
            }}
            onConfirm={() => {
              if (selectedPosition) {
                setPatternPosition(selectedPosition);
              }
              setSelectOpen(false);
            }}
          />

        </DialogContent>
      </Dialog>
    );
  }

  const onPrevClick = () => {
    if (patternPosition > 1) {
      setPatternPosition(patternPosition - 1);
    } else {
      setPatternPosition(64);
    }
  };

  const onNextClick = () => {
    if (patternPosition < 64) {
      setPatternPosition(patternPosition + 1);
    } else {
      setPatternPosition(1);
    }
  };

  const onNewClick = () => {
    if (firstEmptyPatternPosition) {
      setPatternPosition(firstEmptyPatternPosition);
    }
  }

  const onClearClick = () => {
    if (patternPosition) {
      dispatch(clearPattern(patternPosition));
    }
  }

  const onCopyClick = () => {
    if (activePattern) {
      setCopyOpen(true);
    }
  };

  const onRenameClick = () => {
    setRenamingPattern(true);
    setWorkingPatternName(patternName || 'Pattern ' + patternPosition);
    setWorkingPatternPosition(patternPosition);
  }

  // When we stop editing the pattern name, set the pattern name to the working pattern name, if it has changed
  useEffect(() => {
    if (!renamingPattern && workingPatternName && workingPatternName !== patternName 
        && workingPatternPosition && workingPatternPosition === patternPosition) {
      dispatch(renamePattern({ position: patternPosition, name: workingPatternName }));
      dispatch(setActivePattern(patternPosition));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renamePattern, workingPatternName, dispatch, renamingPattern, workingPatternPosition, patternPosition]);

  return (
    <Box p={0} m={0} id="pattern-management">
      <Box display="inline-block" textAlign="left" width="24px" onClick={onPrevClick}>
        <ArrowLeftTwoTone sx={{ cursor: 'pointer', width: '24px', position: 'relative', top: '8px', display: 'inline-block' }} onClick={onPrevClick} />
      </Box>

      <Box p={0} m={0} display="inline-block" height="48px">
        <Box width="132px" height="24px" sx={{ cursor: 'pointer' }} p={1} display="inline-block" 
          borderRadius="2px" bgcolor="primary.dark" position="relative" onClick={() => {
            if (!renamingPattern) { 
              setSelectOpen(true);
            }
          }}>
        { 
          !renamingPattern ?
            <Typography height="24px" textAlign={"left"} display="inline-block" fontWeight="600" variant="caption" sx={{ userSelect: 'none' }} color="primary.contrastText" width="100%">{`${patternPosition}: ${patternName}`}</Typography> :

            <TextField
              id="pattern-name"
              defaultValue={patternName || 'Pattern ' + patternPosition}
              variant="standard"
              sx={{ width: '100%', color: 'white', height: '24px', p:0 }}
              InputProps={
                { style: { color: 'white', fontSize: '.8rem' } }
              }
              onKeyDown={(e) => {
                // If enter is pressed, set editing to false
                if (e.key === 'Enter') {
                  setRenamingPattern(false);
                }
              }}
              onChange={(e) => {
                setWorkingPatternName(e.target.value);
              }}
            />
        }
          
          <OpenInFullTwoTone 
            color="warning"
            sx={{ 
              display: 'inline-block',
              position: 'absolute',
              top: '.5rem',
              right: '.5rem',
              width: '1rem',
            }} 
          />
        </Box>
      </Box>

      <Box display="inline-block" textAlign="left" width="24px" onClick={onNextClick}>
        <ArrowRightTwoTone sx={{ cursor: 'pointer', width: '24px', position: 'relative', top: '8px', display: 'inline-block' }} onClick={onPrevClick} />
      </Box>

      <Box textAlign={"center"} width="100%" mt={1}>
        <TextLink text="New" onClick={onNewClick} />

        {dot}

        <TextLink text="Clear" onClick={onClearClick} />

        {dot}

        <TextLink text="Copy" onClick={onCopyClick} />

        {dot}

        {!renamingPattern && <TextLink text="Rename" onClick={onRenameClick} />}

        {renamingPattern && <TextLink text="Confirm" onClick={() => setRenamingPattern(false)} />}
      </Box>

      <CopyPatternDialog open={copyOpen} />
      <SelectPatternDialog open={selectOpen} />
    </Box>
  );
};

export default PatternManagement;