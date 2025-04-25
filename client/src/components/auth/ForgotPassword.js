import React, { useState } from 'react';
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
import { MailOutline } from '@material-ui/icons';

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

const ForgotPassword = () => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/forgotpassword', { email });
      setSuccess(res.data.data);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper className={classes.paper} elevation={3}>
        <Box className={classes.avatar}>
          <MailOutline fontSize="large" />
        </Box>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: 16 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        
        {error && (
          <Alert severity="error" className={classes.alert}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" className={classes.alert}>
            {success}
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link component={LinkBehavior} to="/login" variant="body2">
                Back to Login
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
    </Container>
  );
};

export default ForgotPassword;