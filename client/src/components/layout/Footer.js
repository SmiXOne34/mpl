import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Container, Link, Grid, Box } from '@material-ui/core';
import { RestaurantMenu } from '@material-ui/icons';
import LinkBehavior from '../routing/LinkBehavior';

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: '#f5f5f5',
    padding: theme.spacing(3, 0),
    marginTop: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  logoIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  logoText: {
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
  link: {
    margin: theme.spacing(0.5, 0),
    display: 'block',
  },
  copyright: {
    marginTop: theme.spacing(3),
    textAlign: 'center',
  },
}));

const Footer = () => {
  const classes = useStyles();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Box className={classes.logo}>
              <RestaurantMenu className={classes.logoIcon} />
              <Typography variant="h6" className={classes.logoText} component="div">
                MealWise Family
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" component="div">
              Simplify your family meal planning with collaborative voting and real-time updates.
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="h6" color="textPrimary" gutterBottom component="div">
              Quick Links
            </Typography>
            <Link component={LinkBehavior} to="/" color="textSecondary" className={classes.link}>
              Home
            </Link>
            <Link component={LinkBehavior} to="/about" color="textSecondary" className={classes.link}>
              About
            </Link>
            <Link component={LinkBehavior} to="/login" color="textSecondary" className={classes.link}>
              Login
            </Link>
            <Link component={LinkBehavior} to="/register" color="textSecondary" className={classes.link}>
              Register
            </Link>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="h6" color="textPrimary" gutterBottom component="div">
              Resources
            </Typography>
            <Link component="a" href="https://example.com/help" target="_blank" rel="noopener noreferrer" color="textSecondary" className={classes.link}>
              Help Center
            </Link>
            <Link component="a" href="https://example.com/privacy" target="_blank" rel="noopener noreferrer" color="textSecondary" className={classes.link}>
              Privacy Policy
            </Link>
            <Link component="a" href="https://example.com/terms" target="_blank" rel="noopener noreferrer" color="textSecondary" className={classes.link}>
              Terms of Service
            </Link>
            <Link component="a" href="https://example.com/contact" target="_blank" rel="noopener noreferrer" color="textSecondary" className={classes.link}>
              Contact Us
            </Link>
          </Grid>
        </Grid>
        <Typography variant="body2" color="textSecondary" className={classes.copyright} component="div">
          {'© '}
          {currentYear}
          {' MealWise Family. All rights reserved.'}
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;