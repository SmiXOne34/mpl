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
  Card,
  CardContent,
  CardMedia,
  makeStyles
} from '@material-ui/core';
import {
  RestaurantMenu,
  HowToVote,
  People,
  Devices
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  hero: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroContent: {
    maxWidth: 800,
    margin: '0 auto',
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
  },
  featureIcon: {
    fontSize: 60,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  featureMedia: {
    paddingTop: '56.25%', // 16:9
    height: 0,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
    marginTop: theme.spacing(8),
  },
}));

const Landing = ({ isAuthenticated }) => {
  const classes = useStyles();

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <>
      {/* Hero Section */}
      <div className={classes.hero}>
        <Container maxWidth="md">
          <div className={classes.heroContent}>
            <Typography component="h1" variant="h2" color="textPrimary" gutterBottom>
              MealWise Family
            </Typography>
            <Typography variant="h5" color="textSecondary" paragraph>
              Simplify family meal planning with our collaborative platform.
              Vote on meals, track preferences, and eliminate the daily "What's for dinner?" debate.
            </Typography>
            <div className={classes.heroButtons}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    component={RouterLink}
                    to="/register"
                  >
                    Get Started
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    component={RouterLink}
                    to="/login"
                  >
                    Log In
                  </Button>
                </Grid>
              </Grid>
            </div>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container className={classes.featureSection} maxWidth="md">
        <Typography variant="h4" align="center" color="textPrimary" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={4} style={{ marginTop: 16 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.featureCard}>
              <CardContent>
                <Box display="flex" justifyContent="center">
                  <RestaurantMenu className={classes.featureIcon} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Meal Planning
                </Typography>
                <Typography align="center">
                  Create weekly menus with a variety of meal options for each day.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.featureCard}>
              <CardContent>
                <Box display="flex" justifyContent="center">
                  <HowToVote className={classes.featureIcon} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Democratic Voting
                </Typography>
                <Typography align="center">
                  Family members vote on their preferred meals for each day.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.featureCard}>
              <CardContent>
                <Box display="flex" justifyContent="center">
                  <People className={classes.featureIcon} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Family Collaboration
                </Typography>
                <Typography align="center">
                  See what others have voted for and discover popular choices.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.featureCard}>
              <CardContent>
                <Box display="flex" justifyContent="center">
                  <Devices className={classes.featureIcon} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Accessible Anywhere
                </Typography>
                <Typography align="center">
                  Works on all devices so everyone can participate from anywhere.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box bgcolor="background.paper" py={8}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" color="textPrimary" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4} style={{ marginTop: 16 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} style={{ padding: 24, height: '100%' }}>
                <Typography variant="h5" gutterBottom align="center">
                  1. Create Weekly Menu
                </Typography>
                <Typography variant="body1" paragraph align="center">
                  The family administrator sets up the weekly menu with meal options for each day.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} style={{ padding: 24, height: '100%' }}>
                <Typography variant="h5" gutterBottom align="center">
                  2. Family Votes
                </Typography>
                <Typography variant="body1" paragraph align="center">
                  Family members vote on their preferred meals during the designated voting period.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} style={{ padding: 24, height: '100%' }}>
                <Typography variant="h5" gutterBottom align="center">
                  3. Enjoy Meals Together
                </Typography>
                <Typography variant="body1" paragraph align="center">
                  The most popular meal is automatically selected, and everyone knows what's for dinner!
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <footer className={classes.footer}>
        <Typography variant="h6" align="center" gutterBottom>
          MealWise Family
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          Making family meal planning simple and collaborative
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: 16 }}>
          © {new Date().getFullYear()} MealWise Family. All rights reserved.
        </Typography>
      </footer>
    </>
  );
};

Landing.propTypes = {
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Landing);