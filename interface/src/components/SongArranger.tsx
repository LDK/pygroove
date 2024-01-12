// Song Arranger.tsx
import { SxProps, Dialog, DialogContent, Grid, Typography, Box, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { Pattern, PatternEntry, addPatternEntry, getActiveSong, getPatternSequence, getSelectedPatternPosition, selectPattern, setPatternSequence } from "../redux/songSlice";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useDispatch } from "react-redux";
import useDialogUI from "../theme/useDialogUI";
import { ArrowUpwardTwoTone, ArrowDownwardTwoTone } from "@mui/icons-material";

const barWidth = 40;
const maxBars = 384;
const songTrackCount = 4;

const noSelect:SxProps = { userSelect: 'none' }; 

type ArrangementProps = {
  selectedPattern?: number;
  patterns: Pattern[];
  handleClose: () => void;
  startTrack: number;
}

type ArrangementLocation = {
  bar: number;
  songTrack: number;
}

const Arrangement = React.memo(({ selectedPattern, patterns, handleClose, startTrack }:ArrangementProps) => {
  // const activeSong = useSelector(getActiveSong);
  const dispatch = useDispatch();
  const [startBar, setStartBar] = useState(0);

  const initialEntries = useSelector(getPatternSequence);
  const [patternEntries, setPatternEntries] = useState<PatternEntry[]>(initialEntries);

  const [mouseDown, setMouseDown] = useState(0);

  // const overlapped:ArrangementLocation[] = useMemo(() => {
  //   const overlapped:ArrangementLocation[] = [];
  //   for (const key in patternEntries) {
  //     const entry = patternEntries[key];
  //     // console.log('entry', entry);
  //     if (entry.length > 1) {
  //       for (let i = 1; i < entry.length; i++) {
  //         overlapped.push({ bar: entry.bar + i, songTrack: entry.songTrack });
  //       }
  //     }
  //   }

  //   // console.log('overlapped', overlapped);
  //   // console.log('entries', patternEntries);
  //   return overlapped;
  // }, [patternEntries]);

  useEffect(() => {
    console.log('reset to initial', initialEntries);
  }, [initialEntries]);

  // const [overlapped, setOverlapped] = useState<ArrangementLocation[]>(initialOverlapped);

  const wouldOverlap = (bar:number, songTrack:number) => {
    const maxBar = bar + (pattern?.bars || 1) - 1;
    let reach = bar;

    const overlaps:ArrangementLocation[] = [];

    while (reach <= maxBar) {
      const o = patternEntries.find(pe => pe.bar === reach && pe.songTrack === songTrack);
      if (o) {
        overlaps.push(o);
      }
      reach++;
    }

    return overlaps;

  };

  const patternMap:{ [key:string]: PatternEntry } = useMemo(() => {
    let map:{ [key:string]: PatternEntry } = {};

    patternEntries.forEach(pe => {
      map[`${pe.bar}-${pe.songTrack}`] = pe;
    });

    return map;
  }, [patternEntries]);

  const pattern = useMemo(() => patterns.find(p => p.position === selectedPattern), [selectedPattern, patterns]);

  // useEffect(() => {
  //   dispatch(setPatternSequence(patternEntries));
  // }, [patternEntries]);

  const { DialogActionButtons } = useDialogUI();
  
  if (!pattern) {
    return null;
  }

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

  const pageBars = Array(maxBars).fill(0).map((_, idx) => idx).slice(startBar, startBar + pageSize);
 
  // const addOverlap = ({ bar, songTrack }:ArrangementLocation) => {
  //   const newOverlap = [...overlapped, { bar, songTrack }];
  //   setOverlapped(newOverlap);
  // };

  const cellClick = ({ bar, songTrack, overwrite, overwriteOverlap }: { bar: number; songTrack: number, overwrite?: boolean, overwriteOverlap?: boolean }) => {

    console.log('cell click', bar, songTrack, overwrite, overwriteOverlap);
    if (selectedPattern) {
      const newEntry:PatternEntry = {
        position: selectedPattern,
        bar: bar,
        songTrack,
        length: pattern.bars
      };

      const existing = patternEntries.length ? patternEntries.find(pe => pe.bar === newEntry.bar && pe.songTrack === newEntry.songTrack) : undefined;
      // console.log('existing', existing);
      // console.log('pattern entries', patternEntries);

      // If we are overwriting existing entries
      if (overwrite) {
        const overlaps = wouldOverlap(bar, songTrack);

        // If the new entry would overlap with an existing entry and we are overwriting overlaps
        if (overlaps.length && overwriteOverlap) {
          // Remove overlaps and add the new entry
          console.log('removing overlaps', overlaps);
          setPatternEntries([...patternEntries.filter(
            pe => !overlaps.find(o => o.bar === pe.bar && o.songTrack === pe.songTrack)
          ), newEntry]);

          // addOverlap({ bar, songTrack });
          // If there is an existing entry in the same spot
          if (existing)  {
            console.log('removing existing', existing);
            // Remove existing entry
            setPatternEntries([...patternEntries.filter(pe => pe.bar !== existing.bar && pe.songTrack !== existing.songTrack)]);
          }
        } else if (overlaps.length && !overwriteOverlap) {
          return;
        } else if (existing) {
          // addOverlap({ bar, songTrack });
          console.log('setting entries', existing);
          setPatternEntries([...patternEntries.filter(pe => pe.bar !== existing.bar && pe.songTrack !== existing.songTrack), newEntry]);
        } else {
          console.log('no overlaps or existing, so just adding new entry');
          // No overlaps or existing, so just adding new entry
          setPatternEntries([...patternEntries, newEntry]);
        }
      // If there is no existing entry, no overlaps, and we are not overwriting (existing or overlaps)
      } else if (!existing && !wouldOverlap(bar, songTrack).length) {
        // Just add the new entry
        console.log('adding new entry', newEntry);
        setPatternEntries([...patternEntries, newEntry]);
      }

    }
  }

  const BarCell = ({ bar, songTrack }: { bar: number; songTrack: number }) => {
    const key = `${bar}-${songTrack}`;

    return (
      <Box p={0} m={0} pl={0} position="relative" borderLeft="1px solid black" borderBottom="1px solid black" width={barWidth + 8} 
        bgcolor="primary.light" height={40}
        onMouseUp={(e) => {
          e.stopPropagation();
          setMouseDown(0);
        }}
        onClick={(e) => {
          e.stopPropagation();
          cellClick({ bar, songTrack, overwrite: true, overwriteOverlap: true });
        }}
        // onMouseEnter={(e) => {
        //   if (mouseDown === songTrack && !overlapped.find(o => o.bar === bar && o.songTrack === songTrack)) {
        //     // console.log('drawing at', bar, songTrack);
        //     cellClick({ bar, songTrack, overwrite: true, overwriteOverlap: true });
        //   }
        // }}
        display="inline-block"
        sx={{
          cursor: 'pointer'
        }}
      >
        {Boolean(patternMap[key]) && <BarMarker entry={patternMap[key]} />}
      </Box>
    );
  };

  const BarMarker = ({ entry }: { entry: PatternEntry }) => {
    const width = `${100 * (entry.length || 1)}%`;

    const barClick = () => {
      setMouseDown(0);
      console.log('bar click', entry);
      const existing = patternEntries.find(pe => pe.bar === entry.bar && pe.songTrack === entry.songTrack);
      if (existing) {
        const filtered = patternEntries.filter((pe) => {
          return (pe.bar !== existing.bar || pe.songTrack !== existing.songTrack);
        });
        console.log('filtered', filtered, existing, patternEntries);
        setPatternEntries(filtered);
      }
    }

    return (
      <Box p={0} m={0} width={width} position="absolute" zIndex={5} height="100%" top={0} left={0}
        bgcolor="warning.light"
        display="block"
        sx={{ cursor: 'crosshair' }}
        onMouseEnter={(e) => {
          setMouseDown(0);
        }}
        onClick={(e) => {
          e.stopPropagation();
          barClick();
        }}>
        <Typography sx={{...noSelect}} px={0} height="100%" color="primary.contrastText" textAlign="center">
          {entry.position}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Button onClick={() => {
        setPatternEntries([]);
      }}>Clear</Button>
      <Grid container spacing={0} sx={{ mb: 1 }}>
            <Grid item xs={2}>
              <Box p={0} m={0} pl={1} py={1} borderLeft="1px solid black" borderBottom="1px solid black" width="100%" bgcolor="black" display="inline-block">
                <Typography sx={{...noSelect}} color="primary.contrastText" textAlign="left" pl={2}>Bar:</Typography>
              </Box>
              {[...Array(songTrackCount)].map((val, num) => (
                <Box p={0} m={0} pl={1} py={1} borderLeft="1px solid black" borderBottom="1px solid black" width={"100%"} bgcolor="primary.dark" display="inline-block">
                  <Typography sx={{...noSelect}} color="primary.contrastText" textAlign="left" pl={2}>
                    Track {num + 1 + startTrack}
                  </Typography>
                </Box>
              ))}
            </Grid>
            <Grid item xs={10}>
              <Box px={0} sx={{ overflowX: 'scroll', overflowY: 'hidden' }} borderLeft="1px solid black" borderRight="1px solid black"
                onMouseUp={() => {
                  setMouseDown(0);
                }}
              >
                <Box px={0} id="song-arranger" width={`${(barWidth + 9) * pageSize}px`} bgcolor="primary.dark">
                    {
                      [...pageBars].map((bar, idx) => 
                        <Box p={0} m={0} pl={1} py={1} borderLeft="1px solid black" borderBottom="1px solid black" width={barWidth} bgcolor="secondary.light" display="inline-block">
                          <Typography sx={{...noSelect}} color="primary.contrastText" textAlign="left" pl={0}>
                            {bar + 1}
                          </Typography>
                        </Box>
                      )
                    }
                  {
                    [...Array(songTrackCount)].map((val, num) => 
                      <Box maxHeight={41}
                        // onMouseDown={(e) => {
                          // setDrawing(num + 1);
                          // e.stopPropagation();
                        // }}
                      >
                        {
                          [...pageBars].map((val, bar) => <BarCell bar={bar + 1 + startBar} songTrack={num + 1 + startTrack} />)
                        }
                      </Box>
                    )
                  }

                </Box>
              </Box>
            </Grid>
      </Grid>

      <Typography variant="subtitle1" fontWeight={600} color="black" textAlign="left" pl={0} mt={1} mb={2}>
        Bar Range
      </Typography>

      {pages.map(({ label, start: pageStart }) => (
        <Button
          
          variant={startBar === pageStart ? 'contained' : 'outlined'}
          sx={{ mr: 1, mb: 1, width: '92px' }}
          onClick={() => {
            setStartBar(pageStart);
          }}
        >
          {label}
        </Button>
      ))}

      <DialogActionButtons
          onCancel={() => {
            handleClose();
          }}
          confirmLabel="Save"
          onConfirm={() => {
            dispatch(setPatternSequence(patternEntries)); 
            handleClose();
          }}
      />

    </Box>
);
});

const SongArranger = ({ open, handleClose }:{ open: boolean, handleClose: () => void }) => {
  const { patterns } = useSelector(getActiveSong);

  const activePatterns = patterns.filter(p => (
    Boolean(p.steps.length) || p.name != `Pattern ${p.position}`
  ));

  const defaultPattern = activePatterns[0]?.position || 0;
  const [selectedPattern, setSelectedPattern] = useState(1);
  const [saveCallback, setSaveCallback] = useState<(arg?:PatternEntry) => void>(() => {});
  const [startTrack, setStartTrack] = useState(0);

  useEffect(() => {
    setSelectedPattern(defaultPattern);
  }, [defaultPattern]);

  return (
    <Dialog 
      open={open} 
      onClose={() => {}}
      maxWidth="lg"
      fullWidth={true}
    >
      <DialogContent>
        <Grid container spacing={0}>
          <Grid item xs={3}>
            <Typography sx={{...noSelect}} variant="subtitle1" color="black" textAlign="left" pl={0} fontWeight={600}>Patterns</Typography>
            <Box p={0} m={0} mt={2} height={394} sx={{ overflowY: 'scroll' }}>
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
          <Grid item xs={1} sx={{ textAlign: 'right', pr: 2, pt: 4, height: '100%' }}>
            <Box position="relative" height={205}>
              <Box position="absolute" bottom={0} right={0}>
                <ArrowDownwardTwoTone sx={{ cursor: 'pointer' }} onClick={() => {
                  setStartTrack(startTrack + 1);
                } } />
              </Box>
              <Box position="absolute" top={0} right={0}>
                <ArrowUpwardTwoTone sx={{ cursor: 'pointer' }} onClick={() => {
                  setStartTrack(startTrack - 1);
                } } />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Arrangement {...{ selectedPattern, patterns, saveCallback, handleClose, startTrack }} />
          </Grid>
        </Grid>

      </DialogContent>
    </Dialog> 
  );
};

export default SongArranger;