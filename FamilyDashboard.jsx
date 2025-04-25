import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  Button
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  Restaurant as RestaurantIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import { getPopularMeal } from '../actions/selectionActions';
import { getFamilySelections } from '../actions/selectionActions';
import { getVotingStatus } from '../actions/timeActions';
import { getWeeklyMenu } from '../actions/menuActions';

/**
 * FamilyDashboard Component
 * Displays real-time information about family meal selections
 */
const FamilyDashboard = () => {
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const { user } = useSelector(state => state.auth);
  const { popularMeal, loading: popularLoading } = useSelector(state => state.popular);
  const { familySelections, loading: selectionsLoading } = useSelector(state => state.familySelections);
  const { votingStatus, loading: statusLoading } = useSelector(state => state.time);
  const { menu, loading: menuLoading } = useSelector(state => state.menu);
  
  // Local state
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(getPopularMeal(currentDay));
    dispatch(getFamilySelections(currentDay));
    dispatch(getVotingStatus());
    dispatch(getWeeklyMenu());
    
    // Set up interval to refresh data every minute
    const refreshInterval = setInterval(() => {
      dispatch(getVotingStatus());
      dispatch(getPopularMeal(currentDay));
      dispatch(getFamilySelections(currentDay));
    }, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [dispatch, currentDay]);
  
  // Change selected day
  const handleDayChange = (day) => {
    setCurrentDay(day);
    dispatch(getPopularMeal(day));
    dispatch(getFamilySelections(day));
  };
  
  // Group selections by user
  const getSelectionsByUser = () => {
    const userSelections = {};
    
    if (familySelections) {
      familySelections.forEach(selection => {
        const userId = selection.userId._id;
        
        if (!userSelections[userId]) {
          userSelections[userId] = {
            user: selection.userId,
            selections: []
          };
        }
        
        userSelections[userId].selections.push(selection);
      });
    }
    
    return Object.values(userSelections);
  };
  
  // Loading state
  if (popularLoading || selectionsLoading || statusLoading || menuLoading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Family Dashboard
      </Typography>
      
      {/* Voting Status Alert */}
      <Alert 
        severity={votingStatus?.isOpen ? "info" : "warning"}
        icon={<AccessTimeIcon />}
        sx={{ mb: 3 }}
      >
        {votingStatus?.message}
      </Alert>
      
      {/* Day Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Day
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {dayNames.map((day, index) => (
            <Chip
              key={index}
              label={day}
              color={currentDay === index ? "primary" : "default"}
              onClick={() => handleDayChange(index)}
              sx={{ fontWeight: currentDay === index ? 'bold' : 'normal' }}
            />
          ))}
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Popular Meal Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FavoriteIcon color="error" sx={{ mr: 1 }} />
                Most Popular Meal for {dayNames[currentDay]}
              </Typography>
              
              {popularMeal ? (
                <Box>
                  <CardMedia
                    component="img"
                    height="200"
                    image={popularMeal.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={popularMeal.name}
                    sx={{ borderRadius: 1, mb: 2 }}
                  />
                  <Typography variant="h6">{popularMeal.name}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {popularMeal.description}
                  </Typography>
                  <Chip 
                    label={`${popularMeal.count} ${popularMeal.count === 1 ? 'vote' : 'votes'}`} 
                    color="primary" 
                  />
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No selections have been made for {dayNames[currentDay]} yet.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Family Selections Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                Family Selections for {dayNames[currentDay]}
              </Typography>
              
              {getSelectionsByUser().length > 0 ? (
                <List>
                  {getSelectionsByUser().map((userSelection, index) => (
                    <React.Fragment key={userSelection.user._id}>
                      {index > 0 && <Divider variant="inset" component="li" />}
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {userSelection.user.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={userSelection.user.name}
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {userSelection.selections.map(selection => (
                                <Chip
                                  key={selection._id}
                                  icon={<RestaurantIcon />}
                                  label={selection.mealId.name}
                                  variant="outlined"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No family members have made selections for {dayNames[currentDay]} yet.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Weekly Menu Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <RestaurantIcon sx={{ mr: 1 }} />
                Weekly Menu Options
              </Typography>
              
              {menu ? (
                <Grid container spacing={2}>
                  {menu.meals.map(meal => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={meal._id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          bgcolor: popularMeal && popularMeal._id === meal._id ? 'rgba(255, 0, 0, 0.05)' : 'inherit',
                          border: popularMeal && popularMeal._id === meal._id ? 1 : 0,
                          borderColor: 'error.light'
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          {meal.name}
                          {popularMeal && popularMeal._id === meal._id && (
                            <Chip 
                              icon={<FavoriteIcon />} 
                              label="Popular" 
                              color="error" 
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {meal.description}
                        </Typography>
                        <Box sx={{ mt: 'auto', pt: 1 }}>
                          {meal.tags && meal.tags.map(tag => (
                            <Chip 
                              key={tag} 
                              label={tag} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No menu has been set for this week.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Make Selection Button */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          href="/meal-selection"
          disabled={!votingStatus?.isOpen}
        >
          {votingStatus?.isOpen ? 'Make Your Selection' : 'Voting Closed'}
        </Button>
      </Box>
    </Container>
  );
};

export default FamilyDashboard;