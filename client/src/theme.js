import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff3d00',
      light: '#ff7539',
      dark: '#c30000',
    },
    secondary: {
      main: '#f5f5f5',
      light: '#ffffff',
      dark: '#c2c2c2',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: [
      'Cinzel Decorative',
      'Gothic A1',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Cinzel Decorative',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Cinzel Decorative',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'Cinzel Decorative',
      fontWeight: 600,
    },
    body1: {
      fontFamily: 'Gothic A1',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
