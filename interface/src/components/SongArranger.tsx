// Song Arranger.tsx
import { SxProps, Dialog, DialogContent, Grid, Typography, Box, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { Pattern, PatternEntry, getActiveSong, getSelectedPatternPosition, selectPattern, setPatternSequence } from "../redux/songSlice";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useDispatch } from "react-redux";

const barWidth = 40;
const maxBars = 384;
const songTrackCount = 4;

const noSelect:SxProps = { userSelect: 'none' }; 

const Arrangement = React.memo(({ selectedPattern }:{ selectedPattern?: number }) => {
  const activeSong = useSelector(getActiveSong);
  const dispatch = useDispatch();
  const ptrn = useSelector(getSelectedPatternPosition);
  const [start, setStart] = useState(0);

  const [patternEntries, setPatternEntries] = useState<PatternEntry[]>([]);

  useEffect(() => {
    dispatch(setPatternSequence(patternEntries));
  }, [patternEntries]);

  const pageSize = 48;

  const pages = [
    {
      label: '1-48',
      start: 0,
    },
    { 
      label: '25-72',
      start: 24,
    },
    {
      label: '49-96',
      start: 48,
    },
    {
      label: '73-120',
      start: 72,
    },
    {
      label: '97-144',
      start: 96,
    },
    {
      label: '121-168',
      start: 120,
    },
    {
      label: '145-192',
      start: 144,
    },
    {
      label: '169-216',
      start: 168,
    },
    {
      label: '193-240',
      start: 192,
    },
    {
      label: '217-264',
      start: 216,
    },
    {
      label: '241-288',
      start: 240,
    },
    {
      label: '265-312',
      start: 264,
    },
    {
      label: '289-336',
      start: 288,
    },
    {
      label: '313-360',
      start: 312,
    },
    {
      label: '337-384',
      start: 336,
    },
  ]

  const pageBars = Array(maxBars).fill(0).map((_, idx) => idx).slice(start, start + pageSize);

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} color="black" textAlign="left" pl={0} mb={2}>
        Arrangement
      </Typography>
      <Grid container spacing={0} sx={{ mb: 1 }}>
            <Grid item xs={2}>
              <Box p={0} m={0} pl={1} py={1} borderLeft="1px solid black" borderBottom="2px solid black" width="100%" bgcolor="black" display="inline-block">
                <Typography sx={{...noSelect}} color="primary.contrastText" textAlign="left" pl={2}>Bar:</Typography>
              </Box>
              {[...Array(songTrackCount)].map((val, num) => (
                <Box p={0} m={0} pl={1} py={1} borderLeft="1px solid black" borderBottom="2px solid black" width={"100%"} bgcolor="primary.dark" display="inline-block">
                  <Typography sx={{...noSelect}} color="primary.contrastText" textAlign="left" pl={2}>
                    Track {num + 1}
                  </Typography>
                </Box>
              ))}
            </Grid>
            <Grid item xs={10}>
              <Box px={0} sx={{ overflowX: 'scroll' }} borderLeft="1px solid black" borderRight="1px solid black">
                <Box px={0} id="song-arranger" width={`${(barWidth + 9) * pageSize}px`} bgcolor="primary.dark">
                    {
                      [...pageBars].map((bar, idx) => 
                        <Box p={0} m={0} pl={1} py={1} borderLeft="1px solid black" borderBottom="2px solid black" width={barWidth} bgcolor="secondary.light" display="inline-block">
                          <Typography sx={{...noSelect}} color="primary.contrastText" textAlign="left" pl={0}>
                            {bar + 1}
                          </Typography>
                        </Box>
                      )
                    }
                  {
                    [...Array(songTrackCount)].map((val, num) => 
                      <Box>
                        {
                          [...pageBars].map((val, bar) => 
                            <Box p={0} m={0} pl={1} py={1} borderLeft="1px solid black" borderBottom="2px solid black" width={barWidth} bgcolor="primary.light" display="inline-block">
                              <Typography sx={{...noSelect}} color="primary.contrastText" textAlign="left" pl={2} onClick={() => {
                                console.log({
                                  position: selectedPattern,
                                  bar: bar + 1 + start,
                                  songTrack: num + 1,
                                } as PatternEntry);
                              }}>
                                &nbsp;
                              </Typography>
                            </Box>
                          )
                        }
                      </Box>
                    )
                  }

                </Box>
              </Box>
            </Grid>
      </Grid>

      <Typography variant="subtitle1" fontWeight={600} color="black" textAlign="left" pl={0} mb={1}>
        Bar Range
      </Typography>

      {pages.map(({ label, start: pageStart }) => (
        <Button
          
          variant={start === pageStart ? 'contained' : 'outlined'}
          sx={{ mr: 1, mb: 1, width: '92px' }}
          onClick={() => {
            setStart(pageStart);
          }}
        >
          {label}
        </Button>
      ))}

    </Box>
);
});

const SongArranger = () => {
  const { patterns } = useSelector(getActiveSong);

  const dispatch = useDispatch();

  const activePatterns = patterns
  .filter(p => (
    Boolean(p.steps.length) || p.name != `Pattern ${p.position}`
  ))
  ;

  const addEntry = console.log;

  const defaultPattern = activePatterns[0]?.position || 0;
  const [selectedPattern, setSelectedPattern] = useState(1);

  useEffect(() => {
    setSelectedPattern(defaultPattern);
  }, [defaultPattern]);

  // useEffect(() => {
  //   console.log('selectedPattern', selectedPattern);
  //   dispatch(selectPattern(selectedPattern));
  // }, [selectedPattern]);

  return (
    <Dialog 
      open={true} 
      onClose={() => {}}
      maxWidth="lg"
      fullWidth={true}
    >
      <DialogContent>
        <Grid container spacing={0}>
          <Grid item xs={3}>
            <Typography sx={{...noSelect}} variant="subtitle1" color="black" textAlign="left" pl={0} fontWeight={600}>Patterns</Typography>
            <Box p={0} m={0} mt={2}>
              {activePatterns.map((pattern) => (
                <Box
                  onClick={() => setSelectedPattern(pattern.position)}
                  sx={{ cursor: 'pointer' }} p={0} m={0} mb={1} pl={1} pr={2} py={1} border="1px solid black" borderBottom="2px solid black" width={"80%"} bgcolor={`warning.${selectedPattern === pattern.position ? 'dark' : 'main'}`}>
                  <Typography sx={{...noSelect}} variant="caption" fontWeight={600} color={`${selectedPattern === pattern.position ? 'white' : 'black'}`}>
                    {pattern.position}: {pattern.name} ({pattern.bars} bars)
                  </Typography>
                </Box>
              )
              )}
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Arrangement selectedPattern={selectedPattern} />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog> 
  );
};

export default SongArranger;