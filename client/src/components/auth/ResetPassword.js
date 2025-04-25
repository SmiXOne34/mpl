import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
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
  Paper
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

const ResetPassword = () => {
  const classes = useStyles();
  const { resettoken } = useParams();
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const { password, password2 } = formData;

  useEffect(() => {
    const validateToken = async () => {
      try {
        await axios.get(`/api/auth/resetpassword/${resettoken}`);
        setTokenValid(true);
      } catch (err) {
        setError('Password reset token is invalid or has expired');
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [resettoken]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.put(`/api/auth/resetpassword/${resettoken}`, {
        password,
      });
      setSuccess(res.data.data);
      setFormData({ password: '', password2: '' });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        history.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <Container component="main" maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container component="main" maxWidth="sm">
        <Paper className={classes.paper} elevation={3}>
          <Alert severity="error" className={classes.alert}>
            Password reset token is invalid or has expired
          </Alert>
          <Button
            component={LinkBehavior}
            to="/forgotpassword"
            fullWidth
            variant="contained"
            color="primary"
          >
            Request New Reset Link
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper className={classes.paper} elevation={3}>
        <Box className={classes.avatar}>
          <LockOutlined fontSize="large" />
        </Box>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        
        {error && (
          <Alert severity="error" className={classes.alert}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" className={classes.alert}>
            {success} Redirecting to login...
          </Alert>
        )}
        
        <form className={classes.form} onSubmit={onSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={onChange}
            disabled={!!success}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm New Password"
            type="password"
            id="password2"
            value={password2}
            onChange={onChange}
            disabled={!!success}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={loading || !!success}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
          <Grid container>
            <Grid item>
              <Link component={LinkBehavior} to="/login" variant="body2">
                Back to Login
              </Link>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ResetPassword;