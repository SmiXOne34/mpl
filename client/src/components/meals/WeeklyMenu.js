import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import LinkBehavior from '../routing/LinkBehavior';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getWeeklyMenu } from '../../actions/menuActions';
import { getMySelections } from '../../actions/selectionActions';
import { getDayName, formatDateRange, getWeekDates } from '../../utils/dateUtils';

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
  CardMedia,
  CardActions,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import {
  ArrowBack,
  RestaurantMenu,
  CheckCircle,
  Info
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
  },
  tabs: {
    marginBottom: theme.spacing(3),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  selectedBadge: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  selectedIcon: {
    marginRight: theme.spacing(0.5),
    fontSize: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  noMeals: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  weekInfo: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const WeeklyMenu = ({
  menu: { currentMenu, loading: menuLoading },
  selection: { mySelections, loading: selectionLoading },
  auth: { user },
  getWeeklyMenu,
  getMySelections
}) => {
  const isAdmin = user && user.role === 'admin';
  const classes = useStyles();
  // April 27, 2025 is a Sunday (day 0)
  const [selectedDay, setSelectedDay] = useState(0);
  
  useEffect(() => {
    // Use April 27, 2025 as the reference date
    const referenceDate = new Date(2025, 3, 27); // Month is 0-indexed (3 = April)
    
    // Explicitly set week 18 for April 27, 2025
    const weekNumber = 18;
    const year = 2025;
    
    console.log(`Fetching menu for Week ${weekNumber}, ${year} (April 27, 2025)`);
    
    getWeeklyMenu(weekNumber, year);
    // Pass the day number directly instead of the day name
    getMySelections(selectedDay);
  }, [getWeeklyMenu, getMySelections, selectedDay]);
  
  const handleTabChange = (event, newValue) => {
    setSelectedDay(newValue);
    // Pass the day number directly instead of the day name
    getMySelections(newValue);
  };
  
  const isLoading = menuLoading || selectionLoading;
  
  if (isLoading) {
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </Container>
    );
  }
  
  if (!currentMenu) {
    return (
      <Container className={classes.container}>
        <Button
          variant="outlined"
          color="primary"
          component={LinkBehavior}
          to="/dashboard"
          startIcon={<ArrowBack />}
          style={{ marginBottom: 16 }}
        >
          Back to Dashboard
        </Button>
        
        <Paper className={classes.paper}>
          <Alert severity="info">
            No weekly menu has been created yet for Week 18, 2025 (April 27, 2025). 
            {isAdmin && (
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  component={LinkBehavior}
                  to="/admin/menu/new"
                >
                  Create Menu for This Week
                </Button>
              </Box>
            )}
          </Alert>
        </Paper>
      </Container>
    );
  }
  
  // Get week date range
  const weekDates = getWeekDates(currentMenu.weekNumber, currentMenu.year);
  const dateRange = formatDateRange(weekDates.start, weekDates.end);
  
  // Get meals for the selected day
  const dayMeals = currentMenu.days && currentMenu.days[selectedDay]?.meals || [];
  
  console.log('Current menu:', currentMenu);
  console.log('Selected day:', selectedDay);
  console.log('Day meals:', dayMeals);
  
  // Check if a meal is selected
  const isSelected = (mealId) => {
    return mySelections && mySelections.some(selection => selection.mealId._id === mealId);
  };
  
  return (
    <Container className={classes.container}>
      <Button
        variant="outlined"
        color="primary"
        component={LinkBehavior}
        to="/dashboard"
        startIcon={<ArrowBack />}
        style={{ marginBottom: 16 }}
      >
        Back to Dashboard
      </Button>
      
      <Typography variant="h4" component="h1" className={classes.title}>
        Weekly Menu
      </Typography>
      
      <Box className={classes.weekInfo}>
        <Typography variant="h6" gutterBottom>
          Week {currentMenu.weekNumber}, {currentMenu.year}
        </Typography>
        <Typography variant="body1">
          {dateRange}
        </Typography>
      </Box>
      
      <Paper className={classes.tabs}>
        <Tabs
          value={selectedDay}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Sunday" value={0} />
          <Tab label="Monday" value={1} />
          <Tab label="Tuesday" value={2} />
          <Tab label="Wednesday" value={3} />
          <Tab label="Thursday" value={4} />
          <Tab label="Friday" value={5} />
          <Tab label="Saturday" value={6} />
        </Tabs>
      </Paper>
      
      <Typography variant="h5" gutterBottom>
        {getDayName(selectedDay)}'s Meals
      </Typography>
      
      {dayMeals.length > 0 ? (
        <Grid container spacing={4}>
          {dayMeals.map((meal) => (
            <Grid item key={meal._id} xs={12} sm={6} md={4}>
              <Card className={classes.card}>
                {isSelected(meal._id) && (
                  <Box className={classes.selectedBadge}>
                    <CheckCircle className={classes.selectedIcon} />
                    <Typography variant="body2">Selected</Typography>
                  </Box>
                )}
                <CardMedia
                  className={classes.cardMedia}
                  image={meal.imageUrl || 'https://source.unsplash.com/random'}
                  title={meal.name}
                />
                <CardContent className={classes.cardContent}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {meal.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    {meal.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    component={LinkBehavior}
                    to={`/meals/${meal._id}`}
                    startIcon={<Info />}
                  >
                    Details
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    component={LinkBehavior}
                    to="/meals/select"
                    startIcon={<RestaurantMenu />}
                  >
                    Selection Page
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper className={classes.noMeals}>
          <Typography variant="body1" paragraph>
            No meals have been added for {getDayName(selectedDay)} yet.
          </Typography>
          <Alert severity="info">
            Check back later or contact the admin to add meals for this day.
          </Alert>
        </Paper>
      )}
      
      <Divider style={{ margin: '32px 0' }} />
      
      <Typography variant="h5" gutterBottom>
        Week at a Glance
      </Typography>
      
      <Grid container spacing={2}>
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const dayMeals = currentMenu.days[day]?.meals || [];
          const isCurrentTab = day === selectedDay;
          
          return (
            <Grid item key={day} xs={12} sm={6} md={4} lg={3}>
              <Card 
                variant="outlined" 
                style={{
                  backgroundColor: isCurrentTab ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    style={{
                      color: isCurrentTab ? '#3f51b5' : 'inherit',
                      fontWeight: isCurrentTab ? 'bold' : 'normal',
                    }}
                  >
                    {getDayName(day)}
                  </Typography>
                  
                  {dayMeals.length > 0 ? (
                    <>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''} available
                      </Typography>
                      
                      {/* Show meal names */}
                      <Box mt={1} mb={2}>
                        {dayMeals.map((meal, index) => (
                          <Typography 
                            key={index} 
                            variant="body2" 
                            style={{ 
                              marginBottom: 4,
                              fontWeight: isSelected(meal._id) ? 'bold' : 'normal',
                              color: isSelected(meal._id) ? '#4caf50' : 'inherit'
                            }}
                          >
                            • {meal.name}
                            {isSelected(meal._id) && ' ✓'}
                          </Typography>
                        ))}
                      </Box>
                      
                      
                      {/* Show meal names */}
                      <Box mt={1} mb={2}>
                        {dayMeals.map((meal, index) => (
                          <Typography 
                            key={index} 
                            variant="body2" 
                            style={{ 
                              marginBottom: 4,
                              fontWeight: isSelected(meal._id) ? 'bold' : 'normal',
                              color: isSelected(meal._id) ? '#4caf50' : 'inherit'
                            }}
                          >
                            • {meal.name}
                            {isSelected(meal._id) && ' ✓'}
                          </Typography>
                        ))}
                      </Box>
                      
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => setSelectedDay(day)}
                      >
                        View Details
                      </Button>
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No meals scheduled
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

WeeklyMenu.propTypes = {
  menu: PropTypes.object.isRequired,
  selection: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  getWeeklyMenu: PropTypes.func.isRequired,
  getMySelections: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  menu: state.menu,
  selection: state.selection,
  auth: state.auth,
});

export default connect(mapStateToProps, {
  getWeeklyMenu,
  getMySelections,
})(WeeklyMenu);