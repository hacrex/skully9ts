import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/formatters';

const BlogCard = ({ post, onLike, onShare }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${post.slug}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          cursor: 'pointer'
        }}
        onClick={handleClick}
      >
        <CardMedia
          component="img"
          height="200"
          image={post.coverImage}
          alt={post.title}
          sx={{ objectFit: 'cover' }}
        />
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                label={post.category.replace('-', ' ')}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Typography
            gutterBottom
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '3.6em'
            }}
          >
            {post.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              mb: 2
            }}
          >
            {post.excerpt}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={post.author.avatar}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Typography variant="subtitle2">
              {post.author.name}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(post._id);
                }}
                color={post.liked ? 'primary' : 'default'}
              >
                {post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="caption" sx={{ ml: 0.5, mr: 2 }}>
                {post.likes}
              </Typography>

              <IconButton size="small" disabled>
                <CommentIcon />
              </IconButton>
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {post.comments.length}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onShare(post);
              }}
            >
              <ShareIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlogCard;
