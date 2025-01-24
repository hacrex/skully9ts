import { createTheme, alpha } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: {
            main: '#CC0000', // Darker red for light mode
            light: '#FF3333',
            dark: '#990000',
            contrastText: '#FFFFFF'
          },
          secondary: {
            main: '#00CC00', // Darker neon green for light mode
            light: '#33FF33',
            dark: '#009900',
            contrastText: '#000000'
          },
          background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
            accent: '#EEEEEE'
          },
          text: {
            primary: '#121212',
            secondary: '#666666',
            disabled: '#999999'
          },
          skull: {
            main: '#CC0000',
            accent: '#00CC00',
            border: '#CCCCCC'
          }
        }
      : {
          // Dark mode colors
          primary: {
            main: '#FF0000',
            light: '#FF3333',
            dark: '#CC0000',
            contrastText: '#FFFFFF'
          },
          secondary: {
            main: '#00FF00',
            light: '#33FF33',
            dark: '#00CC00',
            contrastText: '#000000'
          },
          background: {
            default: '#121212',
            paper: '#1E1E1E',
            accent: '#2D2D2D'
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
            disabled: '#666666'
          },
          skull: {
            main: '#FF0000',
            accent: '#00FF00',
            border: '#333333'
          }
        }),
    error: {
      main: '#FF0000'
    },
    warning: {
      main: '#FFA500'
    },
    info: {
      main: mode === 'light' ? '#00CC00' : '#00FF00'
    },
    success: {
      main: mode === 'light' ? '#00CC00' : '#00FF00'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"UnifrakturMaguntia", cursive',
      fontWeight: 700,
      letterSpacing: '0.02em'
    },
    h2: {
      fontFamily: '"UnifrakturMaguntia", cursive',
      fontWeight: 700,
      letterSpacing: '0.02em'
    },
    h3: {
      fontFamily: '"UnifrakturMaguntia", cursive',
      fontWeight: 700,
      letterSpacing: '0.02em'
    },
    h4: {
      fontFamily: '"UnifrakturMaguntia", cursive',
      fontWeight: 700,
      letterSpacing: '0.02em'
    },
    h5: {
      fontFamily: '"UnifrakturMaguntia", cursive',
      fontWeight: 700,
      letterSpacing: '0.02em'
    },
    h6: {
      fontFamily: '"UnifrakturMaguntia", cursive',
      fontWeight: 700,
      letterSpacing: '0.02em'
    },
    subtitle1: {
      fontFamily: '"Gothic A1", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.01em'
    },
    subtitle2: {
      fontFamily: '"Gothic A1", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.01em'
    },
    body1: {
      fontFamily: '"Gothic A1", sans-serif',
      letterSpacing: '0.01em'
    },
    body2: {
      fontFamily: '"Gothic A1", sans-serif',
      letterSpacing: '0.01em'
    },
    button: {
      fontFamily: '"Gothic A1", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase'
    }
  },
  shape: {
    borderRadius: 4
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => `
        @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;600;700&display=swap');
        
        body {
          background-color: ${theme.palette.background.default};
          color: ${theme.palette.text.primary};
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${theme.palette.background.paper};
        }

        ::-webkit-scrollbar-thumb {
          background: ${theme.palette.mode === 'light' ? '#CCCCCC' : '#333333'};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.palette.primary.main};
        }
      `
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`
          }
        }),
        contained: ({ theme }) => ({
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
          '&:hover': {
            background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`
          }
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.primary.main,
          '&:hover': {
            borderColor: theme.palette.primary.light,
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          }
        })
      }
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRadius: 0,
          border: `1px solid ${theme.palette.skull.border}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            transform: 'translateY(-4px)',
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
          }
        })
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, rgba(0,0,0,0) 100%)`
        })
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.skull.border}`
        })
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.skull.border}`,
          borderRadius: 0
        })
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            transform: 'scale(1.1)'
          }
        })
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.accent,
          borderRadius: 0,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light' 
              ? darken(theme.palette.background.accent, 0.05)
              : lighten(theme.palette.background.accent, 0.05)
          }
        })
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0
        }
      }
    }
  }
});

// Create a theme instance
const createAppTheme = (mode) => {
  const tokens = getDesignTokens(mode);
  return createTheme(tokens);
};

export default createAppTheme;

// Custom components using the theme
export const CustomComponents = {
  SkullDivider: ({ theme }) => ({
    width: '100%',
    height: '2px',
    background: `linear-gradient(90deg, 
      transparent 0%, 
      ${theme.palette.skull.border} 20%, 
      ${theme.palette.skull.main} 50%, 
      ${theme.palette.skull.border} 80%, 
      transparent 100%
    )`
  }),
  SkullBorder: ({ theme }) => ({
    border: `1px solid ${theme.palette.skull.border}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: theme.palette.skull.main,
      boxShadow: `0 0 10px ${alpha(theme.palette.skull.main, 0.3)}`
    }
  }),
  NeonText: ({ theme }) => ({
    color: theme.palette.skull.accent,
    transition: 'all 0.3s ease',
    textShadow: `0 0 5px ${theme.palette.skull.accent}, 
                 0 0 10px ${theme.palette.skull.accent}, 
                 0 0 20px ${theme.palette.skull.accent}`
  }),
  GlowingButton: ({ theme }) => ({
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      border: `2px solid ${theme.palette.skull.main}`,
      animation: 'glow 1.5s ease-in-out infinite alternate'
    },
    '@keyframes glow': {
      '0%': {
        boxShadow: `0 0 5px ${theme.palette.skull.main}, 
                    inset 0 0 5px ${theme.palette.skull.main}`
      },
      '100%': {
        boxShadow: `0 0 20px ${theme.palette.skull.main}, 
                    inset 0 0 10px ${theme.palette.skull.main}`
      }
    }
  })
};
