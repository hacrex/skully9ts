import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Paper
} from '@mui/material';
import { SketchPicker } from 'react-color';

const ProductCustomizer = ({ product, onCustomizationChange }) => {
  const [customText, setCustomText] = useState('');
  const [selectedFont, setSelectedFont] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textPlacement, setTextPlacement] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleCustomizationChange = () => {
    onCustomizationChange({
      text: customText,
      font: selectedFont,
      color: textColor,
      placement: textPlacement
    });
  };

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        Customize Your Design
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Custom Text"
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              handleCustomizationChange();
            }}
            helperText={`${customText.length}/${product.customizationOptions.maxTextLength} characters`}
            error={customText.length > product.customizationOptions.maxTextLength}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Font Style</InputLabel>
            <Select
              value={selectedFont}
              label="Font Style"
              onChange={(e) => {
                setSelectedFont(e.target.value);
                handleCustomizationChange();
              }}
            >
              {product.customizationOptions.availableFonts.map((font) => (
                <MenuItem key={font} value={font}>
                  {font}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Text Placement</InputLabel>
            <Select
              value={textPlacement}
              label="Text Placement"
              onChange={(e) => {
                setTextPlacement(e.target.value);
                handleCustomizationChange();
              }}
            >
              {product.customizationOptions.textPlacement.map((placement) => (
                <MenuItem key={placement} value={placement}>
                  {placement}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={() => setShowColorPicker(!showColorPicker)}
            sx={{ mb: 2 }}
          >
            {showColorPicker ? 'Close Color Picker' : 'Choose Text Color'}
          </Button>
          
          {showColorPicker && (
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <SketchPicker
                color={textColor}
                onChange={(color) => {
                  setTextColor(color.hex);
                  handleCustomizationChange();
                }}
              />
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Preview
          </Typography>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              p: 2,
              borderRadius: 1,
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography
              sx={{
                fontFamily: selectedFont || 'inherit',
                color: textColor,
                wordBreak: 'break-word',
                textAlign: 'center'
              }}
            >
              {customText || 'Your custom text will appear here'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProductCustomizer;
