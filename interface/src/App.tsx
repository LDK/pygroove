import './App.css';
import { Box, ThemeProvider } from '@mui/material';
import Header from './Header';
import SongDetailsBar from './components/SongDetailsBar';
import StepSequencer from './StepSequencer';
import { theme } from './theme/theme';
import ActionButtons from './components/ActionButtons';
import useApi from './hooks/useApi';
import { useState } from 'react';
import SongArranger from './components/SongArranger';
import AddTrackDialog from './dialogs/AddTrackDialog';

function App() {
  const bgTexture = `linear-gradient(to right bottom, #fdfdff, #f9f9ff, #f6f6ff, #f2f2ff, #efefff, #ececff, #e8e8fe, #e5e5fe, #e2e2fd, #dedefc, #dbdbfb, #d8d8fa);`;

  const { user, UserMenu, handleOpenUserMenu, setTokenExpired, tokenExpired, apiCall } = useApi();
  const [arrangerOpen, setArrangerOpen] = useState(false);
  const [addTrackOpen, setAddTrackOpen] = useState(false);

  // const SongArranger = useArranger();

  console.log('render app');

  return (
    <ThemeProvider theme={theme}>
      <Box id="app" maxHeight={'660px'} bgcolor="primary.main" position="relative" borderRadius={16} my={2} mx="auto" p={2} width="96%" sx={{ 
        borderColor: 'white',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}>
        <Box id="groovebox"
          overflow={"hidden"}
          position="relative"
          bgcolor="#f0f0f0"
          borderRadius={12}
          width="100%"
          height="90vh"
          sx={{
            backgroundImage: bgTexture,
            // backgroundSize: '10px 10px',
            // backgroundPosition: '0 0, 5px 5px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2);',          
          }}
        >
          <Header {...{
            user,
            UserMenu,
            handleOpenUserMenu,
            setTokenExpired,
            tokenExpired
          }} />
          <SongDetailsBar 
            openArranger={() => { setArrangerOpen(true); }} 
            openAddTrack={() => { setAddTrackOpen(true); }}
          />
          <StepSequencer />
          <ActionButtons />

        </Box>
      </Box>

      {arrangerOpen && <SongArranger open={true} handleClose={() => { setArrangerOpen(false); }} />}
      {addTrackOpen && <AddTrackDialog open={true} handleClose={() => { setAddTrackOpen(false); }} />}
    </ThemeProvider>
  );
}

export default App;
