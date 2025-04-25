import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { removeAlert } from '../../actions/alertActions';

// Material UI
import { Snackbar, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const AlertContainer = ({ alerts, removeAlert }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => removeAlert(alert.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => removeAlert(alert.id)}
            severity={alert.type}
            variant="filled"
            elevation={6}
          >
            {alert.msg}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
};

AlertContainer.propTypes = {
  alerts: PropTypes.array.isRequired,
  removeAlert: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  alerts: state.alert,
});

export default connect(mapStateToProps, { removeAlert })(AlertContainer);