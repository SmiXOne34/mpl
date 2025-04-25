import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// Material UI
import {
  Container,
  Typography,
  Button,
  Box,
  makeStyles
} from '@material-ui/core';
import { SentimentDissatisfied } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  icon: {
    fontSize: 100,
    color: theme.palette.grey[500],
    marginBottom: theme.spacing(2),
  },
  buttons: {
    marginTop: theme.spacing(4),
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const NotFound = () => {
  const classes = useStyles();

  return (
    <Container maxWidth="md">
      <Box className={classes.root}>
        <SentimentDissatisfied className={classes.icon} />
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
            className={classes.button}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.history.back()}
            className={classes.button}
          >
            Go Back
          </Button>
        </div>
      </Box>
    </Container>
  );
};

export default NotFound;