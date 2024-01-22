import { Button, Grid, TextField, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getActiveSong, setAuthor, setBpm, setLoading, setSongTitle, setSwing } from "../redux/songSlice";
import { EditTwoTone } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import Range from "./Range";
import PatternManagement, { TextLink } from "./PatternManagement";

type SongDetailsProps = {
  openArranger: () => void;
  openAddTrack: () => void;
};

const SongDetailsBar = ({ openArranger, openAddTrack }:SongDetailsProps) => {
  const { title, author, bpm, swing, loading } = useSelector(getActiveSong);

  const [editTitle, setEditTitle] = useState(false);
  const [editAuthor, setEditAuthor] = useState(false);
  const [workingTitle, setWorkingTitle] = useState(title);
  const [workingAuthor, setWorkingAuthor] = useState(author || '');
  const [workingBpm, setWorkingBpm] = useState(bpm);

  const dispatch = useDispatch();

  // When we stop editing the title, set the title to the working title, if it has changed
  useEffect(() => {
    if (!editTitle && workingTitle !== title) {
      dispatch(setSongTitle(workingTitle));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTitle, workingTitle, dispatch]);

  useEffect(() => {
    if (loading) {
      setWorkingTitle(title);
      setWorkingAuthor(author || '');
      setWorkingBpm(bpm);
      dispatch(setLoading(false));
      return;
    }
  }, [loading, title, author, bpm, dispatch]);

  // When we stop editing the author, set the author to the working author, if it has changed
  useEffect(() => {
    if (!editAuthor && workingAuthor !== author) {
      dispatch(setAuthor(workingAuthor));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editAuthor, workingAuthor, dispatch]);

  // When we change the bpm, set the bpm to the working bpm, if it has changed
  useEffect(() => {
    if (workingBpm !== bpm && !loading) {
      dispatch(setBpm(workingBpm));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingBpm, dispatch, loading]);

  const swingSlider = useMemo(() => {
    return (
      <Range
        defaultValue={swing || 0}
        onBlur={(e) => {
          if (!loading) {
            dispatch(setSwing(parseFloat(e.target.value)));
          }
        }}
        step={0.01}
        min={0}
        max={1}
        labelPrefix="Swing: "
        percentage 
      />
    );
  }, [swing, loading, dispatch]);

  const bpmInput = useMemo(() => {
   return (
    <input type="number" step={1} min={1} max={999} defaultValue={bpm} value={bpm} style={{ width: '3rem' }} onChange={(e) => {
      setWorkingBpm(parseInt(e.target.value) || bpm);
    }} />
   )}, [bpm]);

  return (
    <Grid id="song-details-bar" container bgcolor="primary.light">
      {/* Meta Section */}
      <Grid item xs={4} sx={{ borderRight: '1px solid #ccc', px: 4, py: 2 }}>
        <Grid container spacing={0}>
          <Grid item xs={12} xl={7}>
            { 
              !editTitle ?
                <Typography display="inline-block">Title: {title}</Typography> :
                <TextField
                  id="title"
                  label="Title"
                  defaultValue={title}
                  variant="standard"
                  sx={{ width: '100%' }}
                  onKeyDown={(e) => {
                    // If enter is pressed, set editing to false
                    if (e.key === 'Enter') {
                      setEditTitle(false);
                    }
                  }}
                  onChange={(e) => {
                    setWorkingTitle(e.target.value);
                  }}
                />
            }
            { !editTitle &&
              <EditTwoTone sx={{ 
                display: 'inline-block',
                position: 'relative',
                top: '.3rem',
                width: '1rem',
                pl: 1,
                cursor: 'pointer'
              }} 
                onClick={() => {
                  setEditTitle(true);
                }}
              />
            }
            { editTitle && 
              <Button
                variant="contained"
                sx={{ textAlign: 'center', py: 0, my: 1 }}
                onClick={() => {
                  setEditTitle(false);
                }}>
                  Save
                </Button>
            }

            <br />
            { 
              !editAuthor ?
                <Typography display="inline-block">Author: {author}</Typography> :
                <TextField
                  id="author"
                  label="Author"
                  defaultValue={author}
                  variant="standard"
                  sx={{ width: '100%' }}
                  onKeyDown={(e) => {
                    // If enter is pressed, set editing to false
                    if (e.key === 'Enter') {
                      setEditAuthor(false);
                    }
                  }}
                  onChange={(e) => {
                    setWorkingAuthor(e.target.value);
                  }}
                />
            }
            { !editAuthor &&
              <EditTwoTone sx={{ 
                display: 'inline-block',
                position: 'relative',
                top: '.3rem',
                width: '1rem',
                pl: 1,
                cursor: 'pointer'
              }} 
                onClick={() => {
                  setEditAuthor(true);
                }}
              />
            }
            { editAuthor && 
              <Button
                variant="contained"
                sx={{ textAlign: 'center', py: 0, my: 1 }}
                onClick={() => {
                  setEditAuthor(false);
                }}>
                  Save
                </Button>
            }
          </Grid>

          <Grid item xs={12} xl={5} sx={{ pt: 1 }}>
            <TextLink text="Pattern Sequence" variant="subtitle2" onClick={() => {
              openArranger();
            }} />

            <br />

            <TextLink text="Add Track" variant="subtitle2" onClick={() => {
              openAddTrack();
            }} />
          </Grid>

        </Grid>
      </Grid>

      {/* Song Section */}
      <Grid item xs={4} sx={{ borderRight: '1px solid #ccc', px: 4, py: 2 }}>
        <Grid container>
          <Grid item xs={6}>
            <Typography display="inline-block" pr={1}>BPM: </Typography>
            {bpmInput}
          </Grid>
          <Grid item xs={6}>
            {swingSlider}
          </Grid>
        </Grid>
      </Grid>

      {/* Pattern Section */}
      <Grid item xs={4} sx={{ px: 4, py: 2, textAlign: 'center' }}>
        <PatternManagement />
      </Grid>
    </Grid>
)};

export default SongDetailsBar;