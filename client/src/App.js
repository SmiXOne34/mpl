import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

// Redux Store
import store from './store';

// Auth
import { loadUser } from './actions/authActions';
import setAuthToken from './utils/setAuthToken';
import { initSocket, closeSocket } from './utils/socket';
import LinkBehavior from './components/routing/LinkBehavior';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Alert from './components/layout/Alert';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Public Pages
import Home from './components/pages/Home';
import About from './components/pages/About';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import NotFound from './components/pages/NotFound';

// Private Pages
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import MealSelection from './components/meals/MealSelection';
import MealDetails from './components/meals/MealDetails';
import WeeklyMenu from './components/meals/WeeklyMenu';
import SelectionHistory from './components/meals/SelectionHistory';

import MealStatistics from './components/statistics/MealStatistics';

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard';
import MealForm from './components/admin/MealForm';
import MenuForm from './components/admin/MenuForm';
import UserManagement from './components/admin/UserManagement';
import VotingSettings from './components/admin/VotingSettings';
import Settings from './components/admin/Settings';
import AIMealGeneratorPage from './components/admin/AIMealGeneratorPage';
import AICameraGeneratorPage from './components/admin/AICameraGeneratorPage';

// Set auth token on initial app loading
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Green
    },
    secondary: {
      main: '#ff9800', // Orange
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  // Configure Material-UI components to use our custom LinkBehavior
  props: {
    MuiButtonBase: {
      // Use our custom LinkBehavior as default component for buttons
      LinkComponent: LinkBehavior,
    },
    // We're not setting a default component for MuiLink anymore
    // because some links are external and should use 'a' tags
    // Instead, we'll explicitly set the component prop for each Link
  },
});

const App = () => {
  useEffect(() => {
    // Load user on app mount
    store.dispatch(loadUser());

    // Initialize socket connection if token exists
    if (localStorage.token) {
      initSocket(localStorage.token);
    }

    // Set up event listener for token changes
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'localStorage.token') {
        // If token was added or updated
        if (e.newValue) {
          console.log('Token updated, reconnecting socket...');
          initSocket(e.newValue);
        } 
        // If token was removed
        else if (!e.newValue) {
          console.log('Token removed, closing socket...');
          closeSocket();
        }
      }
    };

    // Listen for localStorage changes (for token updates)
    window.addEventListener('storage', handleStorageChange);

    // Clean up on component unmount
    return () => {
      closeSocket();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Navbar />
            <Alert />
            <div className="container">
              <Switch>
                {/* Public Routes */}
                <Route exact path="/" component={Home} />
                <Route exact path="/about" component={About} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/forgotpassword" component={ForgotPassword} />
                <Route exact path="/resetpassword/:resettoken" component={ResetPassword} />

                {/* Private Routes */}
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
                <PrivateRoute exact path="/profile" component={Profile} />
                <PrivateRoute exact path="/meals/select" component={MealSelection} />
                <PrivateRoute exact path="/meals/weekly" component={WeeklyMenu} />
                <PrivateRoute exact path="/meals/history" component={SelectionHistory} />
                <PrivateRoute exact path="/meals/statistics" component={MealStatistics} />
                <PrivateRoute exact path="/meals/:id" component={MealDetails} />

                {/* Admin Routes */}
                <AdminRoute exact path="/admin" component={AdminDashboard} />
                <AdminRoute exact path="/admin/meals/new" component={MealForm} />
                <AdminRoute exact path="/admin/meals/edit/:id" component={MealForm} />
                <AdminRoute exact path="/admin/menu" component={MenuForm} />
                <AdminRoute exact path="/admin/users" component={UserManagement} />
                <AdminRoute exact path="/admin/voting" component={VotingSettings} />
                <AdminRoute exact path="/admin/settings" component={Settings} />
                <AdminRoute exact path="/admin/ai-meal-generator" component={AIMealGeneratorPage} />
                <AdminRoute exact path="/admin/ai-camera-generator" component={AICameraGeneratorPage} />

                {/* 404 Route */}
                <Route component={NotFound} />
              </Switch>
            </div>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;