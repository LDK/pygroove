import './App.css';
import { Box, Grid, ThemeProvider, Typography } from '@mui/material';
import Header from './Header';
import SongDetailsBar from './components/SongDetailsBar';
import StepSequencer from './StepSequencer';
import { theme } from './theme/theme';

function App() {
  // const bgTexture = `radial-gradient(circle, #fff 1px, transparent 1px), radial-gradient(circle, #fff 1px, transparent 1px);`;
  const bgTexture = `linear-gradient(to right bottom, #fdfdff, #f9f9ff, #f6f6ff, #f2f2ff, #efefff, #ececff, #e8e8fe, #e5e5fe, #e2e2fd, #dedefc, #dbdbfb, #d8d8fa);`;

  return (
    <ThemeProvider theme={theme}>
      <Box id="app" bgcolor="primary.main" borderRadius={16} my={2} mx="auto" p={2} width="96%" sx={{ 
        borderColor: 'white',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}>
        <Box id="groovebox"
          overflow={"hidden"}
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
          <Header />
          <SongDetailsBar />
          <StepSequencer />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
