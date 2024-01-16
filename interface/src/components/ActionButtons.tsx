import { PlayArrowTwoTone } from "@mui/icons-material";
import { Box, Grid, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { getActiveSong } from "../redux/songSlice";
import { useState } from "react";
import { ApiCallProps } from "../hooks/useApi";
import { UserState } from "../redux/userSlice";
import RenderDialog from "../dialogs/RenderDialog";

interface ActionButtonsProps {
  user: UserState;
  apiCall: (props:ApiCallProps) => Promise<any>;
}

const ActionButtons = ({ user, apiCall }:ActionButtonsProps) => {
  const activeSong = useSelector(getActiveSong);
  const [rendering, setRendering] = useState<boolean>(false);

  return (
    <Box textAlign="center" position="absolute" bottom={0} zIndex={2} left={0} right={0} bgcolor="primary.dark" color="primary.contrastText" p={0}>
      <Grid container>
        <Grid item xs={4}>
          <Button variant="contained" color="primary" sx={{ float: 'right', my: 1, mr: 1 }}>
            <PlayArrowTwoTone sx={{ mr: 1 }} />
            Play
          </Button>
        </Grid>

        <Grid item xs={4}>
          <Button onClick={() => { setRendering(true); }} variant="contained" color="primary" sx={{ float: 'left', my: 1, ml: 1 }}>
            Render to MP3
          </Button>
        </Grid>

      </Grid>

      <RenderDialog open={rendering} onClose={() => { setRendering(false); }} song={activeSong} />
    </Box>
  );
}

export default ActionButtons;