import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login, clearErrors } from '../../actions/authActions';
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
import { LockOutlined } from '@material-ui/icons';

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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  alert: {
    marginBottom: theme.spacing(2),
    width: '100%',
  },
}));

const Login = ({
  login,
  clearErrors,
  auth: { isAuthenticated, error, loading }
}) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    isSubmitting: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const { email, password, isSubmitting } = formData;

  useEffect(() => {
    // Show popup for any login error
    if (error) {
      let message = error;
      let severity = 'error';
      
      // Special handling for specific error types
      if (error.includes('User not found') || error.includes('(404)')) {
        message = 'User not found. Please check your email or register a new account.';
      } else if (error.includes('Invalid password') || error.includes('(401)')) {
        message = 'Invalid password. Please try again.';
      } else if (error.includes('Server error') || error.includes('(500)')) {
        message = 'Server error. Please try again later.';
      } else if (error.includes('Network Error')) {
        message = 'Network error. Please check your internet connection.';
      }
      
      // Log the error for debugging
      console.log('Login error detected:', error);
      
      setSnackbar({
        open: true,
        message,
        severity
      });
    }
    
    return () => {
      clearErrors();
    };
  }, [error, clearErrors]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Show loading state
      setFormData({ ...formData, isSubmitting: true });
      
      // Attempt login
      await login(email, password);
    } catch (err) {
      console.error('Login submission error:', err);
    } finally {
      // Reset loading state
      setFormData({ ...formData, isSubmitting: false });
    }
  };

  // Redirect if logged in
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper className={classes.paper} elevation={3}>
        <Box className={classes.avatar}>
          <LockOutlined fontSize="large" />
        </Box>
        <Typography component="h1" variant="h5">
          Sign in to MealWise Family
        </Typography>
        {error && (
          <Alert severity="error" className={classes.alert}>
            {error}
          </Alert>
        )}
        <form className={classes.form} onSubmit={onSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={onChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link component={LinkBehavior} to="/forgotpassword" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={LinkBehavior} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Error Popup */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={10000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        style={{ marginTop: '20px', zIndex: 9999 }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          style={{ 
            minWidth: '350px', 
            fontSize: '1.1rem',
            padding: '12px 20px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            fontWeight: 500
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { login, clearErrors })(Login);