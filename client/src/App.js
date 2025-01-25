import React from 'react';
import { BrowserRouter as Router, Routes, Route, useRoutes } from 'react-router-dom';
import { Provider } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as CustomThemeProvider } from './theme/ThemeContext';
import { store } from './store';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import CartDrawer from './components/CartDrawer';
import SearchOverlay from './components/SearchOverlay';
import ScrollToTop from './components/ScrollToTop';

// Import Routes
import { publicRoutes, protectedRoutes, adminRoutes } from './routes';

// Root component to handle routes
const AppRoutes = () => {
  const routes = useRoutes([...publicRoutes, ...protectedRoutes, ...adminRoutes]);
  return routes;
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
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </CustomThemeProvider>
    </Provider>
  );
}

export default App;
