import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  Fade,
  Slide
} from '@mui/material';
import {
  ArrowForward,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const slides = [
  {
    image: '/images/hero/slide1.jpg',
    title: 'Unleash Your Dark Side',
    subtitle: 'Discover our exclusive collection of skull-themed apparel',
    cta: 'Shop Now',
    link: '/collections'
  },
  {
    image: '/images/hero/slide2.jpg',
    title: 'New Arrivals',
    subtitle: 'Check out our latest skull art designs',
    cta: 'View Collection',
    link: '/new-arrivals'
  },
  {
    image: '/images/hero/slide3.jpg',
    title: 'Limited Edition',
    subtitle: 'Handcrafted skull accessories for the bold',
    cta: 'Shop Limited',
    link: '/limited-edition'
  }
];

const Hero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('left');

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const handlePrevSlide = () => {
    setSlideDirection('right');
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setSlideDirection('left');
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '80vh', md: '90vh' },
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      {/* Background Slider */}
      {slides.map((slide, index) => (
        <Fade
          key={index}
          in={currentSlide === index}
          timeout={1000}
          style={{
            display: currentSlide === index ? 'block' : 'none'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'transform 0.5s ease-in-out'
            }}
          />
        </Fade>
      ))}

      {/* Content */}
      <Container maxWidth="lg" sx={{ height: '100%', position: 'relative' }}>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          sx={{ height: '100%' }}
        >
          <Grid item xs={12} md={8} textAlign="center">
            <Slide
              direction={slideDirection}
              in={true}
              mountOnEnter
              unmountOnExit
              timeout={800}
            >
              <Box>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    color: 'common.white',
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {slides[currentSlide].title}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'common.white',
                    mb: 4,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {slides[currentSlide].subtitle}
                </Typography>
                <Button
                  component={Link}
                  to={slides[currentSlide].link}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: '50px',
                    backgroundColor: 'common.white',
                    color: 'common.black',
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                >
                  {slides[currentSlide].cta}
                </Button>
              </Box>
            </Slide>
          </Grid>
        </Grid>

        {/* Navigation Arrows */}
        {!isMobile && (
          <>
            <IconButton
              onClick={handlePrevSlide}
              sx={{
                position: 'absolute',
                left: theme.spacing(2),
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'common.white',
                bgcolor: 'rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.5)'
                }
              }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              onClick={handleNextSlide}
              sx={{
                position: 'absolute',
                right: theme.spacing(2),
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'common.white',
                bgcolor: 'rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.5)'
                }
              }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </>
        )}

        {/* Slide Indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: theme.spacing(4),
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: currentSlide === index ? 'common.white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
