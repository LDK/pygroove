import { Button, Grid, TextField, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getActiveSong, setAuthor, setBpm, setSongTitle, setSwing } from "../redux/songSlice";
import { EditTwoTone } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Range from "./Range";

const SongDetailsBar = () => {
  const { title, author, bpm, swing } = useSelector(getActiveSong);

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
  }, [editTitle, workingTitle, dispatch, title]);

  // When we stop editing the author, set the author to the working author, if it has changed
  useEffect(() => {
    if (!editAuthor && workingAuthor !== author) {
      dispatch(setAuthor(workingAuthor));
    }
  }, [editAuthor, workingAuthor, dispatch, author]);

  // When we change the bpm, set the bpm to the working bpm, if it has changed
  useEffect(() => {
    if (workingBpm !== bpm) {
      dispatch(setBpm(workingBpm));
    }
  }, [workingBpm, bpm, dispatch]);

  return (
    <Grid id="song-details-bar" container bgcolor="primary.light">
      {/* Meta Section */}
      <Grid item xs={4} sx={{ borderRight: '1px solid #ccc', px: 4, py: 2 }}>
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

      {/* Song Section */}
      <Grid item xs={4} sx={{ borderRight: '1px solid #ccc', px: 4, py: 2 }}>
        <Grid container>
          <Grid item xs={6}>
            <Typography display="inline-block" pr={1}>BPM: </Typography>
            <input type="number" step={1} min={1} max={999} defaultValue={bpm} style={{ width: '3rem' }} onChange={(e) => {
              setWorkingBpm(parseInt(e.target.value) || bpm);
            }} />
          </Grid>
          <Grid item xs={6}>
            <Range
              defaultValue={swing || 0}
              onBlur={(e) => {
                dispatch(setSwing(parseFloat(e.target.value)));
              }}
              step={0.01}
              min={0}
              max={1}
              label="Swing" 
              percentage 
            />
          </Grid>
          <Grid item xs={12}>
            <Typography>Pattern Sequence</Typography>
          </Grid>
        </Grid>
      </Grid>

      {/* Pattern Section */}
      <Grid item xs={4} sx={{ px: 4, py: 2 }}>
        <Typography>Pattern Selector</Typography>
        <Typography>New * Delete * Copy * Rename</Typography>
      </Grid>
    </Grid>
)};

export default SongDetailsBar;