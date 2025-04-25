import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getVotingStatus, updateVotingSettings } from '../../actions/timeActions';
import { setAlert } from '../../actions/alertActions';

// Material UI
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  Divider,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles
} from '@material-ui/core';
import { 
  AccessTime, 
  Save, 
  Refresh,
  Settings,
  CheckCircle,
  Info
} from '@material-ui/icons';
import { Alert, AlertTitle } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  formControl: {
    marginBottom: theme.spacing(3),
    width: '100%',
  },
  timeField: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  statusCard: {
    marginTop: theme.spacing(3),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  statusIcon: {
    fontSize: '2rem',
    marginRight: theme.spacing(1),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
}));

const VotingSettings = ({ 
  time: { votingStatus, loading },
  getVotingStatus,
  updateVotingSettings,
  setAlert
}) => {
  const classes = useStyles();
  
  // State for form fields
  const [formData, setFormData] = useState({
    startHour: '16',
    startMinute: '00',
    endHour: '11',
    endMinute: '00',
    enableVoting: true,
    overrideStatus: false,
    manualStatus: true,
  });
  
  // State for dialogs
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const { 
    startHour, 
    startMinute, 
    endHour, 
    endMinute, 
    enableVoting,
    overrideStatus,
    manualStatus
  } = formData;

  // Load current settings
  useEffect(() => {
    getVotingStatus();
  }, [getVotingStatus]);

  // Update form when voting status is loaded
  useEffect(() => {
    if (votingStatus) {
      // Check if we have saved settings in localStorage
      const savedSettings = localStorage.getItem('votingSettings');
      
      if (savedSettings) {
        // If we have saved settings, use them
        const settings = JSON.parse(savedSettings);
        setFormData({
          ...settings,
          // Make sure manualStatus is updated from the current status if not in savedSettings
          manualStatus: settings.manualStatus !== undefined ? settings.manualStatus : votingStatus.isOpen
        });
      } else {
        // Otherwise, use default values
        setFormData({
          startHour: '16',
          startMinute: '00',
          endHour: '11',
          endMinute: '00',
          enableVoting: true,
          overrideStatus: false,
          manualStatus: votingStatus.isOpen,
        });
      }
    }
  }, [votingStatus]);

  const onChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Validate time inputs
    const startHourNum = parseInt(startHour, 10);
    const startMinuteNum = parseInt(startMinute, 10);
    const endHourNum = parseInt(endHour, 10);
    const endMinuteNum = parseInt(endMinute, 10);
    
    if (
      startHourNum < 0 || startHourNum > 23 ||
      startMinuteNum < 0 || startMinuteNum > 59 ||
      endHourNum < 0 || endHourNum > 23 ||
      endMinuteNum < 0 || endMinuteNum > 59
    ) {
      setAlert('Invalid time format. Hours must be 0-23 and minutes 0-59.', 'error');
      return;
    }
    
    // Open confirmation dialog
    setConfirmDialogOpen(true);
  };
  
  // Function to handle saving after confirmation
  const handleSaveConfirmed = async () => {
    try {
      // Close the confirmation dialog
      setConfirmDialogOpen(false);
      
      // Send the updated settings to the backend
      await updateVotingSettings(formData);
      
      // Refresh the voting status to show the updated settings
      await getVotingStatus();
      
      // Show success dialog
      setSuccessDialogOpen(true);
    } catch (err) {
      setAlert('Failed to update voting settings. Please try again.', 'error');
    }
  };
  
  // Function to handle closing the success dialog
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    
    // Show success message
    setAlert('Voting settings updated successfully!', 'success');
  };

  const refreshStatus = () => {
    getVotingStatus();
  };

  if (loading) {
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Typography variant="h4" component="h1" className={classes.title}>
        <Settings style={{ marginRight: 8, verticalAlign: 'middle' }} />
        Voting Settings
      </Typography>
      
      <Alert severity="info" style={{ marginBottom: 16 }}>
        <AlertTitle>About Voting Settings</AlertTitle>
        Configure when users can vote for meals. By default, voting is open from 4:00 PM to 11:00 AM the next day.
      </Alert>
      
      {votingStatus && (
        <Card className={classes.statusCard}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <AccessTime className={classes.statusIcon} />
              </Grid>
              <Grid item xs>
                <Typography variant="h6">
                  Current Status: {votingStatus.isOpen ? 'OPEN' : 'CLOSED'}
                </Typography>
                <Typography variant="body1">
                  {votingStatus.message}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  style={{ marginTop: 8, color: 'white', borderColor: 'white' }}
                  startIcon={<Refresh />}
                  onClick={refreshStatus}
                >
                  Refresh Status
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      <Paper className={classes.paper}>
        <form onSubmit={onSubmit}>
          <Typography variant="h5" gutterBottom>
            Time Window Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Voting Start Time
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Hour (0-23)"
                    name="startHour"
                    value={startHour}
                    onChange={onChange}
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 23 } }}
                    className={classes.timeField}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Minute (0-59)"
                    name="startMinute"
                    value={startMinute}
                    onChange={onChange}
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 59 } }}
                    className={classes.timeField}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Voting End Time
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Hour (0-23)"
                    name="endHour"
                    value={endHour}
                    onChange={onChange}
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 23 } }}
                    className={classes.timeField}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Minute (0-59)"
                    name="endMinute"
                    value={endMinute}
                    onChange={onChange}
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 59 } }}
                    className={classes.timeField}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Divider className={classes.divider} />
          
          <Typography variant="h5" gutterBottom>
            General Settings
          </Typography>
          
          <FormControl component="fieldset" className={classes.formControl}>
            <FormControlLabel
              control={
                <Switch
                  checked={enableVoting}
                  onChange={onChange}
                  name="enableVoting"
                  color="primary"
                />
              }
              label="Enable Voting System"
            />
            <Typography variant="body2" color="textSecondary">
              If disabled, no users will be able to vote regardless of the time window.
            </Typography>
          </FormControl>
          
          <Divider className={classes.divider} />
          
          <Typography variant="h5" gutterBottom>
            Manual Override
          </Typography>
          
          <FormControl component="fieldset" className={classes.formControl}>
            <FormControlLabel
              control={
                <Switch
                  checked={overrideStatus}
                  onChange={onChange}
                  name="overrideStatus"
                  color="primary"
                />
              }
              label="Override Automatic Time Window"
            />
            <Typography variant="body2" color="textSecondary">
              If enabled, the system will use the manual status below instead of the time-based rules.
            </Typography>
          </FormControl>
          
          {overrideStatus && (
            <FormControl component="fieldset" className={classes.formControl}>
              <FormControlLabel
                control={
                  <Switch
                    checked={manualStatus}
                    onChange={onChange}
                    name="manualStatus"
                    color="primary"
                  />
                }
                label="Manual Voting Status"
              />
              <Typography variant="body2" color="textSecondary">
                Set the voting status manually: {manualStatus ? 'OPEN' : 'CLOSED'}
              </Typography>
            </FormControl>
          )}
          
          <Box className={classes.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className={classes.button}
              startIcon={<Save />}
            >
              Save Settings
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Voting Schedule Preview
        </Typography>
        
        <Alert severity="info">
          <Typography variant="body1">
            With current settings, voting will be open:
          </Typography>
          <Typography variant="body1" style={{ fontWeight: 'bold', marginTop: 8 }}>
            Every day from {startHour}:{startMinute} to {endHour}:{endMinute} the next day
          </Typography>
        </Alert>
        
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Example Schedule:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monday
                  </Typography>
                  <Typography variant="body2">
                    <strong>Open:</strong> {startHour}:{startMinute} (4:00 PM)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tuesday
                  </Typography>
                  <Typography variant="body2">
                    <strong>Close:</strong> {endHour}:{endMinute} (11:00 AM)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Open:</strong> {startHour}:{startMinute} (4:00 PM)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            borderRadius: '8px',
            padding: '8px',
            maxWidth: '500px'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center' }}>
          <Settings style={{ color: '#4caf50', fontSize: '48px', marginBottom: '8px' }} />
          <Typography variant="h5">Confirm Settings Update</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" style={{ textAlign: 'center' }}>
            Are you sure you want to update the voting settings? This will affect when users can vote for meals.
          </DialogContentText>
          
          <Box mt={3} mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Summary of Changes:</strong>
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Voting Window:</strong>
                </Typography>
                <Typography variant="body2">
                  {startHour}:{startMinute} to {endHour}:{endMinute} next day
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Voting Enabled:</strong>
                </Typography>
                <Typography variant="body2" color={enableVoting ? "primary" : "error"}>
                  {enableVoting ? "Yes" : "No"}
                </Typography>
              </Grid>
              
              {overrideStatus && (
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Manual Override:</strong>
                  </Typography>
                  <Typography variant="body2" color={manualStatus ? "primary" : "error"}>
                    Voting manually set to {manualStatus ? "OPEN" : "CLOSED"}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
          
          {overrideStatus && (
            <Box mt={2} p={1} bgcolor={manualStatus ? "#e8f5e9" : "#ffebee"} borderRadius={1}>
              <Typography variant="body2" style={{ fontWeight: 'bold', color: manualStatus ? "#2e7d32" : "#c62828" }}>
                ⚠️ Warning: You are manually setting voting to be {manualStatus ? "OPEN" : "CLOSED"}, 
                overriding the time-based rules.
              </Typography>
            </Box>
          )}
          
          {!enableVoting && (
            <Box mt={2} p={1} bgcolor="#ffebee" borderRadius={1}>
              <Typography variant="body2" style={{ fontWeight: 'bold', color: "#c62828" }}>
                ⚠️ Warning: You are completely disabling the voting system. No users will be able to vote.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', padding: '16px' }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="default"
            variant="outlined"
            style={{ minWidth: '120px', marginRight: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveConfirmed} 
            color="primary" 
            variant="contained" 
            autoFocus
            style={{ minWidth: '120px' }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
        PaperProps={{
          style: {
            borderRadius: '8px',
            padding: '8px',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle id="success-dialog-title" style={{ textAlign: 'center' }}>
          <CheckCircle style={{ color: '#4caf50', fontSize: '48px', marginBottom: '8px' }} />
          <Typography variant="h5">Settings Updated</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="success-dialog-description"
            style={{ 
              textAlign: 'center',
              fontSize: '1.1rem',
              padding: '8px 16px'
            }}
          >
            Your voting settings have been successfully updated!
          </DialogContentText>
          
          {votingStatus && (
            <Box mt={3} p={2} bgcolor="#e8f5e9" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 'bold' }}>
                Current Voting Status:
              </Typography>
              <Typography variant="body2">
                {votingStatus.isOpen ? 'OPEN' : 'CLOSED'}
              </Typography>
              <Typography variant="body2" style={{ marginTop: '8px' }}>
                {votingStatus.message}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', padding: '16px' }}>
          <Button 
            onClick={handleSuccessDialogClose} 
            color="primary" 
            variant="contained"
            size="large"
            autoFocus
            style={{ 
              minWidth: '120px',
              borderRadius: '20px'
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

VotingSettings.propTypes = {
  time: PropTypes.object.isRequired,
  getVotingStatus: PropTypes.func.isRequired,
  updateVotingSettings: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  time: state.time,
});

export default connect(mapStateToProps, {
  getVotingStatus,
  updateVotingSettings,
  setAlert,
})(VotingSettings);