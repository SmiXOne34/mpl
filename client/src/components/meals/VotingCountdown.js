import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getVotingStatusMessage } from '../../utils/timeRestriction';

// Material UI
import {
  Typography,
  Paper,
  Box,
  LinearProgress,
  Chip,
  makeStyles
} from '@material-ui/core';
import {
  AccessTime,
  CheckCircle,
  Cancel,
  Warning
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  alert: {
    marginBottom: theme.spacing(2),
  },
  progressContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  timeRemaining: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  timeChip: {
    fontWeight: 'bold',
  },
  statusIcon: {
    marginRight: theme.spacing(1),
  },
}));

const VotingCountdown = ({ onStatusChange }) => {
  const classes = useStyles();
  const [status, setStatus] = useState(getVotingStatusMessage());
  const [progress, setProgress] = useState(0);
  
  // Update status every minute
  useEffect(() => {
    const updateStatus = () => {
      const newStatus = getVotingStatusMessage();
      
      // Check if status has changed
      if (status.isOpen !== newStatus.isOpen) {
        // Notify parent component of status change
        if (onStatusChange) {
          onStatusChange(newStatus.isOpen);
        }
      }
      
      setStatus(newStatus);
      
      // Calculate progress percentage
      const { isOpen, hoursRemaining, minutesRemaining } = newStatus;
      const totalMinutesInPeriod = isOpen ? 19 * 60 : 5 * 60; // 19 hours for open period, 5 hours for closed period
      const minutesRemained = (hoursRemaining * 60) + minutesRemaining;
      const minutesElapsed = totalMinutesInPeriod - minutesRemained;
      const progressPercentage = (minutesElapsed / totalMinutesInPeriod) * 100;
      setProgress(progressPercentage);
    };
    
    // Update immediately
    updateStatus();
    
    // Set up interval
    const interval = setInterval(updateStatus, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [status.isOpen, onStatusChange]);
  
  return (
    <Paper className={classes.paper}>
      <Alert 
        severity={status.severity}
        icon={status.isOpen ? <CheckCircle /> : <Cancel />}
        className={classes.alert}
      >
        <Typography variant="subtitle1">
          {status.isOpen ? 'Voting is Open' : 'Voting is Closed'}
        </Typography>
        <Typography variant="body2">
          {status.message}
        </Typography>
      </Alert>
      
      <div className={classes.progressContainer}>
        <div className={classes.timeRemaining}>
          <Typography variant="body2" color="textSecondary">
            {status.isOpen ? 'Time until voting closes:' : 'Time until voting opens:'}
          </Typography>
          <Chip
            label={status.timeRemaining}
            color={status.isOpen ? (status.severity === 'warning' ? 'secondary' : 'primary') : 'default'}
            className={classes.timeChip}
            icon={status.severity === 'warning' ? <Warning /> : <AccessTime />}
          />
        </div>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          color={status.isOpen ? (status.severity === 'warning' ? 'secondary' : 'primary') : 'secondary'}
        />
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="textSecondary">
            {status.isOpen ? '4:00 PM' : '11:00 AM'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {status.isOpen ? '11:00 AM' : '4:00 PM'}
          </Typography>
        </Box>
      </div>
    </Paper>
  );
};

VotingCountdown.propTypes = {
  onStatusChange: PropTypes.func,
};

export default VotingCountdown;