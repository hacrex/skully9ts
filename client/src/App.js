import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as CustomThemeProvider } from './theme/ThemeContext';
import { store } from './store';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import CartDrawer from './components/CartDrawer';
import SearchOverlay from './components/SearchOverlay';
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import Landing from './pages/Landing';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Protected Pages
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';

// Auth Guard Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Guard Component
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin');
  return isAdmin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Provider store={store}>
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
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/category/:category" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Protected Routes */}
                <Route
                  path="/account"
                  element={<ProtectedRoute><Profile /></ProtectedRoute>}
                />
                <Route
                  path="/account/orders"
                  element={<ProtectedRoute><Orders /></ProtectedRoute>}
                />
                <Route
                  path="/account/wishlist"
                  element={<ProtectedRoute><Wishlist /></ProtectedRoute>}
                />
                <Route
                  path="/checkout"
                  element={<ProtectedRoute><Checkout /></ProtectedRoute>}
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={<AdminRoute><Dashboard /></AdminRoute>}
                />
                <Route
                  path="/admin/products"
                  element={<AdminRoute><Products /></AdminRoute>}
                />
                <Route
                  path="/admin/products/new"
                  element={<AdminRoute><Products /></AdminRoute>}
                />
                <Route
                  path="/admin/products/:id/edit"
                  element={<AdminRoute><Products /></AdminRoute>}
                />
                <Route
                  path="/admin/categories"
                  element={<AdminRoute><Categories /></AdminRoute>}
                />
                <Route
                  path="/admin/orders"
                  element={<AdminRoute><AdminOrders /></AdminRoute>}
                />
                <Route
                  path="/admin/orders/:id"
                  element={<AdminRoute><AdminOrders /></AdminRoute>}
                />
                <Route
                  path="/admin/customers"
                  element={<AdminRoute><Customers /></AdminRoute>}
                />
                <Route
                  path="/admin/customers/:id"
                  element={<AdminRoute><Customers /></AdminRoute>}
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CustomThemeProvider>
    </Provider>
  );
}

export default App;
