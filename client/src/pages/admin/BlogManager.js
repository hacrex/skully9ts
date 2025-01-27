import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Chip,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  Publish as PublishIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDate } from '../../utils/formatters';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  content: Yup.string().required('Content is required'),
  excerpt: Yup.string().required('Excerpt is required'),
  category: Yup.string().required('Category is required'),
  tags: Yup.array().of(Yup.string()),
  coverImage: Yup.string().required('Cover image is required')
});

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    'all',
    'news',
    'tutorials',
    'style-guides',
    'company',
    'product-updates'
  ];

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, categoryFilter]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `/api/admin/blog/posts?search=${searchQuery}&category=${categoryFilter}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: [],
      coverImage: '',
      status: 'draft'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint = editingPost
          ? `/api/admin/blog/posts/${editingPost._id}`
          : '/api/admin/blog/posts';
        
        const method = editingPost ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          handleCloseDialog();
          fetchPosts();
        }
      } catch (error) {
        console.error('Error saving blog post:', error);
      }
    }
  });

  const handleAddPost = () => {
    setEditingPost(null);
    formik.resetForm();
    setDialogOpen(true);
    setPreviewMode(false);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    formik.setValues({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      coverImage: post.coverImage,
      status: post.status
    });
    setDialogOpen(true);
    setPreviewMode(false);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`/api/admin/blog/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          fetchPosts();
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPost(null);
    formik.resetForm();
    setPreviewMode(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
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

      const data = await response.json();
      formik.setFieldValue('coverImage', data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handlePublish = async (postId) => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}/publish`, {
        method: 'PUT',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error publishing post:', error);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">
          Blog Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPost}
        >
          New Post
        </Button>
      </Box>

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Blog Posts Grid */}
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} lg={4} key={post._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={post.coverImage}
                alt={post.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {post.excerpt}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={post.category}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={post.status}
                    size="small"
                    color={post.status === 'published' ? 'success' : 'default'}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {formatDate(post.updatedAt)}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  onClick={() => handleEditPost(post)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeletePost(post._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
                {post.status === 'draft' && (
                  <IconButton
                    onClick={() => handlePublish(post._id)}
                    color="success"
                  >
                    <PublishIcon />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Post Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingPost ? 'Edit Post' : 'New Post'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="title"
                  label="Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="excerpt"
                  label="Excerpt"
                  value={formik.values.excerpt}
                  onChange={formik.handleChange}
                  error={formik.touched.excerpt && Boolean(formik.errors.excerpt)}
                  helperText={formik.touched.excerpt && formik.errors.excerpt}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formik.values.category}
                    label="Category"
                    onChange={formik.handleChange}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                  >
                    {categories.slice(1).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="tags"
                  label="Tags (comma separated)"
                  value={formik.values.tags.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim());
                    formik.setFieldValue('tags', tags);
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                  >
                    Upload Cover Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {formik.values.coverImage && (
                    <Typography variant="body2" color="text.secondary">
                      Image uploaded
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant={previewMode ? 'outlined' : 'contained'}
                    onClick={() => setPreviewMode(false)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={previewMode ? 'contained' : 'outlined'}
                    onClick={() => setPreviewMode(true)}
                  >
                    Preview
                  </Button>
                </Box>

                {previewMode ? (
                  <Paper sx={{ p: 2 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formik.values.content}
                    </ReactMarkdown>
                  </Paper>
                ) : (
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    name="content"
                    label="Content (Markdown)"
                    value={formik.values.content}
                    onChange={formik.handleChange}
                    error={formik.touched.content && Boolean(formik.errors.content)}
                    helperText={formik.touched.content && formik.errors.content}
                  />
                )}
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
              startIcon={<SaveIcon />}
            >
              {editingPost ? 'Save Changes' : 'Create Post'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default BlogManager;
