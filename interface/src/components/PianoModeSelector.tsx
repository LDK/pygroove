import { Grid } from "@mui/material";
import { 
  ClearTwoTone as EraseIcon,
  DrawTwoTone as DrawIcon,
  LocationSearchingTwoTone as SelectIcon,
  ContentCutTwoTone as SliceIcon,
} from "@mui/icons-material";

type ModeType = 'select' | 'draw' | 'erase' | 'slice';

const ModeSelector = ({ mode, setMode }:{ mode:ModeType, setMode: (mode:ModeType) => void }) => (
  <Grid container spacing={0}>
    <Grid item xs={3} textAlign={"center"}>
      <SelectIcon 
        onClick={() => setMode('select')}
        sx={{ color: (mode === 'select' ? 'warning.light' : 'white'), width: '.75em', fontSize: '2rem', cursor: 'pointer' }} />
    </Grid>

    <Grid item xs={3}textAlign={"center"}>
      <DrawIcon 
        onClick={() => setMode('draw')}
        sx={{ color: (mode === 'draw' ? 'warning.light' : 'white'), width: '.75em', fontSize: '2rem', cursor: 'pointer' }} />
    </Grid>

    <Grid item xs={3} textAlign={"center"}>
      <EraseIcon
        onClick={() => setMode('erase')}
        sx={{ color: (mode === 'erase' ? 'warning.light' : 'white'), width: '.75em', fontSize: '2rem', cursor: 'pointer' }} />
    </Grid>

    <Grid item xs={3} textAlign={"center"}>
      <SliceIcon
        onClick={() => setMode('slice')}
        sx={{ color: (mode === 'slice' ? 'warning.light' : 'white'), width: '.75em', fontSize: '2rem', cursor: 'pointer' }} />
    </Grid>
  </Grid>
);

export default ModeSelector;