import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  Link,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { PersonAddOutlined as PersonAddOutlinedIcon } from '@mui/icons-material';

import { register, clearErrors } from '../../actions/authActions';

/**
 * Register Component
 * Allows new users to register for the application
 * Note: In a real-world scenario, this might be admin-only or require an invite code
 */
const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get state from Redux store
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  
  // Local state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    preferences: []
  });
  
  const [passwordError, setPasswordError] = useState('');
  
  const { name, email, password, password2, preferences } = formData;
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear errors when component unmounts
    return () => {
      if (error) {
        dispatch(clearErrors());
      }
    };
  }, [isAuthenticated, navigate, error, dispatch]);
  
  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear password error when user types
    if (e.target.name === 'password' || e.target.name === 'password2') {
      setPasswordError('');
    }
  };
  
  // Handle preferences change
  const handlePreferencesChange = (e) => {
    setFormData({
      ...formData,
      preferences: e.target.value
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email || !password) {
      return;
    }
    
    // Check if passwords match
    if (password !== password2) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Register user
    dispatch(register({ name, email, password, preferences }));
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Create an Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={handleChange}
                  error={!!passwordError}
                  helperText={passwordError}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password2"
                  label="Confirm Password"
                  type="password"
                  id="password2"
                  autoComplete="new-password"
                  value={password2}
                  onChange={handleChange}
                  error={!!passwordError}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="preferences-label">Dietary Preferences</InputLabel>
                  <Select
                    labelId="preferences-label"
                    multiple
                    value={preferences}
                    onChange={handlePreferencesChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="vegetarian">Vegetarian</MenuItem>
                    <MenuItem value="vegan">Vegan</MenuItem>
                    <MenuItem value="gluten-free">Gluten-Free</MenuItem>
                    <MenuItem value="dairy-free">Dairy-Free</MenuItem>
                    <MenuItem value="nut-free">Nut-Free</MenuItem>
                    <MenuItem value="low-carb">Low-Carb</MenuItem>
                    <MenuItem value="spicy">Spicy</MenuItem>
                    <MenuItem value="no-seafood">No Seafood</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Note: In a real-world scenario, registration might be restricted to admin invites.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;