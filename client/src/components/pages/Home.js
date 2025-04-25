import React from 'react';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// Material UI
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Paper,
  makeStyles
} from '@material-ui/core';
import {
  RestaurantMenu,
  Group,
  HowToVote,
  Notifications
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  hero: {
    padding: theme.spacing(8, 0, 6),
    textAlign: 'center',
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  featureSection: {
    padding: theme.spacing(8, 0),
  },
  featureCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(4),
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-10px)',
    },
  },
  featureIcon: {
    fontSize: 48,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  ctaSection: {
    padding: theme.spacing(8, 0),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: theme.spacing(4),
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
}));

const Home = ({ isAuthenticated }) => {
  const classes = useStyles();

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <>
      <Box className={classes.hero}>
        <Container maxWidth="md">
          <Typography component="h1" variant="h2" color="textPrimary" gutterBottom>
            MealWise Family
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph>
            Simplify your family meal planning with collaborative voting and real-time updates.
            Let everyone have a say in what's for dinner!
          </Typography>
          <div className={classes.heroButtons}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Get Started
                </Button>
              </Grid>
              <Grid item>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  color="primary"
                  size="large"
                >
                  Sign In
                </Button>
              </Grid>
            </Grid>
          </div>
        </Container>
      </Box>

      <Container className={classes.featureSection} maxWidth="lg">
        <Typography component="h2" variant="h3" color="textPrimary" align="center" gutterBottom>
          Key Features
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" paragraph>
          Discover how MealWise Family can transform your meal planning experience
        </Typography>
        <Grid container spacing={4} style={{ marginTop: 32 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={classes.featureCard} elevation={3}>
              <RestaurantMenu className={classes.featureIcon} />
              <Typography variant="h5" component="h3" gutterBottom>
                Weekly Menu
              </Typography>
              <Typography>
                Browse a curated weekly menu with detailed recipes, ingredients, and preparation steps.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={classes.featureCard} elevation={3}>
              <HowToVote className={classes.featureIcon} />
              <Typography variant="h5" component="h3" gutterBottom>
                Meal Voting
              </Typography>
              <Typography>
                Each family member can vote for their preferred meals, ensuring everyone has a say.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={classes.featureCard} elevation={3}>
              <Notifications className={classes.featureIcon} />
              <Typography variant="h5" component="h3" gutterBottom>
                Real-time Updates
              </Typography>
              <Typography>
                Get instant notifications when family members make selections or when voting closes.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={classes.featureCard} elevation={3}>
              <Group className={classes.featureIcon} />
              <Typography variant="h5" component="h3" gutterBottom>
                Family Roles
              </Typography>
              <Typography>
                Assign different roles to family members with customized permissions and access.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Box className={classes.ctaSection}>
        <Container maxWidth="md">
          <Typography component="h2" variant="h3" gutterBottom>
            Ready to simplify your family meal planning?
          </Typography>
          <Typography variant="h6" paragraph>
            Join MealWise Family today and make mealtime decisions collaborative and stress-free.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            className={classes.ctaButton}
          >
            Create Your Family Account
          </Button>
        </Container>
      </Box>
    </>
  );
};

Home.propTypes = {
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Home);