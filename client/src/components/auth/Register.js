import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { register, clearErrors } from '../../actions/authActions';
import { getSettings } from '../../actions/settingsActions';
import LinkBehavior from '../routing/LinkBehavior';

// Material UI
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Box,
  CircularProgress,
  makeStyles,
  Paper,
  Snackbar
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { PersonAddOutlined } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 500,
    margin: '0 auto',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(2),
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  alert: {
    marginBottom: theme.spacing(2),
    width: '100%',
  },
}));

const Register = ({
  register,
  clearErrors,
  getSettings,
  auth: { isAuthenticated, error, loading },
  settings
}) => {
  const classes = useStyles();
  // Safely extract settings properties with default values
  const settingsData = settings?.settings || null;
  const settingsLoading = settings?.loading || false;
  const settingsError = settings?.error || null;
  
  // Add a timeout for loading state
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Add state for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  
  // Set a timeout to bypass loading state if it takes too long
  useEffect(() => {
    console.log('Setting up loading timeout');
    const timer = setTimeout(() => {
      console.log('Loading timeout reached, forcing render');
      setLoadingTimeout(true);
    }, 2000); // 2 seconds timeout
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Debug settings
  console.log('Settings state:', settings);
  console.log('Settings data:', settingsData);
  console.log('Loading timeout reached:', loadingTimeout);
  
  // Default to allowing registration if settings are not available
  const isRegistrationAllowed = settingsData ? settingsData.allowRegistration !== false : true;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  const { name, email, password, password2 } = formData;
  const [passwordError, setPasswordError] = useState('');

  // Fetch settings when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('Fetching settings...');
        await getSettings();
        console.log('Settings fetch initiated');
        
        // Force timeout to true after a short delay to ensure we don't get stuck
        setTimeout(() => {
          setLoadingTimeout(true);
        }, 2000);
      } catch (err) {
        console.error('Error fetching settings:', err);
        // Even if there's an error, we'll proceed with registration enabled
        setLoadingTimeout(true);
      }
    };
    
    fetchSettings();
  }, [getSettings]);

  // Watch for errors and show snackbar
  useEffect(() => {
    if (error) {
      let message = error;
      let severity = 'error';
      
      // Special handling for specific error types
      if (error.includes('Email already exists') || error.includes('(400)')) {
        message = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.includes('Server error') || error.includes('(500)')) {
        message = 'Server error. Please try again later.';
      } else if (error.includes('Network Error')) {
        message = 'Network error. Please check your internet connection.';
      }
      
      setSnackbar({
        open: true,
        message,
        severity
      });
    }
  }, [error]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear password match error when typing
    if (e.target.name === 'password' || e.target.name === 'password2') {
      setPasswordError('');
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (password !== password2) {
      setPasswordError('Passwords do not match');
    } else {
      console.log('Registering user:', { name, email, password });
      
      // Use the Redux action to register
      register({
        name,
        email,
        password,
      });
    }
  };

  // Redirect if logged in
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  // Only show loading for a very short time to prevent getting stuck
  // If loadingTimeout is true, we'll skip this and render the form
  if (!loadingTimeout && settingsLoading && !settingsData) {
    console.log('Showing loading state');
    return (
      <Container component="main" maxWidth="sm">
        <Paper className={classes.paper} elevation={3}>
          <CircularProgress />
          <Typography variant="body1" style={{ marginTop: 16 }}>
            Loading...
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  console.log('Proceeding to render form');

  // Show message when registration is disabled
  if (!isRegistrationAllowed) {
    return (
      <Container component="main" maxWidth="sm">
        <Paper className={classes.paper} elevation={3}>
          <Box className={classes.avatar}>
            <PersonAddOutlined fontSize="large" />
          </Box>
          <Typography component="h1" variant="h5" gutterBottom>
            Registration Disabled
          </Typography>
          
          <Alert severity="info" className={classes.alert}>
            Registration is currently disabled by the administrator.
          </Alert>
          
          <Typography variant="body1" style={{ marginTop: 16, textAlign: 'center' }}>
            Please contact an administrator to create an account for you.
          </Typography>
          
          <Button
            component={LinkBehavior}
            to="/login"
            fullWidth
            variant="outlined"
            color="primary"
            className={classes.submit}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper className={classes.paper} elevation={3}>
        <Box className={classes.avatar}>
          <PersonAddOutlined fontSize="large" />
        </Box>
        <Typography component="h1" variant="h5">
          Create Your Account
        </Typography>
        {error && (
          <Alert severity="error" className={classes.alert}>
            {error}
          </Alert>
        )}
        <form className={classes.form} onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="name"
                name="name"
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Full Name"
                autoFocus
                value={name}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={onChange}
                helperText="Password must be at least 6 characters"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password2"
                label="Confirm Password"
                type="password"
                id="password2"
                value={password2}
                onChange={onChange}
                error={!!passwordError}
                helperText={passwordError}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={LinkBehavior} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Error Popup */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={8000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        style={{ marginTop: '20px' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          style={{ 
            minWidth: '300px', 
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

Register.propTypes = {
  register: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  getSettings: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  settings: state.settings,
});

export default connect(mapStateToProps, { register, clearErrors, getSettings })(Register);