import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box, makeStyles } from '@material-ui/core';
import { Error as ErrorIcon, Home as HomeIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  icon: {
    fontSize: '6rem',
    color: theme.palette.error.main,
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  subtitle: {
    marginBottom: theme.spacing(4),
    maxWidth: 600,
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const NotFound = () => {
  const classes = useStyles();

  return (
    <Container className={classes.container}>
      <ErrorIcon className={classes.icon} />
      <Typography variant="h2" component="h1" className={classes.title}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="textSecondary" className={classes.subtitle}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      <Box>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          className={classes.button}
          startIcon={<HomeIcon />}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;