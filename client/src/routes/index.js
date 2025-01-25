import React from 'react';
import { Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Landing from '../pages/Landing';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Blog from '../pages/Blog';
import BlogPost from '../pages/BlogPost';
import Contact from '../pages/Contact';
import About from '../pages/About';
import NotFound from '../pages/NotFound';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Protected Pages
import Profile from '../pages/Profile';
import Orders from '../pages/Orders';
import Wishlist from '../pages/Wishlist';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import Products from '../pages/admin/Products';
import Categories from '../pages/admin/Categories';
import AdminOrders from '../pages/admin/Orders';
import Customers from '../pages/admin/Customers';

// Auth Guard Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Replace with your auth logic
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Guard Component
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin'); // Replace with your admin check logic
  return isAdmin ? children : <Navigate to="/" />;
};

export const publicRoutes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/home', element: <Home /> },
      { path: '/shop', element: <Shop /> },
      { path: '/shop/category/:category', element: <Shop /> },
      { path: '/product/:id', element: <ProductDetails /> },
      { path: '/cart', element: <Cart /> },
      { path: '/blog', element: <Blog /> },
      { path: '/blog/:id', element: <BlogPost /> },
      { path: '/contact', element: <Contact /> },
      { path: '/about', element: <About /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password/:token', element: <ResetPassword /> },
      { path: '*', element: <NotFound /> }, // 404 route
    ],
  },
];

export const protectedRoutes = [
  {
    path: '/account',
    element: <MainLayout />,
    children: [
      {
        path: '/account',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: '/account/orders',
        element: <ProtectedRoute><Orders /></ProtectedRoute>,
      },
      {
        path: '/account/wishlist',
        element: <ProtectedRoute><Wishlist /></ProtectedRoute>,
      },
      {
        path: '/account/checkout',
        element: <ProtectedRoute><Checkout /></ProtectedRoute>,
      },
    ],
  },
];

export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '/admin',
        element: <AdminRoute><Dashboard /></AdminRoute>,
      },
      {
        path: '/admin/products',
        element: <AdminRoute><Products /></AdminRoute>,
      },
      {
        path: '/admin/products/new',
        element: <AdminRoute><Products /></AdminRoute>,
      },
      {
        path: '/admin/products/:id/edit',
        element: <AdminRoute><Products /></AdminRoute>,
      },
      {
        path: '/admin/categories',
        element: <AdminRoute><Categories /></AdminRoute>,
      },
      {
        path: '/admin/orders',
        element: <AdminRoute><AdminOrders /></AdminRoute>,
      },
      {
        path: '/admin/orders/:id',
        element: <AdminRoute><AdminOrders /></AdminRoute>,
      },
      {
        path: '/admin/customers',
        element: <AdminRoute><Customers /></AdminRoute>,
      },
      {
        path: '/admin/customers/:id',
        element: <AdminRoute><Customers /></AdminRoute>,
      },
      {
        path: '/admin/*',
        element: <NotFound />,
      },
    ],
  },
];
