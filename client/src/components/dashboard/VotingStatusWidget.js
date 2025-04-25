import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getVotingStatusMessage, isVotingOpen } from '../../utils/timeRestriction';
import { createNotification } from '../../actions/notificationActions';

// Material UI
import {
  Typography,
  Paper,
  Button,
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  titleIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  statusAlert: {
    marginBottom: theme.spacing(2),
  },
  progressContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
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
  footer: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  statusIcon: {
    marginRight: theme.spacing(1),
  },
}));

const VotingStatusWidget = ({ createNotification }) => {
  const classes = useStyles();
  const [status, setStatus] = useState(getVotingStatusMessage());
  const [progress, setProgress] = useState(0);
  
  // Update status every minute
  useEffect(() => {
    const updateStatus = () => {
      const newStatus = getVotingStatusMessage();
      setStatus(newStatus);
      
      // Calculate progress percentage
      const { isOpen, hoursRemaining, minutesRemaining } = newStatus;
      const totalMinutesInPeriod = isOpen ? 19 * 60 : 5 * 60; // 19 hours for open period, 5 hours for closed period
      const minutesRemained = (hoursRemaining * 60) + minutesRemaining;
      const minutesElapsed = totalMinutesInPeriod - minutesRemained;
      const progressPercentage = (minutesElapsed / totalMinutesInPeriod) * 100;
      setProgress(progressPercentage);
      
      // Create notifications for status changes
      if (isOpen && hoursRemaining === 0 && minutesRemaining <= 30) {
        createNotification({
          title: 'Urgent: Voting Closing Soon',
          message: `Meal voting closes in ${minutesRemaining} minutes. Cast your votes now!`,
          type: 'event',
          link: '/meals/select'
        });
      }
    };
    
    // Update immediately
    updateStatus();
    
    // Set up interval
    const interval = setInterval(updateStatus, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [createNotification]);
  
  return (
    <Paper className={classes.paper}>
      <div className={classes.title}>
        <AccessTime className={classes.titleIcon} />
        <Typography variant="h6">
          Voting Status
        </Typography>
      </div>
      
      <div className={classes.content}>
        <Alert 
          severity={status.severity}
          icon={status.isOpen ? <CheckCircle /> : <Cancel />}
          className={classes.statusAlert}
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
      </div>
      
      <div className={classes.footer}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/meals/select"
          disabled={!status.isOpen}
        >
          {status.isOpen ? 'Cast Your Vote Now' : 'View Meal Options'}
        </Button>
      </div>
    </Paper>
  );
};

VotingStatusWidget.propTypes = {
  createNotification: PropTypes.func.isRequired,
};

export default connect(null, { createNotification })(VotingStatusWidget);