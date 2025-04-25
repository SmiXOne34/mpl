import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams, useHistory } from 'react-router-dom';
import LinkBehavior from '../routing/LinkBehavior';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getMeal, createMeal, updateMeal, clearMeal } from '../../actions/mealActions';

// Material UI
import {
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack,
  Save
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

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
  formControl: {
    marginBottom: theme.spacing(2),
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
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
  ingredientItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  stepNumber: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(2),
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: theme.spacing(1),
  },
}));

const MealForm = ({
  meal: { meal, loading, error },
  getMeal,
  createMeal,
  updateMeal,
  clearMeal
}) => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    prepTime: '',
    servings: '',
    dietaryInfo: '',
    tags: [],
    ingredients: [''],
    steps: ['']
  });

  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      console.log('Fetching meal with ID:', id);
      getMeal(id);
    } else {
      console.log('Not in edit mode, clearing meal');
      clearMeal();
    }

    return () => {
      clearMeal();
    };
  }, [getMeal, clearMeal, id, isEditMode]);

  useEffect(() => {
    if (meal && isEditMode) {
      console.log('Setting form data from meal:', meal);
      console.log('Meal ID:', meal._id);
      
      // Process ingredients - convert from objects to strings
      const processedIngredients = Array.isArray(meal.ingredients) 
        ? meal.ingredients
            .map(ing => {
              if (typeof ing === 'string') return ing;
              if (ing && ing.name) return ing.name;
              return '';
            })
            .filter(ing => ing !== undefined && ing !== null && ing !== '')
        : [''];
      
      console.log('Processed ingredients:', processedIngredients);
        
      // Process steps - handle both 'steps' and 'preparationSteps' fields
      const processedSteps = Array.isArray(meal.preparationSteps) 
        ? meal.preparationSteps
            .map(step => typeof step === 'string' ? step : String(step || ''))
            .filter(step => step !== undefined && step !== null)
        : Array.isArray(meal.steps)
          ? meal.steps
              .map(step => typeof step === 'string' ? step : String(step || ''))
              .filter(step => step !== undefined && step !== null)
          : [''];
          
      console.log('Processed steps:', processedSteps);
      
      setFormData({
        name: meal.name || '',
        description: meal.description || '',
        imageUrl: meal.imageUrl || '',
        prepTime: meal.prepTime || '',
        servings: meal.servings || '',
        dietaryInfo: meal.dietaryInfo || '',
        tags: Array.isArray(meal.tags) ? meal.tags : [],
        ingredients: processedIngredients.length > 0 ? processedIngredients : [''],
        steps: processedSteps.length > 0 ? processedSteps : ['']
      });
    }
  }, [meal, isEditMode]);

  const {
    name,
    description,
    imageUrl,
    prepTime,
    servings,
    dietaryInfo,
    tags,
    ingredients,
    steps
  } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear error for this field if it exists
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData({
      ...formData,
      tags: tags.filter((tag) => tag !== tagToDelete)
    });
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleIngredientChange = (index, value) => {
    // Ensure value is a string
    const stringValue = typeof value === 'string' ? value : String(value || '');
    const newIngredients = [...ingredients];
    newIngredients[index] = stringValue;
    setFormData({ ...formData, ingredients: newIngredients });
    
    // Clear error for ingredients if it exists
    if (formErrors.ingredients) {
      setFormErrors({ ...formErrors, ingredients: null });
    }
  };

  const handleAddIngredient = () => {
    setFormData({ ...formData, ingredients: [...ingredients, ''] });
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = [...ingredients];
      newIngredients.splice(index, 1);
      setFormData({ ...formData, ingredients: newIngredients });
    }
  };

  const handleStepChange = (index, value) => {
    // Ensure value is a string
    const stringValue = typeof value === 'string' ? value : String(value || '');
    const newSteps = [...steps];
    newSteps[index] = stringValue;
    setFormData({ ...formData, steps: newSteps });
    
    // Clear error for steps if it exists
    if (formErrors.steps) {
      setFormErrors({ ...formErrors, steps: null });
    }
  };

  const handleAddStep = () => {
    setFormData({ ...formData, steps: [...steps, ''] });
  };

  const handleRemoveStep = (index) => {
    if (steps.length > 1) {
      const newSteps = [...steps];
      newSteps.splice(index, 1);
      setFormData({ ...formData, steps: newSteps });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Name is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (prepTime && isNaN(prepTime)) errors.prepTime = 'Prep time must be a number';
    if (servings && isNaN(servings)) errors.servings = 'Servings must be a number';
    
    // Check if there's at least one valid ingredient
    const validIngredients = ingredients.filter(ing => {
      return typeof ing === 'string' && ing.trim().length > 0;
    });
    
    if (validIngredients.length === 0) {
      errors.ingredients = 'At least one ingredient is required';
    } else {
      // Check if all ingredients are filled
      const emptyIngredientIndex = ingredients.findIndex(ing => {
        // Check if ing is a string before calling trim()
        if (typeof ing !== 'string') {
          return true; // Consider non-string values as empty
        }
        return !ing.trim();
      });
      
      if (emptyIngredientIndex !== -1) {
        errors.ingredients = `Ingredient ${emptyIngredientIndex + 1} cannot be empty`;
      }
    }
    
    // Check if there's at least one valid step
    const validSteps = steps.filter(step => {
      return typeof step === 'string' && step.trim().length > 0;
    });
    
    if (validSteps.length === 0) {
      errors.steps = 'At least one preparation step is required';
    } else {
      // Check if all steps are filled
      const emptyStepIndex = steps.findIndex(step => {
        // Check if step is a string before calling trim()
        if (typeof step !== 'string') {
          return true; // Consider non-string values as empty
        }
        return !step.trim();
      });
      
      if (emptyStepIndex !== -1) {
        errors.steps = `Step ${emptyStepIndex + 1} cannot be empty`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!validateForm()) {
        return;
      }
      
      setSubmitting(true);
      
      // Filter out any empty ingredients or steps
      const cleanedFormData = {
        ...formData,
        ingredients: ingredients
          .filter(ing => typeof ing === 'string') // Filter out non-string values
          .filter(ing => ing.trim()) // Filter out empty strings
          .map(ing => ({ 
            name: ing, 
            quantity: '1', 
            unit: 'unit' 
          })), // Convert to object format expected by the API
        preparationSteps: steps
          .filter(step => typeof step === 'string') // Filter out non-string values
          .filter(step => step.trim()), // Filter out empty strings
        prepTime: parseInt(prepTime) || 0,
        servings: parseInt(servings) || 1
      };
      
      // Remove the 'steps' field as it's not used by the API
      delete cleanedFormData.steps;
      
      console.log('Submitting meal data:', cleanedFormData);
      console.log('Current meal state:', meal);
      console.log('ID from URL params:', id);
      
      if (isEditMode) {
        // Make sure we're using the correct ID
        if (!meal || !meal._id) {
          throw new Error('Cannot update meal: No meal ID available');
        }
        
        const mealId = meal._id;
        console.log('Using meal ID for update:', mealId);
        
        try {
          // Add updatedAt timestamp
          cleanedFormData.updatedAt = new Date();
          
          // Add error handling with timeout
          const updatePromise = updateMeal(mealId, cleanedFormData);
          
          // Set a timeout to handle potential hanging requests
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Update request timed out after 15 seconds'));
            }, 15000);
          });
          
          // Race the update against the timeout
          const updatedMeal = await Promise.race([updatePromise, timeoutPromise]);
          console.log('Meal updated successfully:', updatedMeal);
        } catch (updateError) {
          console.error('Failed to update meal:', updateError);
          
          // Add more detailed error logging
          if (updateError.response) {
            console.error('Server response:', {
              status: updateError.response.status,
              data: updateError.response.data,
              headers: updateError.response.headers
            });
          } else if (updateError.request) {
            console.error('No response received:', updateError.request);
          } else {
            console.error('Request setup error:', updateError.message);
          }
          
          throw updateError;
        }
      } else {
        console.log('Creating new meal');
        try {
          const newMeal = await createMeal(cleanedFormData);
          console.log('Meal created successfully:', newMeal);
        } catch (createError) {
          console.error('Failed to create meal:', createError);
          throw createError;
        }
      }
      
      // Redirect to admin page
      history.push('/admin');
    } catch (err) {
      console.error('Error submitting meal:', err);
      
      // Extract detailed error message
      let errorMessage = 'An error occurred while saving the meal. Please try again.';
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data.error || err.response.data.message || `Server error: ${err.response.status}`;
        console.error('Server error details:', {
          status: err.response.status,
          data: err.response.data
        });
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Set form error
      setFormErrors({
        ...formErrors,
        submit: errorMessage
      });
      
      // Show alert for debugging
      console.error('Detailed error:', {
        message: errorMessage,
        originalError: err
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && isEditMode) {
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
      <Paper className={classes.paper}>
        <Typography variant="h4" component="h1" className={classes.title}>
          {isEditMode ? 'Edit Meal' : 'Add New Meal'}
        </Typography>
        
        {error && (
          <Alert severity="error" className={classes.formControl}>
            {error}
          </Alert>
        )}
        
        {formErrors.submit && (
          <Alert severity="error" className={classes.formControl}>
            {formErrors.submit}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Meal Name"
                name="name"
                value={name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={description}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                required
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Image URL"
                name="imageUrl"
                value={imageUrl}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Preparation Time (minutes)"
                name="prepTime"
                value={prepTime}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                type="number"
                error={!!formErrors.prepTime}
                helperText={formErrors.prepTime}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Servings"
                name="servings"
                value={servings}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                type="number"
                error={!!formErrors.servings}
                helperText={formErrors.servings}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Dietary Information"
                name="dietaryInfo"
                value={dietaryInfo}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="e.g., Vegetarian, Gluten-free, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <div className={classes.chips}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    className={classes.chip}
                  />
                ))}
              </div>
              <Box display="flex" alignItems="center" mt={1}>
                <TextField
                  label="Add Tag"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={handleTagKeyPress}
                  variant="outlined"
                  size="small"
                  style={{ marginRight: 8 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Ingredients
              </Typography>
              {formErrors.ingredients && (
                <Alert severity="error" className={classes.formControl}>
                  {formErrors.ingredients}
                </Alert>
              )}
              {ingredients.map((ingredient, index) => (
                <div key={index} className={classes.ingredientItem}>
                  <TextField
                    label={`Ingredient ${index + 1}`}
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    fullWidth
                    variant="outlined"
                    style={{ marginRight: 8 }}
                  />
                  <IconButton
                    color="secondary"
                    onClick={() => handleRemoveIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
              <Button
                variant="outlined"
                color="primary"
                onClick={handleAddIngredient}
                startIcon={<AddIcon />}
                className={classes.addButton}
              >
                Add Ingredient
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Preparation Steps
              </Typography>
              {formErrors.steps && (
                <Alert severity="error" className={classes.formControl}>
                  {formErrors.steps}
                </Alert>
              )}
              {steps.map((step, index) => (
                <div key={index} className={classes.stepItem}>
                  <Typography className={classes.stepNumber}>
                    {index + 1}.
                  </Typography>
                  <TextField
                    label={`Step ${index + 1}`}
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={2}
                    style={{ marginRight: 8 }}
                  />
                  <IconButton
                    color="secondary"
                    onClick={() => handleRemoveStep(index)}
                    disabled={steps.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
              <Button
                variant="outlined"
                color="primary"
                onClick={handleAddStep}
                startIcon={<AddIcon />}
                className={classes.addButton}
              >
                Add Step
              </Button>
            </Grid>
          </Grid>
          
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
              type="submit"
              variant="contained"
              color="primary"
              startIcon={submitting ? null : <Save />}
              disabled={submitting}
              style={{ minWidth: '150px' }}
            >
              {submitting ? (
                <Box display="flex" alignItems="center">
                  <CircularProgress size={20} style={{ marginRight: 8 }} />
                  <span>Saving...</span>
                </Box>
              ) : isEditMode ? (
                'Update Meal'
              ) : (
                'Create Meal'
              )}
            </Button>
          </div>
        </form>
      </Paper>
    </Container>
  );
};

MealForm.propTypes = {
  meal: PropTypes.object.isRequired,
  getMeal: PropTypes.func.isRequired,
  createMeal: PropTypes.func.isRequired,
  updateMeal: PropTypes.func.isRequired,
  clearMeal: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  meal: state.meal,
});

export default connect(mapStateToProps, {
  getMeal,
  createMeal,
  updateMeal,
  clearMeal,
})(MealForm);