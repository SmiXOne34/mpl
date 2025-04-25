import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';

import { getWeeklyMenu } from '../actions/menuActions';
import { getMySelections, createSelection, deleteSelection } from '../actions/selectionActions';
import { getVotingStatus } from '../actions/timeActions';
import { getPopularMeal } from '../actions/selectionActions';

/**
 * MealSelection Component
 * Allows family members to select meals from the weekly menu
 */
const MealSelection = () => {
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const { user } = useSelector(state => state.auth);
  const { menu, loading: menuLoading } = useSelector(state => state.menu);
  const { mySelections, loading: selectionsLoading } = useSelector(state => state.selections);
  const { votingStatus, loading: statusLoading } = useSelector(state => state.time);
  const { popularMeal, loading: popularLoading } = useSelector(state => state.popular);
  
  // Local state
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(getWeeklyMenu());
    dispatch(getMySelections());
    dispatch(getVotingStatus());
    dispatch(getPopularMeal());
    
    // Set up interval to refresh voting status every minute
    const statusInterval = setInterval(() => {
      dispatch(getVotingStatus());
    }, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(statusInterval);
  }, [dispatch]);
  
  // Check if a meal is already selected by the user
  const isMealSelected = (mealId) => {
    return mySelections.some(selection => selection.mealId._id === mealId);
  };
  
  // Get selection ID for a meal (if selected)
  const getSelectionId = (mealId) => {
    const selection = mySelections.find(selection => selection.mealId._id === mealId);
    return selection ? selection._id : null;
  };
  
  // Handle meal selection
  const handleSelectMeal = (meal) => {
    if (mySelections.length >= 2) {
      alert('You can only select 2 meals per day. Please remove a selection first.');
      return;
    }
    
    dispatch(createSelection(meal._id, new Date().getDay()));
  };
  
  // Handle meal deselection
  const handleDeselectMeal = (mealId) => {
    const selectionId = getSelectionId(mealId);
    if (selectionId) {
      dispatch(deleteSelection(selectionId));
    }
  };
  
  // Open meal details dialog
  const handleOpenDetails = (meal) => {
    setSelectedMeal(meal);
    setDialogOpen(true);
  };
  
  // Close meal details dialog
  const handleCloseDetails = () => {
    setDialogOpen(false);
  };
  
  // Loading state
  if (menuLoading || selectionsLoading || statusLoading || popularLoading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading meal options...
        </Typography>
      </Container>
    );
  }
  
  // Error state - no menu found
  if (!menu) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          No menu has been set for this week. Please check back later.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      {/* Voting Status Alert */}
      <Alert 
        severity={votingStatus?.isOpen ? "info" : "warning"}
        icon={<AccessTimeIcon />}
        sx={{ mb: 3 }}
      >
        {votingStatus?.message}
      </Alert>
      
      {/* Popular Meal Section */}
      {popularMeal && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FavoriteIcon color="error" sx={{ mr: 1 }} />
            Most Popular Meal Today
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <CardMedia
                component="img"
                height="140"
                image={popularMeal.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={popularMeal.name}
                sx={{ borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Typography variant="h6">{popularMeal.name}</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {popularMeal.description}
              </Typography>
              <Chip 
                label={`${popularMeal.count} ${popularMeal.count === 1 ? 'vote' : 'votes'}`} 
                color="primary" 
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* My Selections Section */}
      <Typography variant="h5" gutterBottom>
        My Selections ({mySelections.length}/2)
      </Typography>
      
      {mySelections.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          You haven't selected any meals yet. Choose up to 2 meals from the options below.
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {mySelections.map(selection => (
            <Grid item xs={12} sm={6} key={selection._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={selection.mealId.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={selection.mealId.name}
                />
                <CardContent>
                  <Typography variant="h6">{selection.mealId.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selection.mealId.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleOpenDetails(selection.mealId)}
                  >
                    Details
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    disabled={!votingStatus?.isOpen}
                    onClick={() => handleDeselectMeal(selection.mealId._id)}
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Weekly Menu Section */}
      <Typography variant="h5" gutterBottom>
        Weekly Menu Options
      </Typography>
      
      <Grid container spacing={3}>
        {menu.meals.map(meal => {
          const isSelected = isMealSelected(meal._id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={meal._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: isSelected ? 2 : 0,
                  borderColor: 'primary.main'
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={meal.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={meal.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {meal.name}
                    {isSelected && (
                      <Chip 
                        icon={<CheckIcon />} 
                        label="Selected" 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {meal.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {meal.tags && meal.tags.map(tag => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleOpenDetails(meal)}
                  >
                    Details
                  </Button>
                  
                  {isSelected ? (
                    <Button 
                      size="small" 
                      color="error"
                      disabled={!votingStatus?.isOpen}
                      onClick={() => handleDeselectMeal(meal._id)}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      color="primary"
                      disabled={!votingStatus?.isOpen || mySelections.length >= 2}
                      onClick={() => handleSelectMeal(meal)}
                    >
                      Select
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {/* Meal Details Dialog */}
      {selectedMeal && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{selectedMeal.name}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <CardMedia
                  component="img"
                  image={selectedMeal.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={selectedMeal.name}
                  sx={{ borderRadius: 1, mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                  {selectedMeal.tags && selectedMeal.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="body1" paragraph>
                  {selectedMeal.description}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  Ingredients
                </Typography>
                <List dense>
                  {selectedMeal.ingredients && selectedMeal.ingredients.map((ingredient, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`${ingredient.name} - ${ingredient.quantity} ${ingredient.unit || ''}`} 
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Preparation Steps
                </Typography>
                <List>
                  {selectedMeal.preparationSteps && selectedMeal.preparationSteps.map((step, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`${index + 1}. ${step}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            {isMealSelected(selectedMeal._id) ? (
              <Button 
                color="error"
                disabled={!votingStatus?.isOpen}
                onClick={() => {
                  handleDeselectMeal(selectedMeal._id);
                  handleCloseDetails();
                }}
              >
                Remove Selection
              </Button>
            ) : (
              <Button 
                color="primary"
                disabled={!votingStatus?.isOpen || mySelections.length >= 2}
                onClick={() => {
                  handleSelectMeal(selectedMeal);
                  handleCloseDetails();
                }}
              >
                Select This Meal
              </Button>
            )}
            <Button onClick={handleCloseDetails}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default MealSelection;