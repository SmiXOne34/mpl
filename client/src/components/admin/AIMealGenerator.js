import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { createMeal, generateMeal } from '../../actions/mealActions';

// Material UI
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  makeStyles
} from '@material-ui/core';
import {
  EmojiObjects,
  Add,
  Edit,
  Save,
  Cancel,
  CheckCircle
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  formControl: {
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  previewPaper: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  previewCard: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  cardMedia: {
    height: 0,
    paddingTop: '56.25%', // 16:9 aspect ratio
    position: 'relative',
    backgroundSize: 'cover',
  },
  editButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: 'rgba(255,255,255,0.9)',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,1)',
    },
  },
  editField: {
    marginBottom: theme.spacing(2),
  },
  ingredientItem: {
    marginBottom: theme.spacing(1),
  },
  stepItem: {
    marginBottom: theme.spacing(1),
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
}));

const cuisineTypes = [
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'Thai',
  'Mediterranean',
  'American',
  'French',
  'Greek',
  'Spanish',
  'Middle Eastern',
  'Korean',
  'Vietnamese',
  'Caribbean',
  'African',
  'Brazilian',
  'Other'
];

const mealTypes = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Appetizer',
  'Dessert',
  'Snack',
  'Side Dish',
  'Soup',
  'Salad',
  'Sandwich',
  'Pasta',
  'Rice Dish',
  'Meat Dish',
  'Seafood',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Low-Carb',
  'Keto',
  'Paleo'
];

