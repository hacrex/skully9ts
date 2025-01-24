import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  IconButton,
  TextField,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/formatters';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const [postResponse, relatedResponse] = await Promise.all([
        fetch(`/api/blog/posts/${slug}`),
        fetch(`/api/blog/posts/${slug}/related`)
      ]);

      const postData = await postResponse.json();
      const relatedData = await relatedResponse.json();

      setPost(postData);
      setRelatedPosts(relatedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        setLiked(!liked);
        setPost({
          ...post,
          likes: liked ? post.likes - 1 : post.likes + 1
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ content: comment })
      });

      if (response.ok) {
        const newComment = await response.json();
        setPost({
          ...post,
          comments: [...post.comments, newComment]
        });
        setComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post.title;
    let shareUrl;

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Post not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/blog')}
        >
          Back to Blog
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Chip
            label={post.category.replace('-', ' ')}
            sx={{ mb: 2, textTransform: 'capitalize' }}
          />
          <Typography variant="h2" component="h1" gutterBottom>
            {post.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={post.author.avatar} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="subtitle1">
                {post.author.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(post.createdAt)} · {post.readingTime} min read
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleLike} color={liked ? 'primary' : 'default'}>
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton onClick={() => handleShare('facebook')}>
              <FacebookIcon />
            </IconButton>
            <IconButton onClick={() => handleShare('twitter')}>
              <TwitterIcon />
            </IconButton>
            <IconButton onClick={() => handleShare('linkedin')}>
              <LinkedInIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Cover Image */}
        <Box
          component="img"
          src={post.coverImage}
          alt={post.title}
          sx={{
            width: '100%',
            height: 400,
            objectFit: 'cover',
            borderRadius: 2,
            mb: 4
          }}
        />

        {/* Content */}
        <Box sx={{ mb: 6 }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: (props) => <Typography variant="h2" {...props} gutterBottom />,
              h2: (props) => <Typography variant="h3" {...props} gutterBottom />,
              h3: (props) => <Typography variant="h4" {...props} gutterBottom />,
              p: (props) => <Typography variant="body1" {...props} paragraph />,
              a: (props) => (
                <Typography
                  component="a"
                  color="primary"
                  {...props}
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                />
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </Box>

        {/* Comments Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Comments ({post.comments.length})
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleComment}
              disabled={!comment.trim()}
            >
              Post Comment
            </Button>
          </Box>

          <Box>
            {post.comments.map((comment) => (
              <Card key={comment._id} sx={{ mb: 2, bgcolor: 'background.paper' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar src={comment.user.avatar} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2">
                        {comment.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <Box>
            <Divider sx={{ mb: 4 }} />
            <Typography variant="h5" gutterBottom>
              Related Posts
            </Typography>
            <Grid container spacing={3}>
              {relatedPosts.map((relatedPost) => (
                <Grid item xs={12} sm={6} md={4} key={relatedPost._id}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.3s ease-in-out'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${relatedPost.coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h3"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {relatedPost.title}
                      </Typography>
                      <Button
                        onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                      >
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </motion.div>
    </Container>
  );
};

export default BlogPost;
