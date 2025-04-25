import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// Material UI
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Divider,
  Button,
  makeStyles
} from '@material-ui/core';
import {
  RestaurantMenu,
  AccessTime,
  Group,
  Security
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(6, 0),
  },
  sectionTitle: {
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(4),
    height: '100%',
  },
  icon: {
    fontSize: 40,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(6, 0),
  },
  ctaButton: {
    marginTop: theme.spacing(2),
  },
}));

const About = () => {
  const classes = useStyles();

  return (
    <Container maxWidth="lg">
      <Box className={classes.section}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          About MealWise Family
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph>
          A collaborative meal planning solution for families
        </Typography>
        
        <Paper className={classes.paper} elevation={2}>
          <Typography variant="body1" paragraph>
            MealWise Family was created to solve a common household dilemma: "What's for dinner?"
            Instead of one person making all the decisions or facing daily negotiations,
            our platform allows every family member to have a voice in meal planning.
          </Typography>
          <Typography variant="body1" paragraph>
            With MealWise Family, parents can set up a weekly menu of options, and family members
            can vote for their preferences. The system automatically tallies votes and helps
            identify the most popular choices, making meal planning democratic and stress-free.
          </Typography>
          <Typography variant="body1">
            Our goal is to reduce mealtime stress, increase family satisfaction with meals,
            and create a more collaborative household environment.
          </Typography>
        </Paper>
      </Box>

      <Divider className={classes.divider} />

      <Box className={classes.section}>
        <Typography variant="h4" className={classes.sectionTitle} align="center">
          How It Works
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" gutterBottom>
                For Parents (Admin)
              </Typography>
              <Typography variant="body1" paragraph>
                As an admin, you can:
              </Typography>
              <ul>
                <li>Create and manage a database of family-favorite meals</li>
                <li>Set up the weekly menu with seven meal options</li>
                <li>View voting results and popular choices</li>
                <li>Manage family member accounts and permissions</li>
                <li>Get insights into family preferences over time</li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" gutterBottom>
                For Family Members
              </Typography>
              <Typography variant="body1" paragraph>
                As a family member, you can:
              </Typography>
              <ul>
                <li>View the weekly menu options with detailed recipes</li>
                <li>Vote for your preferred meals (up to two choices per day)</li>
                <li>See which meals are most popular among the family</li>
                <li>Receive notifications when it's time to vote</li>
                <li>Set personal preferences that help with meal suggestions</li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Divider className={classes.divider} />

      <Box className={classes.section}>
        <Typography variant="h4" className={classes.sectionTitle} align="center">
          Key Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={classes.paper} elevation={3}>
              <RestaurantMenu className={classes.icon} />
              <Typography variant="h6" gutterBottom>
                Meal Database
              </Typography>
              <Typography variant="body2">
                Create and store your family's favorite recipes with ingredients, 
                preparation steps, and dietary information.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={classes.paper} elevation={3}>
              <AccessTime className={classes.icon} />
              <Typography variant="h6" gutterBottom>
                Time-Restricted Voting
              </Typography>
              <Typography variant="body2">
                Voting closes at 11:00 AM each day to allow time for meal preparation,
                and reopens at 4:00 PM for the next day.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={classes.paper} elevation={3}>
              <Group className={classes.icon} />
              <Typography variant="h6" gutterBottom>
                Family Collaboration
              </Typography>
              <Typography variant="body2">
                Everyone gets a say in what's for dinner, promoting family harmony
                and reducing mealtime conflicts.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={classes.paper} elevation={3}>
              <Security className={classes.icon} />
              <Typography variant="h6" gutterBottom>
                Secure Access
              </Typography>
              <Typography variant="body2">
                Each family member has their own secure account with appropriate
                permissions based on their role.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Divider className={classes.divider} />

      <Box className={classes.section} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Ready to transform your family meal planning?
        </Typography>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          color="primary"
          size="large"
          className={classes.ctaButton}
        >
          Get Started Today
        </Button>
      </Box>
    </Container>
  );
};

export default About;