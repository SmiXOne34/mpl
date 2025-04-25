import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createMeal } from '../../actions/mealActions';
import axios from 'axios';

// Material UI
import {
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  makeStyles
} from '@material-ui/core';
import {
  CameraAlt,
  PhotoLibrary,
  RestaurantMenu,
  Save,
  Close,
  Refresh,
  CheckCircle,
  Edit,
  Delete
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
  cameraPreview: {
    width: '100%',
    maxWidth: 500,
    height: 300,
    backgroundColor: theme.palette.grey[200],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cameraPlaceholder: {
    color: theme.palette.text.secondary,
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  cameraButtons: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  },
  cameraButton: {
    margin: theme.spacing(0, 1),
  },
  fileInput: {
    display: 'none',
  },
  resultCard: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  resultImage: {
    height: 0,
    paddingTop: '56.25%', // 16:9 aspect ratio
  },
  ingredientsList: {
    marginBottom: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  recipeCard: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  recipeActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
  loadingText: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
  ingredientItem: {
    marginBottom: theme.spacing(1),
  },
  stepItem: {
    marginBottom: theme.spacing(1),
  },
}));

const AICameraGenerator = ({ auth: { user }, createMeal }) => {
  const classes = useStyles();
  const fileInputRef = useRef(null);
  
  // State
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Handle camera activation
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Use the back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions or try uploading an image instead.');
    }
  };
  
  // Handle camera deactivation
  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setCameraActive(false);
  };
  
  // Handle taking a photo
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      // Create a File object from the blob
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      
      // Set the image and preview
      setImage(file);
      setImagePreview(URL.createObjectURL(blob));
      
      // Stop the camera
      stopCamera();
    }, 'image/jpeg', 0.95);
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Reset any previous results
      setDetectedIngredients([]);
      setGeneratedRecipes([]);
    }
  };
  
  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle image analysis
  const analyzeImage = async () => {
    if (!image) {
      setError('Please take a photo or upload an image first.');
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    
    try {
      // Create a FormData object to send the image
      const formData = new FormData();
      formData.append('image', image);
      
      // First, analyze the image to detect ingredients
      const analysisResponse = await axios.post('/api/ai/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Extract the detected ingredients
      const ingredients = analysisResponse.data.ingredients;
      setDetectedIngredients(ingredients);
      
      // Now, generate recipes based on the detected ingredients
      const recipeResponse = await axios.post('/api/ai/generate-recipes', {
        ingredients: ingredients
      });
      
      // Set the generated recipes
      setGeneratedRecipes(recipeResponse.data.recipes);
      
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.response?.data?.msg || 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Handle recipe selection for saving
  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setConfirmDialogOpen(true);
  };
  
  // Handle saving a recipe
  const handleSaveRecipe = async () => {
    if (!selectedRecipe) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Add createdBy field to the recipe data
      const recipeData = {
        ...selectedRecipe,
        createdBy: user._id,
        imageUrl: imagePreview // Use the captured/uploaded image
      };
      
      // Call the createMeal action
      await createMeal(recipeData);
      
      // Show success message
      setSuccess(true);
      setConfirmDialogOpen(false);
      
      // Reset state after successful save
      setTimeout(() => {
        setSuccess(false);
        setImage(null);
        setImagePreview(null);
        setDetectedIngredients([]);
        setGeneratedRecipes([]);
        setSelectedRecipe(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError('Failed to save recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  // Handle reset
  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setDetectedIngredients([]);
    setGeneratedRecipes([]);
    setError(null);
    setSelectedRecipe(null);
    
    if (cameraActive) {
      stopCamera();
    }
  };
  
  return (
    <Paper className={classes.paper}>
      <Typography variant="h5" className={classes.title}>
        AI Camera Meal Generator
      </Typography>
      
      <Typography variant="body1" paragraph>
        Take a photo of your fridge or ingredients, and let AI suggest recipes based on what you have available.
      </Typography>
      
      {/* Camera/Image Upload Section */}
      <div className={classes.cameraContainer}>
        <div className={classes.cameraPreview}>
          {cameraActive ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={classes.cameraImage}
            />
          ) : imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Ingredients" 
              className={classes.cameraImage} 
            />
          ) : (
            <div className={classes.cameraPlaceholder}>
              <CameraAlt style={{ fontSize: 48, marginBottom: 16 }} />
              <Typography variant="body1">
                Take a photo of your ingredients or upload an image
              </Typography>
            </div>
          )}
          
          {/* Hidden canvas for capturing photos */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        
        <div className={classes.cameraButtons}>
          {cameraActive ? (
            <>
              <Button
                variant="contained"
                color="primary"
                className={classes.cameraButton}
                startIcon={<CameraAlt />}
                onClick={takePhoto}
              >
                Take Photo
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                className={classes.cameraButton}
                startIcon={<Close />}
                onClick={stopCamera}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                className={classes.cameraButton}
                startIcon={<CameraAlt />}
                onClick={startCamera}
              >
                Open Camera
              </Button>
              <input
                accept="image/*"
                className={classes.fileInput}
                id="image-upload"
                type="file"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
              <Button
                variant="outlined"
                color="primary"
                className={classes.cameraButton}
                startIcon={<PhotoLibrary />}
                onClick={handleUploadClick}
              >
                Upload Image
              </Button>
              {imagePreview && (
                <Button
                  variant="outlined"
                  color="secondary"
                  className={classes.cameraButton}
                  startIcon={<Refresh />}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              )}
            </>
          )}
        </div>
        
        {imagePreview && !analyzing && !detectedIngredients.length && (
          <Button
            variant="contained"
            color="primary"
            onClick={analyzeImage}
            disabled={analyzing}
            startIcon={<RestaurantMenu />}
          >
            Analyze Ingredients & Generate Recipes
          </Button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading State */}
      {analyzing && (
        <div className={classes.loadingContainer}>
          <CircularProgress size={60} />
          <Typography variant="h6" className={classes.loadingText}>
            Analyzing your ingredients and generating recipes...
          </Typography>
          <Typography variant="body2" color="textSecondary" className={classes.loadingText}>
            This may take a moment as our AI identifies ingredients and creates personalized recipes.
          </Typography>
        </div>
      )}
      
      {/* Detected Ingredients */}
      {detectedIngredients.length > 0 && (
        <div>
          <Typography variant="h6" gutterBottom>
            Detected Ingredients
          </Typography>
          <Box display="flex" flexWrap="wrap" mb={2}>
            {detectedIngredients.map((ingredient, index) => (
              <Chip
                key={index}
                label={ingredient}
                className={classes.chip}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Divider className={classes.divider} />
        </div>
      )}
      
      {/* Generated Recipes */}
      {generatedRecipes.length > 0 && (
        <div>
          <Typography variant="h6" gutterBottom>
            Suggested Recipes
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Based on your available ingredients, here are some recipes you can make:
          </Typography>
          
          <Grid container spacing={3}>
            {generatedRecipes.map((recipe, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card className={classes.recipeCard}>
                  <CardMedia
                    className={classes.resultImage}
                    image={imagePreview || '/static/images/placeholder-food.jpg'}
                    title={recipe.name}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {recipe.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {recipe.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Ingredients:
                    </Typography>
                    <List dense className={classes.ingredientsList}>
                      {recipe.ingredients.map((ingredient, idx) => (
                        <ListItem key={idx} className={classes.ingredientItem}>
                          <ListItemIcon style={{ minWidth: 32 }}>
                            <RestaurantMenu fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Preparation Steps:
                    </Typography>
                    <List dense>
                      {recipe.preparationSteps.map((step, idx) => (
                        <ListItem key={idx} className={classes.stepItem}>
                          <ListItemText 
                            primary={`${idx + 1}. ${step}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions className={classes.recipeActions}>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<Save />}
                      onClick={() => handleSelectRecipe(recipe)}
                    >
                      Save Recipe
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">Save Recipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to save "{selectedRecipe?.name}" to your meal database?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <div className={classes.buttonWrapper}>
            <Button
              onClick={handleSaveRecipe}
              color="primary"
              variant="contained"
              disabled={loading}
            >
              Save
            </Button>
            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Recipe saved successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

AICameraGenerator.propTypes = {
  auth: PropTypes.object.isRequired,
  createMeal: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { createMeal })(AICameraGenerator);