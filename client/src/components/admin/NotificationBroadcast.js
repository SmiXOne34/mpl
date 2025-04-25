import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { broadcastNotification } from '../../actions/notificationActions';
import { setAlert } from '../../actions/alertActions';

// Material UI
import {
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  makeStyles
} from '@material-ui/core';
import { Send, NotificationsActive } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
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
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: '100%',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
  preview: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  previewTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
  },
}));

const NotificationBroadcast = ({ broadcastNotification, setAlert }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system',
    link: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const { title, message, type, link } = formData;
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !message) {
      setAlert('Please provide both title and message', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await broadcastNotification(formData);
      
      if (success) {
        setAlert('Notification broadcast successfully', 'success');
        // Reset form
        setFormData({
          title: '',
          message: '',
          type: 'system',
          link: ''
        });
      }
    } catch (err) {
      setAlert('Failed to broadcast notification', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper className={classes.paper}>
      <div className={classes.title}>
        <NotificationsActive className={classes.titleIcon} />
        <Typography variant="h5">
          Broadcast Notification
        </Typography>
      </div>
      
      <Typography variant="body1" paragraph>
        Send a notification to all users. This is useful for system announcements, important updates, or reminders.
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              name="title"
              label="Notification Title"
              value={title}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="notification-type-label">Type</InputLabel>
              <Select
                labelId="notification-type-label"
                name="type"
                value={type}
                onChange={handleChange}
                label="Type"
              >
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="meal">Meal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="message"
              label="Message"
              value={message}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={4}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="link"
              label="Link (Optional)"
              value={link}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="/dashboard"
              helperText="Where should users be directed when they click the notification?"
              className={classes.formControl}
            />
          </Grid>
        </Grid>
        
        {title && message && (
          <div className={classes.preview}>
            <Typography variant="subtitle1" className={classes.previewTitle}>
              Preview:
            </Typography>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body1" paragraph>
              {message}
            </Typography>
            {link && (
              <Typography variant="caption" color="textSecondary">
                Link: {link}
              </Typography>
            )}
          </div>
        )}
        
        <div className={classes.buttonContainer}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<Send />}
            disabled={loading || !title || !message}
          >
            {loading ? 'Sending...' : 'Broadcast Notification'}
          </Button>
        </div>
      </form>
    </Paper>
  );
};

NotificationBroadcast.propTypes = {
  broadcastNotification: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired
};

export default connect(null, { broadcastNotification, setAlert })(NotificationBroadcast);