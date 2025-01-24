import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as CustomThemeProvider } from './theme/ThemeContext';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import CartDrawer from './components/CartDrawer';
import SearchOverlay from './components/SearchOverlay';
import ScrollToTop from './components/ScrollToTop';

// Page Components
import Home from './pages/Home';
import Landing from './pages/Landing';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Profile from './pages/Profile';

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <div className="App">
          <Header />
          <CartDrawer />
          <SearchOverlay />
          <Toast />
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/profile/*" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
