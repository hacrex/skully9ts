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
  ListItemSecondary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  FormControlLabel,
  Switch,
  Collapse,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  slug: Yup.string().required('Slug is required'),
  description: Yup.string()
});

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      slug: '',
      description: '',
      parentId: null,
      isActive: true,
      showInMenu: true,
      showInFilters: true,
      image: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint = editingCategory
          ? `/api/admin/categories/${editingCategory._id}`
          : '/api/admin/categories';
        
        const method = editingCategory ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(editingCategory ? 'Category updated successfully' : 'Category added successfully');
          handleCloseDialog();
          fetchCategories();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to save category');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    formik.setValues({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId,
      isActive: category.isActive,
      showInMenu: category.showInMenu,
      showInFilters: category.showInFilters,
      image: category.image || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          setSuccess('Category deleted successfully');
          fetchCategories();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete category');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    formik.resetForm();
  };

  const handleExpandCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedCategories = Array.from(categories);
    const [removed] = reorderedCategories.splice(result.source.index, 1);
    reorderedCategories.splice(result.destination.index, 0, removed);

    setCategories(reorderedCategories);

    try {
      const response = await fetch('/api/admin/categories/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          categories: reorderedCategories.map((cat, index) => ({
            id: cat._id,
            order: index
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update category order');
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
      fetchCategories(); // Revert to original order
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        },
        body: formData
      });

      if (response.ok) {
        const { url } = await response.json();
        formik.setFieldValue('image', url);
        setSelectedImage(url);
        setSuccess('Image uploaded successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const renderCategoryTree = (parentId = null, level = 0) => {
    const filteredCategories = categories.filter(cat => cat.parentId === parentId);

    return (
      <List component="div" disablePadding>
        {filteredCategories.map((category, index) => {
          const hasChildren = categories.some(cat => cat.parentId === category._id);
          const isExpanded = expandedCategories[category._id];

          return (
            <React.Fragment key={category._id}>
              <ListItem
                sx={{
                  pl: level * 4,
                  bgcolor: level === 0 ? 'background.paper' : 'transparent'
                }}
              >
                <ListItemIcon>
                  <DragIcon />
                </ListItemIcon>
                <ListItemIcon>
                  {hasChildren ? (
                    <IconButton
                      onClick={() => handleExpandCategory(category._id)}
                      size="small"
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  ) : (
                    <CategoryIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category.name}
                      {!category.isActive && (
                        <Chip
                          label="Hidden"
                          size="small"
                          icon={<VisibilityOffIcon />}
                        />
                      )}
                    </Box>
                  }
                  secondary={category.description}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={() => handleEditCategory(category)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteCategory(category._id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              {hasChildren && isExpanded && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {renderCategoryTree(category._id, level + 1)}
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    );
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
              Categories
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCategory}
            >
              Add Category
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

      <Paper sx={{ mb: 4 }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {renderCategoryTree()}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
            {editingCategory ? 'Edit Category' : 'Add Category'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Category Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="slug"
                  label="URL Slug"
                  value={formik.values.slug}
                  onChange={formik.handleChange}
                  error={formik.touched.slug && Boolean(formik.errors.slug)}
                  helperText={formik.touched.slug && formik.errors.slug}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isActive}
                      onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.showInMenu}
                      onChange={(e) => formik.setFieldValue('showInMenu', e.target.checked)}
                    />
                  }
                  label="Show in Menu"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {formik.values.image && (
                    <Box
                      component="img"
                      src={formik.values.image}
                      alt="Category"
                      sx={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={editingCategory ? <EditIcon /> : <AddIcon />}
            >
              {editingCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Categories;
