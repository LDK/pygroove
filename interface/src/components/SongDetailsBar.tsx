import { Grid, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { getActiveSong } from "../redux/songSlice";

const SongDetailsBar = () => {
  const { title, author, bpm, swing } = useSelector(getActiveSong);

  return (
    <Grid id="song-details-bar" container bgcolor="primary.light">
      {/* Meta Section */}
      <Grid item xs={4} sx={{ borderRight: '1px solid #ccc', px: 4, py: 2 }}>
        <Typography>Title: {title}</Typography>
        <Typography>Author: {author}</Typography>
      </Grid>

      {/* Song Section */}
      <Grid item xs={4} sx={{ borderRight: '1px solid #ccc', px: 4, py: 2 }}>
        <Typography>BPM: {bpm}</Typography>
        <Typography>Swing: {swing}</Typography>
        <Typography>Pattern Sequence</Typography>
      </Grid>

      {/* Pattern Section */}
      <Grid item xs={4} sx={{ px: 4, py: 2 }}>
        <Typography>Pattern Selector</Typography>
        <Typography>New * Delete * Copy * Rename</Typography>
      </Grid>
    </Grid>
)};

export default SongDetailsBar;