const AIMealGenerator = ({ 
  auth: { user }, 
  meal: { loading: mealLoading, generatedMeal: reduxGeneratedMeal }, 
  createMeal, 
  generateMeal 
}) => {
  const classes = useStyles();
  
  // Form state
  const [formData, setFormData] = useState({
    cuisine: '',
    mealType: '',
    dietaryRestrictions: '',
    ingredients: '',
    complexity: 'medium',
    numberOfMeals: 1
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMeal, setEditedMeal] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  // For debugging
  const [debugInfo, setDebugInfo] = useState({
    apiCallMade: false,
    apiResponseReceived: false,
    lastApiResponse: null,
    dialogOpenAttempted: false
  });
  
  const { cuisine, mealType, dietaryRestrictions, ingredients, complexity, numberOfMeals } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Function to generate a meal using AI
  const handleGenerateMeal = async () => {
    console.log('Starting meal generation process with real API...');
    
    // Reset all relevant state
    setGenerating(true);
    setError(null);
    setPreviewDialogOpen(false); // Close the dialog if it's open
    setEditMode(false); // Exit edit mode if active
    
    // Reset debug info completely
    setDebugInfo({
      apiCallMade: true,
      apiResponseReceived: false,
      dialogOpenAttempted: false,
      lastApiResponse: null
    });
    
    try {
      // Build the prompt for the AI
      const prompt = `Generate a detailed ${cuisine || ''} ${mealType || 'meal'} recipe${
        dietaryRestrictions ? ` that is ${dietaryRestrictions}` : ''
      }${
        ingredients ? ` using ${ingredients}` : ''
      } with ${complexity} complexity.`;
      
      console.log('Sending prompt to API:', prompt);
      
      // Call the generateMeal action with the prompt string directly
      const result = await generateMeal(prompt);
      
      console.log('API returned meal:', result);
      
      // Update the meal data with the API result
      setGeneratedMeal(result);
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        apiResponseReceived: true,
        lastApiResponse: result,
        dialogOpenAttempted: true
      }));
      
      // Open the preview dialog
      console.log('Opening preview dialog with generated meal');
      setPreviewDialogOpen(true);
    } catch (err) {
      console.error('Error generating meal:', err);
      // Show a more detailed error message
      setError(`Failed to generate meal: ${err.message || 'Unknown error'}. Please try again with different parameters.`);
      
      // Show an alert to make the error more visible
      alert(`Error: ${err.message || 'Failed to generate meal'}. The system will only generate real meals, not test data.`);
    } finally {
      // Stop generating regardless of success or failure
      setGenerating(false);
    }
  };
  
  // Function to close the preview dialog
  const handleClosePreviewDialog = () => {
    console.log('Closing preview dialog');
    
    // First close the dialog
    setPreviewDialogOpen(false);
    
    // Reset all relevant state to prevent reopening
    setDebugInfo({
      apiCallMade: false,
      apiResponseReceived: false,
      dialogOpenAttempted: false,
      lastApiResponse: null
    });
    
    // If in edit mode, exit edit mode
    if (editMode) {
      setEditMode(false);
    }
    
    // We're keeping the generatedMeal in state so users can still see it in the UI
    // but we won't automatically reopen the dialog
  };
  
  // Effect to log when preview dialog state changes
  useEffect(() => {
    console.log('Preview dialog state changed:', { isOpen: previewDialogOpen });
  }, [previewDialogOpen]);
  
  // Effect to update local state when Redux state changes
  // We're keeping this minimal since we're using local state for the mock meal
  useEffect(() => {
    // Only update if Redux has a meal and we're in generating state
    if (reduxGeneratedMeal && generating) {
      console.log('Setting local generatedMeal from Redux (not used in current implementation)');
      
      // Clear loading state
      setGenerating(false);
    }
  }, [reduxGeneratedMeal, generating]);
  
  // We're removing this effect completely since we don't need automatic dialog opening
  // The dialog will only open when explicitly triggered by the handleGenerateMeal function
  
  // Add a safety timeout to clear the loading state after 20 seconds
  useEffect(() => {
    let timeoutId = null;
    
    if (generating) {
      console.log('Setting safety timeout to clear loading state');
      timeoutId = setTimeout(() => {
        console.log('Safety timeout triggered - clearing loading state');
        setGenerating(false);
        setError('The meal generation process is taking longer than expected. Please try again.');
      }, 20000);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [generating]);
  
  // Function to open edit mode
  const handleEditMeal = () => {
    setEditedMeal({...generatedMeal});
    setEditMode(true);
    setPreviewDialogOpen(false);
  };
  
  // Function to cancel edit mode
  const handleCancelEdit = () => {
    setEditedMeal(null);
    setEditMode(false);
  };
  
  // Function to handle changes in edited meal
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedMeal({
      ...editedMeal,
      [name]: value
    });
  };
  
  // Function to handle changes in ingredients
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...editedMeal.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    
    setEditedMeal({
      ...editedMeal,
      ingredients: updatedIngredients
    });
  };
  
  // Function to handle changes in preparation steps
  const handleStepChange = (index, value) => {
    const updatedSteps = [...editedMeal.preparationSteps];
    updatedSteps[index] = value;
    
    setEditedMeal({
      ...editedMeal,
      preparationSteps: updatedSteps
    });
  };
  
  // Function to save edited meal
  const handleSaveEdit = () => {
    setGeneratedMeal(editedMeal);
    setEditMode(false);
    setEditedMeal(null);
    setPreviewDialogOpen(true);
  };
  
  // Function to open confirmation dialog
  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
    setPreviewDialogOpen(false);
  };
  
  // Function to close confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  // Function to save the generated meal to the database
  const saveMeal = async () => {
    try {
      if (!generatedMeal) return;
      
      setLoading(true);
      setError(null);
      setConfirmDialogOpen(false);
      
      // Add createdBy field to the meal data
      const mealData = {
        ...generatedMeal,
        createdBy: user._id
      };
      
      // Call the createMeal action
      const result = await createMeal(mealData);
      
      // Show success message
      setSuccess(true);
      
      // Clear generated meal
      setGeneratedMeal(null);
      setLoading(false);
      
      // Reset form after successful save
      setFormData({
        cuisine: '',
        mealType: '',
        dietaryRestrictions: '',
        ingredients: '',
        complexity: 'medium',
        numberOfMeals: 1
      });
      
      // Show a more prominent success message
      console.log('Meal successfully saved to database:', result);
      
      // Automatically redirect to admin page after a short delay
      setTimeout(() => {
        // Close the success dialog
        setSuccess(false);
        
        // Redirect to admin page
        window.location.href = '/admin';
      }, 2000); // 2 second delay before redirecting
      
    } catch (err) {
      console.error("Error saving meal:", err);
      setError("Failed to save meal. Please try again.");
      setLoading(false);
    }
  };
  
  // Close success notification and reset state for a new meal generation
  const handleCloseSuccess = () => {
    setSuccess(false);
    
    // Make sure form is reset
    setFormData({
      cuisine: '',
      mealType: '',
      dietaryRestrictions: '',
      ingredients: '',
      complexity: 'medium',
      numberOfMeals: 1
    });
    
    // Reset all other state
    setGeneratedMeal(null);
    setError(null);
    setLoading(false);
    setGenerating(false);
    setDebugInfo({
      apiCallMade: false,
      apiResponseReceived: false,
      dialogOpenAttempted: false,
      lastApiResponse: null
    });
  };
  
  return (
    <Paper className={classes.paper}>
      <Box display="flex" alignItems="center" mb={2}>
        <EmojiObjects style={{ marginRight: '8px', color: '#4caf50' }} />
        <Typography variant="h5" component="h2">
          AI Meal Generator
        </Typography>
      </Box>
      
      <Typography variant="body1" paragraph>
        Use AI to generate detailed meal recipes with ingredients and preparation steps.
        Customize your request using the options below.
      </Typography>
      
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="cuisine-label">Cuisine Type</InputLabel>
              <Select
                labelId="cuisine-label"
                id="cuisine"
                name="cuisine"
                value={cuisine}
                onChange={onChange}
                label="Cuisine Type"
              >
                <MenuItem value="">
                  <em>Select a cuisine</em>
                </MenuItem>
                {cuisineTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="meal-type-label">Meal Type</InputLabel>
              <Select
                labelId="meal-type-label"
                id="mealType"
                name="mealType"
                value={mealType}
                onChange={onChange}
                label="Meal Type"
              >
                <MenuItem value="">
                  <em>Select a meal type</em>
                </MenuItem>
                {mealTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Dietary Restrictions (optional)"
              name="dietaryRestrictions"
              value={dietaryRestrictions}
              onChange={onChange}
              placeholder="e.g., vegetarian, gluten-free, dairy-free"
              className={classes.formControl}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="complexity-label">Recipe Complexity</InputLabel>
              <Select
                labelId="complexity-label"
                id="complexity"
                name="complexity"
                value={complexity}
                onChange={onChange}
                label="Recipe Complexity"
              >
                <MenuItem value="easy">Easy (Few ingredients, simple steps)</MenuItem>
                <MenuItem value="medium">Medium (Balanced complexity)</MenuItem>
                <MenuItem value="hard">Hard (Many ingredients, complex steps)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Specific Ingredients (optional)"
              name="ingredients"
              value={ingredients}
              onChange={onChange}
              placeholder="e.g., chicken, rice, bell peppers"
              multiline
              rows={2}
              className={classes.formControl}
              helperText="Enter ingredients you want to include, separated by commas"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="number-label">Number of Meals to Generate</InputLabel>
              <Select
                labelId="number-label"
                id="numberOfMeals"
                name="numberOfMeals"
                value={numberOfMeals}
                onChange={onChange}
                label="Number of Meals to Generate"
              >
                <MenuItem value={1}>1 Meal</MenuItem>
                <MenuItem value={3}>3 Meals</MenuItem>
                <MenuItem value={5}>5 Meals</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box mt={2} mb={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateMeal}
            disabled={generating || !cuisine || !mealType || mealLoading}
            startIcon={<EmojiObjects />}
            className={classes.buttonWrapper}
          >
            Generate Meal
            {(generating || mealLoading) && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
          
          {/* Test buttons for development */}
          {process.env.NODE_ENV === 'development' && (
            <>
              {generatedMeal && (
                <Button
                  variant="outlined"
                  color="secondary"
                  style={{ marginLeft: '8px' }}
                  onClick={() => setPreviewDialogOpen(true)}
                >
                  Open Preview Dialog
                </Button>
              )}
              
              <Button
                variant="outlined"
                color="default"
                style={{ marginLeft: '8px' }}
                onClick={() => {
                  // Create a mock meal for testing
                  const mockMeal = {
                    name: `${cuisine || 'Custom'} ${mealType || 'Meal'} Recipe`,
                    description: `A delicious ${cuisine || 'custom'} ${mealType ? mealType.toLowerCase() : 'meal'} that's perfect for any occasion. This is a mock meal for testing.`,
                    ingredients: [
                      { name: "Test ingredient 1", quantity: "2", unit: "cups" },
                      { name: "Test ingredient 2", quantity: "1", unit: "cup" },
                      { name: "Test seasoning", quantity: "2", unit: "tablespoons" }
                    ],
                    preparationSteps: [
                      "Step 1: This is a mock meal for testing.",
                      "Step 2: No API call was made.",
                      "Step 3: Use this for testing the UI."
                    ],
                    tags: [cuisine || 'Custom', mealType || 'Meal', "Test", "Mock"],
                    imageUrl: `https://source.unsplash.com/random/300x200/?${(cuisine || 'food').toLowerCase()},${(mealType || 'meal').toLowerCase()},test`
                  };
                  
                  setGeneratedMeal(mockMeal);
                  setGenerating(false);
                  setTimeout(() => setPreviewDialogOpen(true), 100);
                }}
              >
                Generate Mock Meal (Test)
              </Button>
            </>
          )}
        </Box>
      </form>
      
      {error && (
        <Alert 
          severity="error" 
          style={{ marginBottom: '16px' }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setError(null);
                handleGenerateMeal();
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Debug buttons */}
      {process.env.NODE_ENV === 'development' && (
        <Box mb={2} p={2} border="1px dashed #ccc" borderRadius={4}>
          <Typography variant="subtitle2" gutterBottom>Debug Controls:</Typography>
          <Button 
            variant="outlined" 
            color="default" 
            size="small" 
            onClick={() => {
              console.log('Manual dialog open button clicked');
              console.log('Current generatedMeal:', generatedMeal);
              console.log('Current previewDialogOpen:', previewDialogOpen);
              setPreviewDialogOpen(true);
            }}
            style={{ marginRight: 8 }}
          >
            Force Open Dialog
          </Button>
          <Button 
            variant="outlined" 
            color="default" 
            size="small" 
            onClick={() => {
              console.log('Debug info button clicked');
              console.log('Current state:', {
                generatedMeal,
                reduxGeneratedMeal,
                previewDialogOpen,
                generating,
                error,
                debugInfo
              });
            }}
          >
            Log Debug Info
          </Button>
        </Box>
      )}
      
      {generatedMeal && !editMode && (
        <>
          <Divider className={classes.divider} />
          
          <Typography variant="h6" gutterBottom>
            Generated Meal Preview
          </Typography>
          
          <Card className={classes.previewCard}>
            <CardMedia
              className={classes.cardMedia}
              image={generatedMeal.imageUrl || "https://source.unsplash.com/random/800x450/?food"}
              title={generatedMeal.name}
            >
              <Button
                size="small"
                variant="contained"
                className={classes.editButton}
                startIcon={<Edit />}
                onClick={handleEditMeal}
              >
                Edit
              </Button>
            </CardMedia>
            
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {generatedMeal.name}
              </Typography>
              
              <Box mb={2}>
                {generatedMeal.tags && generatedMeal.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    className={classes.chip}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                {generatedMeal.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              <Box mb={3}>
                {generatedMeal.ingredients.map((ingredient, index) => (
                  <Typography key={index} variant="body2" className={classes.ingredientItem}>
                    • {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </Typography>
                ))}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Preparation Steps
              </Typography>
              <Box mb={2}>
                {generatedMeal.preparationSteps.map((step, index) => (
                  <Typography key={index} variant="body2" className={classes.stepItem}>
                    <strong>{index + 1}.</strong> {step}
                  </Typography>
                ))}
              </Box>
              
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleOpenConfirmDialog}
                  disabled={loading}
                  startIcon={<Add />}
                  className={classes.buttonWrapper}
                >
                  Add to Meal Database
                  {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Edit Mode */}
      {editMode && editedMeal && (
        <>
          <Divider className={classes.divider} />
          
          <Typography variant="h6" gutterBottom>
            Edit Generated Meal
          </Typography>
          
          <Paper elevation={0} className={classes.previewPaper}>
            <TextField
              fullWidth
              label="Meal Name"
              name="name"
              value={editedMeal.name}
              onChange={handleEditChange}
              variant="outlined"
              className={classes.editField}
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={editedMeal.description}
              onChange={handleEditChange}
              variant="outlined"
              multiline
              rows={3}
              className={classes.editField}
            />
            
            <Typography variant="subtitle1" gutterBottom>
              Ingredients:
            </Typography>
            
            {editedMeal.ingredients.map((ingredient, index) => (
              <Grid container spacing={2} key={index} className={classes.editField}>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Unit"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label="Ingredient"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
            ))}
            
            <Typography variant="subtitle1" gutterBottom style={{ marginTop: '16px' }}>
              Preparation Steps:
            </Typography>
            
            {editedMeal.preparationSteps.map((step, index) => (
              <TextField
                key={index}
                fullWidth
                label={`Step ${index + 1}`}
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                variant="outlined"
                multiline
                rows={2}
                className={classes.editField}
              />
            ))}
            
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                color="default"
                onClick={handleCancelEdit}
                style={{ marginRight: '8px' }}
                startIcon={<Cancel />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveEdit}
                startIcon={<Save />}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        </>
      )}
      
      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={handleClosePreviewDialog}
        aria-labelledby="preview-dialog-title"
        aria-describedby="preview-dialog-description"
        maxWidth="md"
        fullWidth
        style={{ zIndex: 1500 }}
        TransitionProps={{
          onEnter: () => console.log('Dialog enter transition started'),
          onEntered: () => console.log('Dialog enter transition completed'),
          onExit: () => console.log('Dialog exit transition started'),
          onExited: () => console.log('Dialog exit transition completed')
        }}
      >
        <DialogTitle id="preview-dialog-title">
          Generated Meal Preview
          <IconButton 
            aria-label="close" 
            onClick={handleClosePreviewDialog}
            style={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Cancel />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {console.log('Preview dialog content rendering, generatedMeal:', generatedMeal)}
          {console.log('Preview dialog open state:', previewDialogOpen)}
          
          {!generatedMeal && (
            <Typography color="error">No meal data available to display</Typography>
          )}
          
          {generatedMeal && (
            <Card className={classes.previewCard} style={{ boxShadow: 'none' }}>
              <CardMedia
                className={classes.cardMedia}
                image={generatedMeal.imageUrl || "https://source.unsplash.com/random/800x450/?food"}
                title={generatedMeal.name}
              />
              
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {generatedMeal.name || 'Unnamed Recipe'}
                </Typography>
                
                <Box mb={2}>
                  {generatedMeal.tags && Array.isArray(generatedMeal.tags) && generatedMeal.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      className={classes.chip}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  {generatedMeal.description || 'No description available'}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  Ingredients
                </Typography>
                <Box mb={3}>
                  {generatedMeal.ingredients && Array.isArray(generatedMeal.ingredients) ? (
                    generatedMeal.ingredients.map((ingredient, index) => (
                      <Typography key={index} variant="body2" className={classes.ingredientItem}>
                        • {ingredient.quantity || ''} {ingredient.unit || ''} {ingredient.name || ''}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2">No ingredients available</Typography>
                  )}
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  Preparation Steps
                </Typography>
                <Box mb={2}>
                  {generatedMeal.preparationSteps && Array.isArray(generatedMeal.preparationSteps) ? (
                    generatedMeal.preparationSteps.map((step, index) => (
                      <Typography key={index} variant="body2" className={classes.stepItem}>
                        <strong>{index + 1}.</strong> {step}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2">No preparation steps available</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleEditMeal} 
            color="primary"
            startIcon={<Edit />}
            style={{ marginRight: 'auto' }}
          >
            Edit Recipe
          </Button>
          <Button 
            onClick={handleClosePreviewDialog} 
            color="default"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleOpenConfirmDialog} 
            color="secondary" 
            variant="contained"
            startIcon={<Add />}
          >
            Add to Database
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="confirm-dialog-title" style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          <Box display="flex" alignItems="center">
            <Add style={{ marginRight: 8, color: '#f50057' }} />
            Confirm Adding Meal to Database
          </Box>
        </DialogTitle>
        <DialogContent style={{ paddingTop: 20 }}>
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              {generatedMeal?.name || 'This meal'}
            </Typography>
            
            <DialogContentText id="confirm-dialog-description">
              Are you sure you want to add this meal to the database? 
              Once added, it will be available for selection in weekly menus.
            </DialogContentText>
          </Box>
          
          {generatedMeal && (
            <Paper variant="outlined" style={{ padding: 16, marginTop: 16, backgroundColor: '#f9f9f9' }}>
              <Typography variant="subtitle2" gutterBottom>Meal Details:</Typography>
              <Box display="flex" flexWrap="wrap" mb={1}>
                {generatedMeal.tags && generatedMeal.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="small" 
                    style={{ margin: '0 4px 4px 0', backgroundColor: '#e0e0e0' }} 
                  />
                ))}
              </Box>
              <Typography variant="body2" color="textSecondary">
                {generatedMeal.description && generatedMeal.description.length > 100 
                  ? `${generatedMeal.description.substring(0, 100)}...` 
                  : generatedMeal.description}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #ddd' }}>
          <Button 
            onClick={handleCloseConfirmDialog} 
            color="default"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={saveMeal} 
            color="secondary" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Add />}
          >
            Yes, Add to Database
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog
        open={success}
        onClose={handleCloseSuccess}
        aria-labelledby="success-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="success-dialog-title" style={{ backgroundColor: '#4caf50', color: 'white' }}>
          <Box display="flex" alignItems="center">
            <CheckCircle style={{ marginRight: 8 }} />
            Success!
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mt={3} mb={3} display="flex" alignItems="center" flexDirection="column">
            <CheckCircle style={{ fontSize: 80, color: '#4caf50', marginBottom: 24 }} />
            <Typography variant="h5" align="center" gutterBottom style={{ fontWeight: 'bold' }}>
              Meal Successfully Added!
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              The meal has been saved to the database and is now available for selection in weekly menus.
            </Typography>
            <Box mt={2} width="100%" textAlign="center">
              <Chip 
                icon={<CheckCircle style={{ color: '#4caf50' }} />} 
                label="Added to Database" 
                style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} 
              />
            </Box>
            <Box mt={3} display="flex" alignItems="center" justifyContent="center">
              <CircularProgress size={20} style={{ marginRight: 8, color: '#4caf50' }} />
              <Typography variant="body2" color="textSecondary">
                Redirecting to admin page...
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Debug Panel (only visible in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Paper style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>Debug Information</Typography>
          <Typography variant="body2">API Call Made: {debugInfo.apiCallMade ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">API Response Received: {debugInfo.apiResponseReceived ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">Dialog Open Attempted: {debugInfo.dialogOpenAttempted ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">Preview Dialog State: {previewDialogOpen ? 'Open' : 'Closed'}</Typography>
          <Typography variant="body2">Local Generated Meal: {generatedMeal ? 'Available' : 'Not Available'}</Typography>
          <Typography variant="body2">Redux Generated Meal: {reduxGeneratedMeal ? 'Available' : 'Not Available'}</Typography>
          <Typography variant="body2">Loading State: {generating ? 'Generating' : (mealLoading ? 'Redux Loading' : 'Not Loading')}</Typography>
          
          {/* Debug Buttons */}
          <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => setPreviewDialogOpen(true)}
              disabled={!generatedMeal}
              size="small"
            >
              Manually Open Preview Dialog
            </Button>
            
            {reduxGeneratedMeal && (
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => {
                  setGeneratedMeal(reduxGeneratedMeal);
                  console.log('Manually set local state from Redux');
                }}
                size="small"
              >
                Set Local from Redux
              </Button>
            )}
            
            <Button 
              variant="outlined" 
              color="default" 
              onClick={() => {
                console.log('Current Redux State:', reduxGeneratedMeal);
                console.log('Current Local State:', generatedMeal);
              }}
              size="small"
            >
              Log States to Console
            </Button>
          </Box>
          
          {/* Show API Response */}
          {debugInfo.lastApiResponse && (
            <Box mt={2}>
              <Typography variant="subtitle2">Last API Response:</Typography>
              <Paper style={{ padding: '10px', maxHeight: '200px', overflow: 'auto', backgroundColor: '#f0f0f0' }}>
                <pre style={{ margin: 0, fontSize: '12px' }}>
                  {JSON.stringify(debugInfo.lastApiResponse, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </Paper>
      )}
    </Paper>
  );
};

AIMealGenerator.propTypes = {
  auth: PropTypes.object.isRequired,
  meal: PropTypes.object.isRequired,
  createMeal: PropTypes.func.isRequired,
  generateMeal: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  meal: state.meal
});

export default connect(mapStateToProps, { createMeal, generateMeal })(AIMealGenerator);