import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import LinkBehavior from '../routing/LinkBehavior';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getWeeklyMenu, createMenu, updateMenu } from '../../actions/menuActions';
import { getMeals } from '../../actions/mealActions';
import { getDayName, getWeekNumber, formatReadableDate } from '../../utils/dateUtils';

// Material UI
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  makeStyles
} from '@material-ui/core';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack,
  Save,
  RestaurantMenu
} from '@material-ui/icons';
import { Alert, Autocomplete } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  tabs: {
    marginBottom: theme.spacing(3),
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  mealItem: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
    position: 'relative',
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  weekInfo: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius,
  },
  noMeals: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
}));

const MenuForm = ({
  menu: { currentMenu, loading: menuLoading },
  meal: { meals, loading: mealLoading },
  getWeeklyMenu,
  createMenu,
  updateMenu,
  getMeals
}) => {
  const classes = useStyles();
  const history = useHistory();
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [menuData, setMenuData] = useState({
    weekNumber: getWeekNumber(new Date()),
    year: new Date().getFullYear(),
    days: Array(7).fill().map(() => ({ meals: [] }))
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load initial data
  useEffect(() => {
    // Only fetch data if not already submitting a form
    if (!submitting) {
      console.log('Fetching initial data...');
      getWeeklyMenu();
      getMeals();
    }
  }, [getWeeklyMenu, getMeals, submitting]);

  // Update local state when currentMenu changes
  useEffect(() => {
    if (currentMenu && !submitting) {
      console.log('Updating menu data from currentMenu:', JSON.stringify(currentMenu, null, 2));
      setMenuData(currentMenu);
    }
  }, [currentMenu, submitting]);

  const handleTabChange = (event, newValue) => {
    setSelectedDay(newValue);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setSelectedMeal(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMeal(null);
  };

  const handleAddMeal = () => {
    if (!selectedMeal) return;
    
    console.log('Adding meal to menu:', selectedMeal);
    console.log('Current menuData:', menuData);
    
    // Ensure the days array has enough elements
    const updatedDays = [...menuData.days];
    while (updatedDays.length <= selectedDay) {
      updatedDays.push({ meals: [] });
    }
    
    // Ensure the day object has a meals array
    if (!updatedDays[selectedDay]) {
      updatedDays[selectedDay] = { meals: [] };
    }
    
    // If meals is not an array, initialize it
    if (!Array.isArray(updatedDays[selectedDay].meals)) {
      updatedDays[selectedDay].meals = [];
    }
    
    // Check if meal is already in the day's menu
    if (updatedDays[selectedDay].meals.some(meal => {
      const mealId = typeof meal === 'object' ? meal._id : meal;
      const selectedId = typeof selectedMeal === 'object' ? selectedMeal._id : selectedMeal;
      return mealId === selectedId;
    })) {
      setError('This meal is already in the menu for this day');
      return;
    }
    
    // Add the full meal object to the day's menu for display purposes
    updatedDays[selectedDay] = {
      ...updatedDays[selectedDay],
      meals: [...updatedDays[selectedDay].meals, selectedMeal]
    };
    
    console.log('Updated days array:', updatedDays);
    
    setMenuData({
      ...menuData,
      days: updatedDays
    });
    
    // Clear any previous errors
    setError(null);
    
    handleCloseDialog();
  };

  const handleRemoveMeal = (mealId) => {
    console.log('Removing meal with ID:', mealId);
    
    const updatedDays = [...menuData.days];
    
    // Ensure the days array has enough elements
    while (updatedDays.length <= selectedDay) {
      updatedDays.push({ meals: [] });
    }
    
    // Ensure the day object has a meals array
    if (!updatedDays[selectedDay]) {
      updatedDays[selectedDay] = { meals: [] };
    }
    
    // If meals is not an array, initialize it
    if (!Array.isArray(updatedDays[selectedDay].meals)) {
      updatedDays[selectedDay].meals = [];
    }
    
    // Filter out the meal with the given ID
    const filteredMeals = updatedDays[selectedDay].meals.filter(meal => {
      // Handle both object meals and string meal IDs
      if (typeof meal === 'object' && meal !== null) {
        return meal._id !== mealId;
      }
      return meal !== mealId;
    });
    
    console.log('Filtered meals:', filteredMeals);
    
    updatedDays[selectedDay] = {
      ...updatedDays[selectedDay],
      meals: filteredMeals
    };
    
    console.log('Updated days after removal:', updatedDays);
    
    setMenuData({
      ...menuData,
      days: updatedDays
    });
  };

  const handleSubmit = () => {
    // Validate the menu data before submitting
    if (!menuData.weekNumber || !menuData.year) {
      setError('Week number and year are required');
      return;
    }
    
    // Reset states
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    // Safety timeout to prevent the form from getting stuck in a loading state
    const safetyTimeout = setTimeout(() => {
      if (submitting) {
        console.log('Safety timeout triggered - resetting submitting state');
        setSubmitting(false);
        setError('The operation took too long. Please try again.');
      }
    }, 10000); // 10 seconds timeout
    
    // Prepare data for API
    const weekNum = menuData.weekNumber.toString().padStart(2, '0');
    const weekId = `${menuData.year}-${weekNum}`;
    
    // Ensure we have 7 days in the array
    let days = [...menuData.days];
    while (days.length < 7) {
      days.push({ meals: [] });
    }
    
    // Process the days array to ensure meal IDs are properly formatted
    const processedDays = days.map(day => {
      // Make sure day.meals is an array
      const meals = Array.isArray(day.meals) ? day.meals : [];
      
      // Extract just the meal IDs
      const mealIds = meals.map(meal => {
        if (typeof meal === 'string') {
          return meal;
        } else if (meal && meal._id) {
          return meal._id;
        }
        return null;
      }).filter(id => id !== null);
      
      console.log('Processed meal IDs for day:', mealIds);
      return { meals: mealIds };
    });
    
    console.log('Final processed days:', processedDays);
    
    const menuPayload = {
      weekNumber: menuData.weekNumber,
      year: menuData.year,
      weekId: weekId,
      days: processedDays
    };
    
    console.log('Submitting menu payload:', JSON.stringify(menuPayload, null, 2));
    
    // Use a Promise to handle the menu update/creation
    const saveMenu = () => {
      if (currentMenu && currentMenu._id) {
        // Determine which ID to use for the update
        // We need to figure out the correct ID format for the API
        let idToUse;
        
        // Option 1: Use the weekId from the current menu if it's in the expected format (YYYY-WW)
        if (currentMenu.weekId && /^\d{4}-\d{2}$/.test(currentMenu.weekId)) {
          idToUse = currentMenu.weekId;
        } 
        // Option 2: Use the generated weekId from the form data
        else if (/^\d{4}-\d{2}$/.test(weekId)) {
          idToUse = weekId;
        }
        // Option 3: As a last resort, try using the MongoDB _id
        else {
          idToUse = currentMenu._id;
        }
        
        console.log('Updating existing menu with ID:', idToUse);
        console.log('Menu details:', {
          weekId: idToUse,
          mongoId: currentMenu._id,
          originalWeekId: currentMenu.weekId,
          year: menuData.year,
          weekNumber: menuData.weekNumber
        });
        
        return updateMenu(idToUse, menuPayload);
      } else {
        console.log('Creating new menu');
        return createMenu(menuPayload);
      }
    };
    
    // Execute the save operation
    saveMenu()
      .then(result => {
        console.log('Menu saved successfully:', result);
        clearTimeout(safetyTimeout);
        setSuccess(true);
        
        // Only redirect if the user explicitly clicked the save button
        // Don't redirect after adding a meal
        if (result) {
          // Navigate back to admin page after a short delay
          setTimeout(() => {
            history.push('/admin');
          }, 1500);
        }
      })
      .catch(err => {
        console.error('Error submitting menu:', err);
        clearTimeout(safetyTimeout);
        
        let errorMessage = 'Failed to save menu. Please try again.';
        
        // Extract error message from response if available
        if (err.response && err.response.data) {
          errorMessage = err.response.data.error || err.response.data.message || errorMessage;
          console.error('Server error response:', JSON.stringify(err.response.data, null, 2));
        } else if (err.message) {
          errorMessage = `${errorMessage}: ${err.message}`;
        }
        
        // Show detailed error for debugging
        console.error('Detailed error:', {
          message: err.message,
          stack: err.stack,
          response: err.response ? {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data
          } : 'No response'
        });
        
        setError(errorMessage);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // Only consider initial data loading, not the loading during form submission
  const initialLoading = (menuLoading || mealLoading) && !submitting;
  
  // Debug loading states
  console.log('Loading states:', { 
    menuLoading, 
    mealLoading, 
    submitting, 
    initialLoading,
    success
  });

  // Show loading screen only during initial data fetch
  if (initialLoading) {
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
          <Typography variant="body1" style={{ marginTop: 16 }}>
            Loading menu data...
          </Typography>
        </div>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper}>
        <Typography variant="h4" component="h1" className={classes.title}>
          {currentMenu && currentMenu._id ? 'Edit Weekly Menu' : 'Create Weekly Menu'}
        </Typography>
        
        {error && (
          <Alert severity="error" style={{ marginBottom: 16 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            style={{ 
              marginBottom: 16,
              padding: '16px',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {currentMenu && currentMenu._id ? 'Menu updated successfully!' : 'Menu created successfully!'}
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Redirecting to admin dashboard...
            </Typography>
          </Alert>
        )}
        
        <Box className={classes.weekInfo}>
          <Typography variant="h6">
            Week {menuData.weekNumber}, {menuData.year}
          </Typography>
          <Typography variant="body1">
            {formatReadableDate(new Date())}
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
            <Tab label="Sunday" />
            <Tab label="Monday" />
            <Tab label="Tuesday" />
            <Tab label="Wednesday" />
            <Tab label="Thursday" />
            <Tab label="Friday" />
            <Tab label="Saturday" />
          </Tabs>
        </Paper>
        
        <Box mb={3}>
          <div className={classes.dayHeader}>
            <Typography variant="h5">
              {getDayName(selectedDay)}'s Meals
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add Meal
            </Button>
          </div>
          
          {menuData.days[selectedDay]?.meals?.length > 0 ? (
            menuData.days[selectedDay].meals.map((meal) => {
              // Handle both meal objects and meal IDs
              const mealId = typeof meal === 'object' ? meal._id : meal;
              const mealName = typeof meal === 'object' ? meal.name : 'Meal';
              const mealDescription = typeof meal === 'object' ? meal.description : '';
              const mealTags = typeof meal === 'object' && Array.isArray(meal.tags) ? meal.tags : [];
              
              return (
                <Paper key={mealId} className={classes.mealItem} elevation={2}>
                  <ListItem>
                    <ListItemText
                      primary={mealName}
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            {mealDescription}
                          </Typography>
                          <Box mt={1}>
                            {mealTags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                className={classes.chip}
                              />
                            ))}
                          </Box>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="secondary"
                        onClick={() => handleRemoveMeal(mealId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              );
            })
          ) : (
            <Paper className={classes.noMeals}>
              <Typography variant="body1" paragraph>
                No meals added for {getDayName(selectedDay)} yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Add Meal
              </Button>
            </Paper>
          )}
        </Box>
        
        <div className={classes.buttonContainer}>
          <Button
            variant="outlined"
            color="primary"
            component={LinkBehavior}
            to="/admin"
            startIcon={<ArrowBack />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={success ? "success" : "primary"}
            onClick={handleSubmit}
            startIcon={submitting ? null : <Save />}
            disabled={submitting}
            style={{ minWidth: '150px' }}
          >
            {submitting ? (
              <Box display="flex" alignItems="center">
                <CircularProgress size={20} style={{ marginRight: 8 }} />
                <span>{success ? 'Success!' : 'Saving...'}</span>
              </Box>
            ) : currentMenu && currentMenu._id ? (
              'Update Menu'
            ) : (
              'Create Menu'
            )}
          </Button>
        </div>
      </Paper>
      
      {/* Add Meal Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Meal to {getDayName(selectedDay)}</DialogTitle>
        <DialogContent>
          {meals && meals.length > 0 ? (
            <Autocomplete
              options={meals}
              getOptionLabel={(option) => option.name}
              renderOption={(option) => (
                <Box display="flex" alignItems="center">
                  <RestaurantMenu style={{ marginRight: 8 }} />
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {option.tags.join(', ')}
                    </Typography>
                  </Box>
                </Box>
              )}
              onChange={(event, newValue) => {
                setSelectedMeal(newValue);
                setError(null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Meal"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          ) : (
            <Alert severity="warning">
              No meals available. Please create meals first.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleAddMeal}
            color="primary"
            variant="contained"
            disabled={!selectedMeal}
          >
            Add to Menu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

MenuForm.propTypes = {
  menu: PropTypes.object.isRequired,
  meal: PropTypes.object.isRequired,
  getWeeklyMenu: PropTypes.func.isRequired,
  createMenu: PropTypes.func.isRequired,
  updateMenu: PropTypes.func.isRequired,
  getMeals: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  menu: state.menu,
  meal: state.meal,
});

export default connect(mapStateToProps, {
  getWeeklyMenu,
  createMenu,
  updateMenu,
  getMeals,
})(MenuForm);