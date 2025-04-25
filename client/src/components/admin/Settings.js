import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getSettings, updateSettings } from '../../actions/settingsActions';

// Material UI
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  makeStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import {
  ArrowBack,
  Save,
  AccessTime,
  Settings as SettingsIcon,
  People
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: 120,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
  },
  timeGrid: {
    marginBottom: theme.spacing(2),
  },
}));

const Settings = ({
  settings: { settings, loading, error },
  getSettings,
  updateSettings
}) => {
  const classes = useStyles();
  
  const [formData, setFormData] = useState({
    votingOpenHour: 0,
    votingOpenMinute: 0,
    votingCloseHour: 0,
    votingCloseMinute: 0,
    autoSelectWinner: true,
    notifyUsers: true,
    allowMultipleSelections: true,
    maxSelectionsPerUser: 2,
    allowViewerRole: true,
    allowRegistration: true
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });
  
  // Set a timeout to bypass loading state if it takes too long
  useEffect(() => {
    console.log('Setting up loading timeout');
    const timer = setTimeout(() => {
      console.log('Loading timeout reached, forcing render');
      setLoadingTimeout(true);
      
      // If settings are still null, initialize with default values
      if (!settings) {
        setFormData({
          votingOpenHour: 8,
          votingOpenMinute: 0,
          votingCloseHour: 18,
          votingCloseMinute: 0,
          autoSelectWinner: true,
          notifyUsers: true,
          allowMultipleSelections: true,
          maxSelectionsPerUser: 2,
          allowViewerRole: true,
          allowRegistration: true
        });
      }
    }, 3000); // 3 seconds timeout
    
    return () => clearTimeout(timer);
  }, [settings]);
  
  useEffect(() => {
    console.log('Fetching settings...');
    getSettings();
  }, [getSettings]);
  
  // Debug loading state
  useEffect(() => {
    console.log('Settings state:', { settings, loading, error });
  }, [settings, loading, error]);
  
  useEffect(() => {
    console.log('Settings changed, updating form data:', settings);
    
    // If settings are loaded or we've reached the timeout, initialize with default or loaded values
    if (settings || loadingTimeout) {
      setFormData({
        votingOpenHour: settings?.votingOpenHour || 8,
        votingOpenMinute: settings?.votingOpenMinute || 0,
        votingCloseHour: settings?.votingCloseHour || 18,
        votingCloseMinute: settings?.votingCloseMinute || 0,
        autoSelectWinner: settings?.autoSelectWinner !== false,
        notifyUsers: settings?.notifyUsers !== false,
        allowMultipleSelections: settings?.allowMultipleSelections !== false,
        maxSelectionsPerUser: settings?.maxSelectionsPerUser || 2,
        allowViewerRole: settings?.allowViewerRole !== false,
        allowRegistration: settings?.allowRegistration !== false
      });
    }
  }, [settings, loadingTimeout]);
  
  const {
    votingOpenHour,
    votingOpenMinute,
    votingCloseHour,
    votingCloseMinute,
    autoSelectWinner,
    notifyUsers,
    allowMultipleSelections,
    maxSelectionsPerUser,
    allowViewerRole,
    allowRegistration
  } = formData;
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // Show confirmation dialog when disabling registration
    if (name === 'allowRegistration' && !checked) {
      setConfirmDialog({
        open: true,
        title: 'Disable User Registration?',
        message: 'When registration is disabled, new users will not be able to create accounts. Only administrators will be able to create new user accounts. Are you sure you want to disable registration?',
        onConfirm: () => {
          setFormData({
            ...formData,
            allowRegistration: false
          });
          
          // Clear success message when form is changed
          if (success) {
            setSuccess(false);
          }
        }
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear success message when form is changed
    if (success) {
      setSuccess(false);
    }
  };
  
  // Handle dialog close
  const handleDialogClose = (confirmed = false) => {
    if (confirmed && confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    
    setConfirmDialog({
      ...confirmDialog,
      open: false
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await updateSettings(formData);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Only show loading if timeout hasn't been reached
  if (loading && !loadingTimeout) {
    console.log('Showing loading state');
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
          <Typography variant="body1" style={{ marginTop: 16 }}>
            Loading settings...
          </Typography>
        </div>
      </Container>
    );
  }
  
  console.log('Proceeding to render settings form');
  
  return (
    <Container className={classes.container}>
      {error && (
        <Alert 
          severity="error" 
          style={{ marginBottom: '16px' }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          }
        >
          {error} — Settings will be initialized with default values.
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" style={{ marginBottom: '16px' }}>
          Settings updated successfully!
        </Alert>
      )}
      
      <Paper className={classes.paper}>
        <Typography variant="h4" component="h1" className={classes.title}>
          System Settings
        </Typography>
        
        {error && (
          <Alert severity="error" style={{ marginBottom: 16 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" style={{ marginBottom: 16 }}>
            Settings updated successfully
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Typography variant="h5" className={classes.sectionTitle}>
            <AccessTime style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Voting Time Settings
          </Typography>
          
          <Grid container spacing={3} className={classes.timeGrid}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Voting Opens At
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl variant="outlined" fullWidth className={classes.formControl}>
                    <InputLabel id="voting-open-hour-label">Hour</InputLabel>
                    <Select
                      labelId="voting-open-hour-label"
                      name="votingOpenHour"
                      value={votingOpenHour}
                      onChange={handleChange}
                      label="Hour"
                    >
                      {[...Array(24).keys()].map((hour) => (
                        <MenuItem key={hour} value={hour}>
                          {hour.toString().padStart(2, '0')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl variant="outlined" fullWidth className={classes.formControl}>
                    <InputLabel id="voting-open-minute-label">Minute</InputLabel>
                    <Select
                      labelId="voting-open-minute-label"
                      name="votingOpenMinute"
                      value={votingOpenMinute}
                      onChange={handleChange}
                      label="Minute"
                    >
                      {[0, 15, 30, 45].map((minute) => (
                        <MenuItem key={minute} value={minute}>
                          {minute.toString().padStart(2, '0')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Voting Closes At
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl variant="outlined" fullWidth className={classes.formControl}>
                    <InputLabel id="voting-close-hour-label">Hour</InputLabel>
                    <Select
                      labelId="voting-close-hour-label"
                      name="votingCloseHour"
                      value={votingCloseHour}
                      onChange={handleChange}
                      label="Hour"
                    >
                      {[...Array(24).keys()].map((hour) => (
                        <MenuItem key={hour} value={hour}>
                          {hour.toString().padStart(2, '0')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl variant="outlined" fullWidth className={classes.formControl}>
                    <InputLabel id="voting-close-minute-label">Minute</InputLabel>
                    <Select
                      labelId="voting-close-minute-label"
                      name="votingCloseMinute"
                      value={votingCloseMinute}
                      onChange={handleChange}
                      label="Minute"
                    >
                      {[0, 15, 30, 45].map((minute) => (
                        <MenuItem key={minute} value={minute}>
                          {minute.toString().padStart(2, '0')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Divider className={classes.divider} />
          
          <Typography variant="h5" className={classes.sectionTitle}>
            <SettingsIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
            General Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSelectWinner}
                    onChange={handleChange}
                    name="autoSelectWinner"
                    color="primary"
                  />
                }
                label="Automatically select winning meal when voting closes"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifyUsers}
                    onChange={handleChange}
                    name="notifyUsers"
                    color="primary"
                  />
                }
                label="Send notifications to users about voting status and results"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowMultipleSelections}
                    onChange={handleChange}
                    name="allowMultipleSelections"
                    color="primary"
                  />
                }
                label="Allow users to select multiple meals per day"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Maximum Selections Per User"
                name="maxSelectionsPerUser"
                value={maxSelectionsPerUser}
                onChange={handleChange}
                type="number"
                variant="outlined"
                fullWidth
                disabled={!allowMultipleSelections}
                InputProps={{ inputProps: { min: 1, max: 5 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowViewerRole}
                    onChange={handleChange}
                    name="allowViewerRole"
                    color="primary"
                  />
                }
                label="Allow viewer role (can view meals but not vote)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider style={{ margin: '16px 0' }} />
              <Typography variant="h5" className={classes.sectionTitle}>
                <People style={{ verticalAlign: 'middle', marginRight: 8 }} />
                User Registration Settings
              </Typography>
              <Paper style={{ padding: '16px', backgroundColor: allowRegistration ? '#e8f5e9' : '#ffebee', marginBottom: '16px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowRegistration}
                      onChange={handleChange}
                      name="allowRegistration"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                      {allowRegistration ? "Registration is ENABLED" : "Registration is DISABLED"}
                    </Typography>
                  }
                />
                <Typography variant="body1" style={{ marginTop: 8, marginLeft: 58 }}>
                  {allowRegistration 
                    ? "New users can create accounts on the registration page."
                    : "New users cannot register. Only administrators can create new user accounts."}
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8, marginLeft: 58 }}>
                  {allowRegistration 
                    ? "Disable this setting if you want to restrict new user registration."
                    : "Enable this setting if you want to allow new users to register themselves."}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <div className={classes.buttonContainer}>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/admin"
              startIcon={<ArrowBack />}
            >
              Back to Dashboard
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<Save />}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => handleDialogClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDialogClose(true)} color="primary" variant="contained" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

Settings.propTypes = {
  settings: PropTypes.object.isRequired,
  getSettings: PropTypes.func.isRequired,
  updateSettings: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  settings: state.settings,
});

export default connect(mapStateToProps, {
  getSettings,
  updateSettings,
})(Settings);