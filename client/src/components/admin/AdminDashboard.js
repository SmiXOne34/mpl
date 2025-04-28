import React, { useEffect, useState } from 'react';
import LinkBehavior from '../routing/LinkBehavior';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getWeeklyMenu } from '../../actions/menuActions';
import { getMeals } from '../../actions/mealActions';
import { getUsers } from '../../actions/userActions';
import { getDayName } from '../../utils/dateUtils';

// Material UI
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import {
  Dashboard as DashboardIcon,
  RestaurantMenu,
  People,
  Add,
  Edit,
  Settings,
  CalendarToday,
  EmojiObjects,
  CameraAlt
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  statCard: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginBottom: theme.spacing(3),
  },
  statIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(1),
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 700,
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  actionButton: {
    marginRight: theme.spacing(1),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  listItem: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  listItemLast: {
    borderBottom: 'none',
  },
}));

const AdminDashboard = ({
  auth: { user },
  menu: { currentMenu, loading: menuLoading },
  meal: { meals, loading: mealLoading },
  user: { users, loading: userLoading },
  getWeeklyMenu,
  getMeals,
  getUsers
}) => {
  const classes = useStyles();
  const [currentDay] = useState(new Date().getDay());

  useEffect(() => {
    getWeeklyMenu();
    getMeals();
    getUsers();
  }, [getWeeklyMenu, getMeals, getUsers]);

  const isLoading = menuLoading || mealLoading || userLoading;

  if (isLoading) {
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Typography variant="h4" component="h1" className={classes.title}>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <RestaurantMenu className={classes.statIcon} />
              <Typography variant="h5" component="h2" gutterBottom>
                Total Meals
              </Typography>
              <Typography className={classes.statNumber}>
                {meals ? meals.length : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <People className={classes.statIcon} />
              <Typography variant="h5" component="h2" gutterBottom>
                Total Users
              </Typography>
              <Typography className={classes.statNumber}>
                {users ? users.length : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <DashboardIcon className={classes.statIcon} />
              <Typography variant="h5" component="h2" gutterBottom>
                Weekly Menu
              </Typography>
              <Typography className={classes.statNumber}>
                {currentMenu ? 'Active' : 'Not Set'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <Settings className={classes.statIcon} />
              <Typography variant="h5" component="h2" gutterBottom>
                System Settings
              </Typography>
              <Typography className={classes.statNumber}>
                <Button
                  variant="outlined"
                  size="small"
                  component={LinkBehavior}
                  to="/admin/settings"
                >
                  Configure
                </Button>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider className={classes.divider} />

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Meal Management
            </Typography>
            <Box mb={2}>
              <Button
                variant="contained"
                color="primary"
                component={LinkBehavior}
                to="/admin/meals/new"
                startIcon={<Add />}
                className={classes.actionButton}
              >
                Add New Meal
              </Button>
              <Button
                variant="outlined"
                color="primary"
                component={LinkBehavior}
                to="/admin/menu"
                startIcon={<RestaurantMenu />}
                style={{ marginRight: 8 }}
              >
                Manage Weekly Menu
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                component={LinkBehavior}
                to="/admin/weekmanager"
                startIcon={<CalendarToday />}
              >
                Week Manager
              </Button>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Recent Meals
            </Typography>
            <List>
              {meals && meals.length > 0 ? (
                meals.slice(0, 5).map((meal, index) => (
                  <ListItem
                    key={meal._id}
                    className={
                      index === Math.min(4, meals.length - 1)
                        ? classes.listItemLast
                        : classes.listItem
                    }
                  >
                    <ListItemText
                      primary={meal.name}
                      secondary={`${meal.tags.join(', ')}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        component={LinkBehavior}
                        to={`/admin/meals/edit/${meal._id}`}
                      >
                        <Edit />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No meals found" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Box mb={2}>
              <Button
                variant="contained"
                color="primary"
                component={LinkBehavior}
                to="/admin/users"
                startIcon={<People />}
              >
                Manage Users
              </Button>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Recent Users
            </Typography>
            <List>
              {users && users.length > 0 ? (
                users.slice(0, 5).map((user, index) => (
                  <ListItem
                    key={user._id}
                    className={
                      index === Math.min(4, users.length - 1)
                        ? classes.listItemLast
                        : classes.listItem
                    }
                  >
                    <ListItemText
                      primary={user.name}
                      secondary={`${user.email} (${user.role})`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No users found" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Divider className={classes.divider} />

      {/* Weekly Menu Status */}
      <Typography variant="h5" gutterBottom>
        Weekly Menu Status
      </Typography>
      <Paper className={classes.paper}>
        {currentMenu ? (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Current Menu: Week {currentMenu.weekNumber}, {currentMenu.year}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                component={LinkBehavior}
                to="/admin/menu"
                startIcon={<Edit />}
              >
                Edit Menu
              </Button>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Today's Menu ({getDayName(currentDay)})
            </Typography>

            {currentMenu.days[currentDay]?.meals?.length > 0 ? (
              <List>
                {currentMenu.days[currentDay].meals.map((meal) => (
                  <ListItem key={meal._id} className={classes.listItem}>
                    <ListItemText
                      primary={meal.name}
                      secondary={`${meal.tags.join(', ')}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="warning">
                No meals set for today. Please update the weekly menu.
              </Alert>
            )}
          </>
        ) : (
          <Box textAlign="center" py={3}>
            <Typography variant="h6" gutterBottom>
              No Weekly Menu Set
            </Typography>
            <Typography variant="body1" paragraph>
              You need to create a weekly menu for family members to vote on meals.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={LinkBehavior}
              to="/admin/menu"
              startIcon={<Add />}
            >
              Create Weekly Menu
            </Button>
          </Box>
        )}
      </Paper>

      <Divider className={classes.divider} />

      {/* AI Tools */}
      <Typography variant="h5" gutterBottom>
        AI Meal Tools
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Box display="flex" flexDirection="column" height="100%">
              <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                  AI Meal Generator
                </Typography>
                <Typography variant="body2" paragraph>
                  Use artificial intelligence to generate detailed meal recipes with ingredients and preparation steps.
                  The AI can create recipes based on cuisine type, meal type, dietary restrictions, and more.
                </Typography>
              </Box>
              <Box mt="auto" display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  component={LinkBehavior}
                  to="/admin/ai-meal-generator"
                  startIcon={<EmojiObjects />}
                >
                  Open Meal Generator
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Box display="flex" flexDirection="column" height="100%">
              <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                  AI Camera Meal Generator
                </Typography>
                <Typography variant="body2" paragraph>
                  Take a photo of your fridge or ingredients, and let AI suggest recipes based on what you have available.
                  Perfect for using up ingredients you already have.
                </Typography>
              </Box>
              <Box mt="auto" display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="secondary"
                  component={LinkBehavior}
                  to="/admin/ai-camera-generator"
                  startIcon={<CameraAlt />}
                >
                  Open Camera Generator
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider className={classes.divider} />

      {/* System Settings */}
      <Typography variant="h5" gutterBottom>
        System Settings
      </Typography>
      <Paper className={classes.paper}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" gutterBottom>
              System Configuration
            </Typography>
            <Typography variant="body1">
              Configure application settings and preferences.
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Settings />}
              component={LinkBehavior}
              to="/admin/settings"
            >
              System Settings
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

AdminDashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  menu: PropTypes.object.isRequired,
  meal: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  getWeeklyMenu: PropTypes.func.isRequired,
  getMeals: PropTypes.func.isRequired,
  getUsers: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  menu: state.menu,
  meal: state.meal,
  user: state.user,

});

export default connect(mapStateToProps, {
  getWeeklyMenu,
  getMeals,
  getUsers
})(AdminDashboard);