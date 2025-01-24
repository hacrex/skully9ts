import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../theme/ThemeContext';

const ThemeSwitcher = ({ sx = {} }) => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'rotate(180deg)',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)'
          },
          ...sx
        }}
      >
        {mode === 'dark' ? (
          <Brightness7 sx={{ color: theme.palette.primary.main }} />
        ) : (
          <Brightness4 sx={{ color: theme.palette.primary.main }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;
