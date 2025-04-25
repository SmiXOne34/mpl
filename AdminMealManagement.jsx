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
  TextField,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Fab,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon
} from '@mui/icons-material';

import { getMeals, createMeal, updateMeal, deleteMeal } from '../actions/mealActions';
import { getWeeklyMenu, createMenu, updateMenu } from '../actions/menuActions';

/**
 * AdminMealManagement Component
 * Allows admin users to manage meals and set the weekly menu
 */
const AdminMealManagement = () => {
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const { user } = useSelector(state => state.auth);
  const { meals, loading: mealsLoading } = useSelector(state => state.meals);
  const { menu, loading: menuLoading } = useSelector(state => state.menu);
  
  // Local state for meal form
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMeal, setCurrentMeal] = useState(null);
  const [mealForm, setMealForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    tags: [],
    ingredients: [{ name: '', quantity: '', unit: '' }],
    preparationSteps: ['']
  });
  
  // Local state for menu management
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [tagFilter, setTagFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(getMeals());
    dispatch(getWeeklyMenu());
  }, [dispatch]);
  
  // Set selected meals when menu is loaded
  useEffect(() => {
    if (menu && menu.meals) {
      setSelectedMeals(menu.meals.map(meal => meal._id));
    }
  }, [menu]);
  
  // Handle meal form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMealForm({
      ...mealForm,
      [name]: value
    });
  };
  
  // Handle tags input change
  const handleTagsChange = (e) => {
    const { value } = e.target;
    setMealForm({
      ...mealForm,
      tags: typeof value === 'string' ? value.split(',') : value
    });
  };
  
  // Handle ingredient change
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...mealForm.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    
    setMealForm({
      ...mealForm,
      ingredients: updatedIngredients
    });
  };
  
  // Add new ingredient field
  const addIngredient = () => {
    setMealForm({
      ...mealForm,
      ingredients: [...mealForm.ingredients, { name: '', quantity: '', unit: '' }]
    });
  };
  
  // Remove ingredient field
  const removeIngredient = (index) => {
    const updatedIngredients = [...mealForm.ingredients];
    updatedIngredients.splice(index, 1);
    
    setMealForm({
      ...mealForm,
      ingredients: updatedIngredients
    });
  };
  
  // Handle preparation step change
  const handleStepChange = (index, value) => {
    const updatedSteps = [...mealForm.preparationSteps];
    updatedSteps[index] = value;
    
    setMealForm({
      ...mealForm,
      preparationSteps: updatedSteps
    });
  };
  
  // Add new preparation step field
  const addStep = () => {
    setMealForm({
      ...mealForm,
      preparationSteps: [...mealForm.preparationSteps, '']
    });
  };
  
  // Remove preparation step field
  const removeStep = (index) => {
    const updatedSteps = [...mealForm.preparationSteps];
    updatedSteps.splice(index, 1);
    
    setMealForm({
      ...mealForm,
      preparationSteps: updatedSteps
    });
  };
  
  // Open meal form for creating a new meal
  const handleOpenCreateForm = () => {
    setEditMode(false);
    setCurrentMeal(null);
    setMealForm({
      name: '',
      description: '',
      imageUrl: '',
      tags: [],
      ingredients: [{ name: '', quantity: '', unit: '' }],
      preparationSteps: ['']
    });
    setFormOpen(true);
  };
  
  // Open meal form for editing an existing meal
  const handleOpenEditForm = (meal) => {
    setEditMode(true);
    setCurrentMeal(meal);
    setMealForm({
      name: meal.name,
      description: meal.description,
      imageUrl: meal.imageUrl || '',
      tags: meal.tags || [],
      ingredients: meal.ingredients && meal.ingredients.length > 0 
        ? meal.ingredients 
        : [{ name: '', quantity: '', unit: '' }],
      preparationSteps: meal.preparationSteps && meal.preparationSteps.length > 0
        ? meal.preparationSteps
        : ['']
    });
    setFormOpen(true);
  };
  
  // Close meal form
  const handleCloseForm = () => {
    setFormOpen(false);
  };
  
  // Submit meal form
  const handleSubmitMeal = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!mealForm.name || !mealForm.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Filter out empty ingredients and steps
    const filteredIngredients = mealForm.ingredients.filter(
      ingredient => ingredient.name.trim() !== '' && ingredient.quantity.trim() !== ''
    );
    
    const filteredSteps = mealForm.preparationSteps.filter(
      step => step.trim() !== ''
    );
    
    if (filteredIngredients.length === 0 || filteredSteps.length === 0) {
      alert('Please add at least one ingredient and one preparation step');
      return;
    }
    
    const mealData = {
      ...mealForm,
      ingredients: filteredIngredients,
      preparationSteps: filteredSteps
    };
    
    if (editMode && currentMeal) {
      dispatch(updateMeal(currentMeal._id, mealData));
    } else {
      dispatch(createMeal(mealData));
    }
    
    setFormOpen(false);
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (meal) => {
    setMealToDelete(meal);
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMealToDelete(null);
  };
  
  // Delete meal
  const handleDeleteMeal = () => {
    if (mealToDelete) {
      dispatch(deleteMeal(mealToDelete._id));
      setDeleteDialogOpen(false);
      setMealToDelete(null);
    }
  };
  
  // Open menu management dialog
  const handleOpenMenuDialog = () => {
    setMenuDialogOpen(true);
  };
  
  // Close menu management dialog
  const handleCloseMenuDialog = () => {
    setMenuDialogOpen(false);
  };
  
  // Toggle meal selection for weekly menu
  const handleToggleMealSelection = (mealId) => {
    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter(id => id !== mealId));
    } else {
      if (selectedMeals.length < 7) {
        setSelectedMeals([...selectedMeals, mealId]);
      } else {
        alert('You can only select 7 meals for the weekly menu');
      }
    }
  };
  
  // Save weekly menu
  const handleSaveMenu = () => {
    if (selectedMeals.length !== 7) {
      alert('Please select exactly 7 meals for the weekly menu');
      return;
    }
    
    const weekId = menu ? menu.weekId : require('../utils/weekUtils').getCurrentWeekId();
    
    const menuData = {
      weekId,
      meals: selectedMeals
    };
    
    if (menu) {
      dispatch(updateMenu(weekId, menuData));
    } else {
      dispatch(createMenu(menuData));
    }
    
    setMenuDialogOpen(false);
  };
  
  // Get all unique tags from meals
  const getAllTags = () => {
    const tagsSet = new Set();
    meals.forEach(meal => {
      if (meal.tags && meal.tags.length > 0) {
        meal.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  };
  
  // Filter meals by tag
  const getFilteredMeals = () => {
    if (!tagFilter) {
      return meals;
    }
    return meals.filter(meal => meal.tags && meal.tags.includes(tagFilter));
  };
  
  // Loading state
  if (mealsLoading || menuLoading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading meal data...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Meal Management
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenCreateForm}
            sx={{ mr: 2 }}
          >
            Add New Meal
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={handleOpenMenuDialog}
          >
            Manage Weekly Menu
          </Button>
        </Box>
      </Box>
      
      {/* Current Weekly Menu Summary */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Current Weekly Menu
        </Typography>
        {menu ? (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Week: {menu.weekId} | Created by: {menu.createdBy?.name || 'Admin'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {menu.meals.map(meal => (
                <Chip 
                  key={meal._id} 
                  label={meal.name} 
                  color="primary" 
                  variant="outlined"
                />
              ))}
            </Box>
          </>
        ) : (
          <Alert severity="info">
            No menu has been set for the current week. Use the "Manage Weekly Menu" button to create one.
          </Alert>
        )}
      </Paper>
      
      {/* Filter Controls */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="tag-filter-label">Filter by Tag</InputLabel>
          <Select
            labelId="tag-filter-label"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            input={<OutlinedInput label="Filter by Tag" />}
          >
            <MenuItem value="">
              <em>All Meals</em>
            </MenuItem>
            {getAllTags().map(tag => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {/* Meals Grid */}
      <Grid container spacing={3}>
        {getFilteredMeals().map(meal => (
          <Grid item xs={12} sm={6} md={4} key={meal._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={meal.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={meal.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div">
                  {meal.name}
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
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenEditForm(meal)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleOpenDeleteDialog(meal)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Meal Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? `Edit Meal: ${currentMeal?.name}` : 'Create New Meal'}
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmitMeal}>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Meal Name"
                  value={mealForm.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="imageUrl"
                  label="Image URL"
                  value={mealForm.imageUrl}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="https://example.com/image.jpg"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={mealForm.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="tags-label">Tags</InputLabel>
                  <Select
                    labelId="tags-label"
                    multiple
                    value={mealForm.tags}
                    onChange={handleTagsChange}
                    input={<OutlinedInput label="Tags" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy', 'italian', 'mexican', 'asian', 'indian', 'comfort-food', 'healthy', 'quick', 'beef', 'chicken', 'seafood', 'pasta', 'soup', 'salad'].map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Ingredients */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Ingredients
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addIngredient}
                  >
                    Add Ingredient
                  </Button>
                </Box>
              </Grid>
              
              {mealForm.ingredients.map((ingredient, index) => (
                <Grid item xs={12} key={`ingredient-${index}`} container spacing={2} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      label="Ingredient Name"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Quantity"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Unit"
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      fullWidth
                      placeholder="g, ml, tbsp, etc."
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton 
                      color="error" 
                      onClick={() => removeIngredient(index)}
                      disabled={mealForm.ingredients.length <= 1}
                    >
                      <RemoveCircleIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              
              {/* Preparation Steps */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Preparation Steps
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addStep}
                  >
                    Add Step
                  </Button>
                </Box>
              </Grid>
              
              {mealForm.preparationSteps.map((step, index) => (
                <Grid item xs={12} key={`step-${index}`} container spacing={2} alignItems="center">
                  <Grid item xs={1}>
                    <Typography variant="body1" align="center">
                      {index + 1}.
                    </Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      label={`Step ${index + 1}`}
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      fullWidth
                      multiline
                      required
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton 
                      color="error" 
                      onClick={() => removeStep(index)}
                      disabled={mealForm.preparationSteps.length <= 1}
                    >
                      <RemoveCircleIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitMeal}
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
          >
            {editMode ? 'Update Meal' : 'Create Meal'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the meal "{mealToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteMeal} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Weekly Menu Management Dialog */}
      <Dialog
        open={menuDialogOpen}
        onClose={handleCloseMenuDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Weekly Menu</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            Select exactly 7 meals for the weekly menu. Currently selected: {selectedMeals.length}/7
          </Alert>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Select</TableCell>
                  <TableCell>Meal Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Tags</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meals.map(meal => (
                  <TableRow 
                    key={meal._id}
                    selected={selectedMeals.includes(meal._id)}
                    hover
                    onClick={() => handleToggleMealSelection(meal._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Chip 
                        color={selectedMeals.includes(meal._id) ? "primary" : "default"}
                        label={selectedMeals.includes(meal._id) ? "Selected" : "Select"}
                        variant={selectedMeals.includes(meal._id) ? "filled" : "outlined"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{meal.name}</TableCell>
                    <TableCell>{meal.description}</TableCell>
                    <TableCell>
                      {meal.tags && meal.tags.map(tag => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMenuDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveMenu}
            variant="contained" 
            color="primary"
            disabled={selectedMeals.length !== 7}
          >
            Save Weekly Menu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminMealManagement;