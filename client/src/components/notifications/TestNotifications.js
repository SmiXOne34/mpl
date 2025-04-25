import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createNotification } from '../../actions/notificationActions';
import { requestNotificationPermission } from '../../utils/browserNotifications';

// Material UI
import {
  Button,
  Typography,
  Paper,
  Grid,
  makeStyles
} from '@material-ui/core';
import {
  Notifications,
  RestaurantMenu,
  Event,
  Info,
  VolumeUp
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const TestNotifications = ({ createNotification }) => {
  const classes = useStyles();

  // Request notification permission
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    alert(`Notification permission: ${permission}`);
  };

  // Create a test meal notification
  const handleTestMealNotification = () => {
    createNotification({
      title: 'New Meal Added',
      message: 'A new meal "Vegetable Stir Fry" has been added to the menu.',
      type: 'meal',
      link: '/meals/weekly'
    });
  };

  // Create a test event notification
  const handleTestEventNotification = () => {
    createNotification({
      title: 'Voting is Now Open',
      message: 'You can now vote for your favorite meals for this week. Voting closes at 11:00 AM.',
      type: 'event',
      link: '/meals/select'
    });
  };

  // Create a test system notification
  const handleTestSystemNotification = () => {
    createNotification({
      title: 'System Maintenance',
      message: 'The system will be undergoing maintenance tonight from 2:00 AM to 4:00 AM.',
      type: 'system',
      link: '/dashboard'
    });
  };

  return (
    <Paper className={classes.paper}>
      <div className={classes.title}>
        <Notifications className={classes.titleIcon} />
        <Typography variant="h5">
          Test Notifications
        </Typography>
      </div>

      <Typography variant="body1" paragraph>
        Use these buttons to test different types of notifications. Make sure to enable browser notifications first.
      </Typography>

      <Grid container className={classes.buttonContainer}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            startIcon={<Notifications />}
            onClick={handleRequestPermission}
          >
            Request Permission
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            startIcon={<RestaurantMenu />}
            onClick={handleTestMealNotification}
          >
            Test Meal Notification
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            startIcon={<Event />}
            onClick={handleTestEventNotification}
          >
            Test Event Notification
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            startIcon={<Info />}
            onClick={handleTestSystemNotification}
          >
            Test System Notification
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

TestNotifications.propTypes = {
  createNotification: PropTypes.func.isRequired,
};

export default connect(null, { createNotification })(TestNotifications);