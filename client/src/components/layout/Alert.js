import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Snackbar, SnackbarContent, IconButton } from '@material-ui/core';
import { Close as CloseIcon, CheckCircle, Error, Info, Warning } from '@material-ui/icons';
import { green, amber, blue } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: blue[600],
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const Alert = ({ alerts }) => {
  const classes = useStyles();

  if (alerts === null || alerts.length === 0) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className={classes.icon} />;
      case 'error':
        return <Error className={classes.icon} />;
      case 'warning':
        return <Warning className={classes.icon} />;
      default:
        return <Info className={classes.icon} />;
    }
  };

  return (
    <>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={true}
          autoHideDuration={6000}
        >
          <SnackbarContent
            className={classes[alert.type]}
            message={
              <span className={classes.message}>
                {getIcon(alert.type)}
                {alert.msg}
              </span>
            }
            action={[
              <IconButton key="close" aria-label="close" color="inherit">
                <CloseIcon />
              </IconButton>,
            ]}
          />
        </Snackbar>
      ))}
    </>
  );
};

Alert.propTypes = {
  alerts: PropTypes.array,
};

const mapStateToProps = (state) => ({
  alerts: state.alert,
});

export default connect(mapStateToProps)(Alert);