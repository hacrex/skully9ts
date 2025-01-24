import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Label as LabelIcon,
  ColorLens as ColorIcon,
  FormatSize as SizeIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { SketchPicker } from 'react-color';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  type: Yup.string().required('Type is required'),
  displayName: Yup.string().required('Display name is required')
});

const Attributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const response = await fetch('/api/admin/attributes', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setAttributes(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      setError('Failed to load attributes');
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      type: 'text',
      displayName: '',
      description: '',
      required: false,
      filterable: true,
      visible: true,
      values: []
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint = editingAttribute
          ? `/api/admin/attributes/${editingAttribute._id}`
          : '/api/admin/attributes';
        
        const method = editingAttribute ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(editingAttribute ? 'Attribute updated successfully' : 'Attribute added successfully');
          handleCloseDialog();
          fetchAttributes();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to save attribute');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  });

  const handleAddAttribute = () => {
    setEditingAttribute(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditAttribute = (attribute) => {
    setEditingAttribute(attribute);
    formik.setValues({
      name: attribute.name,
      type: attribute.type,
      displayName: attribute.displayName,
      description: attribute.description || '',
      required: attribute.required,
      filterable: attribute.filterable,
      visible: attribute.visible,
      values: attribute.values || []
    });
    setDialogOpen(true);
  };

  const handleDeleteAttribute = async (attributeId) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      try {
        const response = await fetch(`/api/admin/attributes/${attributeId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          setSuccess('Attribute deleted successfully');
          fetchAttributes();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete attribute');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAttribute(null);
    formik.resetForm();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedAttributes = Array.from(attributes);
    const [removed] = reorderedAttributes.splice(result.source.index, 1);
    reorderedAttributes.splice(result.destination.index, 0, removed);

    setAttributes(reorderedAttributes);

    try {
      const response = await fetch('/api/admin/attributes/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          attributes: reorderedAttributes.map((attr, index) => ({
            id: attr._id,
            order: index
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update attribute order');
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
      fetchAttributes(); // Revert to original order
    }
  };

  const handleAddValue = () => {
    const values = [...formik.values.values];
    values.push({
      value: '',
      label: '',
      color: selectedColor
    });
    formik.setFieldValue('values', values);
  };

  const handleRemoveValue = (index) => {
    const values = [...formik.values.values];
    values.splice(index, 1);
    formik.setFieldValue('values', values);
  };

  const handleValueChange = (index, field, value) => {
    const values = [...formik.values.values];
    values[index][field] = value;
    formik.setFieldValue('values', values);
  };

  const getAttributeIcon = (type) => {
    switch (type) {
      case 'color':
        return <ColorIcon />;
      case 'size':
        return <SizeIcon />;
      default:
        return <LabelIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="h4">
              Product Attributes
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAttribute}
            >
              Add Attribute
            </Button>
          </Grid>
        </Grid>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Values</TableCell>
                <TableCell>Settings</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attributes.map((attribute) => (
                <TableRow key={attribute._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getAttributeIcon(attribute.type)}
                      {attribute.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={attribute.type}
                      size="small"
                      color={attribute.type === 'color' ? 'secondary' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>{attribute.displayName}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {attribute.values?.map((value, index) => (
                        <Chip
                          key={index}
                          label={value.label}
                          size="small"
                          style={
                            attribute.type === 'color'
                              ? {
                                  backgroundColor: value.color,
                                  color: getContrastText(value.color)
                                }
                              : undefined
                          }
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Required">
                        <Chip
                          label="Required"
                          size="small"
                          color={attribute.required ? 'primary' : 'default'}
                        />
                      </Tooltip>
                      <Tooltip title="Filterable">
                        <Chip
                          label="Filterable"
                          size="small"
                          color={attribute.filterable ? 'primary' : 'default'}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditAttribute(attribute)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteAttribute(attribute._id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingAttribute ? 'Edit Attribute' : 'Add Attribute'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Attribute Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="color">Color</MenuItem>
                    <MenuItem value="size">Size</MenuItem>
                    <MenuItem value="select">Select</MenuItem>
                    <MenuItem value="multiselect">Multi-Select</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="displayName"
                  label="Display Name"
                  value={formik.values.displayName}
                  onChange={formik.handleChange}
                  error={formik.touched.displayName && Boolean(formik.errors.displayName)}
                  helperText={formik.touched.displayName && formik.errors.displayName}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.required}
                      onChange={(e) => formik.setFieldValue('required', e.target.checked)}
                    />
                  }
                  label="Required"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.filterable}
                      onChange={(e) => formik.setFieldValue('filterable', e.target.checked)}
                    />
                  }
                  label="Filterable"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.visible}
                      onChange={(e) => formik.setFieldValue('visible', e.target.checked)}
                    />
                  }
                  label="Visible"
                />
              </Grid>

              {['color', 'size', 'select', 'multiselect'].includes(formik.values.type) && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Attribute Values
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddValue}
                    >
                      Add Value
                    </Button>
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Value</TableCell>
                          <TableCell>Label</TableCell>
                          {formik.values.type === 'color' && (
                            <TableCell>Color</TableCell>
                          )}
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formik.values.values.map((value, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                size="small"
                                value={value.value}
                                onChange={(e) => handleValueChange(index, 'value', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={value.label}
                                onChange={(e) => handleValueChange(index, 'label', e.target.value)}
                              />
                            </TableCell>
                            {formik.values.type === 'color' && (
                              <TableCell>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: value.color,
                                    border: '1px solid #ccc',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setSelectedColor(value.color);
                                    setColorPickerOpen(true);
                                  }}
                                />
                              </TableCell>
                            )}
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveValue(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={editingAttribute ? <EditIcon /> : <AddIcon />}
            >
              {editingAttribute ? 'Update Attribute' : 'Add Attribute'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Color Picker Dialog */}
      <Dialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
      >
        <DialogTitle>Choose Color</DialogTitle>
        <DialogContent>
          <SketchPicker
            color={selectedColor}
            onChange={(color) => setSelectedColor(color.hex)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorPickerOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const values = [...formik.values.values];
              const index = values.findIndex(v => v.color === selectedColor);
              if (index !== -1) {
                values[index].color = selectedColor;
                formik.setFieldValue('values', values);
              }
              setColorPickerOpen(false);
            }}
          >
            Apply Color
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const getContrastText = (hexcolor) => {
  // Convert hex to RGB
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default Attributes;
