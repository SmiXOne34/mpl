import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateProfile, updatePassword, uploadProfileImage, clearErrors } from '../../actions/authActions';

// Material UI
import {
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Avatar,
  Box,
  IconButton,
  Badge,
  Tooltip,
  Snackbar,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  makeStyles
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { PhotoCamera, Edit, CheckCircle, Close } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  alert: {
    marginBottom: theme.spacing(2),
  },
  profileImageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
  profileImage: {
    width: theme.spacing(20),
    height: theme.spacing(20),
    border: `3px solid ${theme.palette.primary.main}`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    fontSize: '3rem',
  },
  profileHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    position: 'relative',
    width: '100%',
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(4, 2),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.primary.contrastText,
    boxShadow: theme.shadows[3],
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 40%)',
      zIndex: 0,
    },
  },
  profileHeaderContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  },
  profileName: {
    marginTop: theme.spacing(2),
    fontWeight: 600,
  },
  profileEmail: {
    marginTop: theme.spacing(0.5),
    opacity: 0.9,
  },
  uploadButton: {
    marginTop: theme.spacing(2),
  },
  imageInput: {
    display: 'none',
  },
  editIconButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  previewDialog: {
    '& .MuiDialog-paper': {
      borderRadius: 16,
      overflow: 'hidden',
    },
  },
  previewImage: {
    width: '100%',
    maxHeight: 400,
    objectFit: 'contain',
  },
  previewTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
  },
  previewContent: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  successIcon: {
    color: theme.palette.success.main,
    fontSize: 64,
    marginBottom: theme.spacing(2),
  },
}));

const Profile = ({
  auth: { user, loading, error, success },
  updateProfile,
  updatePassword,
  uploadProfileImage,
  clearErrors
}) => {
  const classes = useStyles();
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
    
    // Clear errors when component unmounts
    return () => {
      clearErrors();
    };
  }, [user, clearErrors]);
  
  const { name, email } = profileData;
  const { currentPassword, newPassword, confirmPassword } = passwordData;
  
  const handleProfileChange = e => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  
  const handlePasswordChange = e => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    
    // Clear password match error when typing
    if (e.target.name === 'newPassword' || e.target.name === 'confirmPassword') {
      setPasswordError('');
    }
  };
  
  const handleProfileSubmit = async e => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setSnackbarMessage('Profile information updated successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to update profile information. Please try again.');
      setSnackbarOpen(true);
    }
  };
  
  const handlePasswordSubmit = async e => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    } else if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await updatePassword({
        currentPassword,
        newPassword
      });
      
      // Clear password fields after submission
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSnackbarMessage('Password updated successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to update password. Please check your current password.');
      setSnackbarOpen(true);
    }
  };
  
  const handleImageClick = () => {
    // Trigger the hidden file input
    fileInputRef.current.click();
  };
  
  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match('image.*')) {
        setSnackbarMessage('Please select an image file');
        setSnackbarOpen(true);
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbarMessage('Image size should be less than 5MB');
        setSnackbarOpen(true);
        return;
      }
      
      // Create a preview and show the dialog
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Store the file for later upload when user confirms in the dialog
      const uploadFile = async () => {
        try {
          setImageLoading(true);
          setUploadSuccess(false);
          await uploadProfileImage(file);
          setImageLoading(false);
          
          // Show success state in dialog
          setUploadSuccess(true);
          
          // Show success message in snackbar
          setSnackbarMessage('Profile image updated successfully!');
          setSnackbarOpen(true);
          
          // Clear the preview after a delay
          setTimeout(() => {
            setImagePreview(null);
            setUploadSuccess(false);
          }, 2000);
        } catch (err) {
          setImageLoading(false);
          setUploadSuccess(false);
          console.error('Error uploading image:', err);
          
          // Show error message
          setSnackbarMessage('Failed to update profile image. Please try again.');
          setSnackbarOpen(true);
          
          // Clear the preview
          setImagePreview(null);
        }
      };
      
      // Start upload immediately - the dialog will show progress
      uploadFile();
    }
  };
  
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  // Reset states when dialog is closed
  const handleDialogClose = () => {
    setImagePreview(null);
    setUploadSuccess(false);
  };
  
  // Slide transition for Snackbar
  function SlideTransition(props) {
    return <Slide {...props} direction="up" />;
  }

  return (
    <Container className={classes.container}>
      <Box className={classes.profileHeader}>
        <Box className={classes.profileHeaderContent}>
          <Box position="relative">
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={
                <Tooltip title="Change profile picture">
                  <IconButton 
                    className={classes.editIconButton} 
                    size="small"
                    onClick={handleImageClick}
                    disabled={imageLoading}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <Avatar 
                alt={user?.name || 'User'} 
                src={user?.imageUrl || ''} 
                className={classes.profileImage}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </Badge>
            
            {imageLoading && (
              <Box 
                position="absolute" 
                top={0} 
                left={0} 
                right={0} 
                bottom={0} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                bgcolor="rgba(0,0,0,0.3)"
                borderRadius="50%"
              >
                <CircularProgress color="inherit" />
              </Box>
            )}
          </Box>
          <Typography variant="h4" className={classes.profileName}>
            {user?.name || 'User Profile'}
          </Typography>
          <Typography variant="body1" className={classes.profileEmail}>
            {user?.email || 'user@example.com'}
          </Typography>
          
          <Typography variant="body2" style={{ marginTop: 16, opacity: 0.8 }}>
            Click the edit icon to change your profile picture
          </Typography>
          
          <input
            accept="image/*"
            className={classes.imageInput}
            id="profile-image-input"
            type="file"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
        </Box>
      </Box>
      
      <Typography variant="h4" component="h1" className={classes.title}>
        Profile Settings
      </Typography>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarMessage.includes('successfully') ? 'success' : 'error'}
          icon={snackbarMessage.includes('successfully') ? <CheckCircle /> : undefined}
          variant="filled"
          style={{ 
            minWidth: '300px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Image Preview Dialog */}
      <Dialog
        open={!!imagePreview}
        onClose={handleDialogClose}
        className={classes.previewDialog}
        TransitionComponent={Fade}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle disableTypography className={classes.previewTitle}>
          <Typography variant="h6">Profile Image Preview</Typography>
          <IconButton 
            onClick={handleDialogClose} 
            size="small"
            style={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.previewContent}>
          {imageLoading ? (
            <Box display="flex" flexDirection="column" alignItems="center" p={3}>
              <CircularProgress size={48} color="primary" />
              <Typography variant="body1" style={{ marginTop: 16 }}>
                Uploading your profile image...
              </Typography>
            </Box>
          ) : uploadSuccess ? (
            <Box display="flex" flexDirection="column" alignItems="center" p={3}>
              <CheckCircle className={classes.successIcon} />
              <Typography variant="h6" gutterBottom>
                Profile Image Updated!
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Your new profile image has been saved successfully.
              </Typography>
            </Box>
          ) : (
            <>
              <img 
                src={imagePreview} 
                alt="Profile Preview" 
                className={classes.previewImage} 
              />
              <Box mt={3}>
                <Typography variant="body1" color="textSecondary">
                  This is how your profile image will look
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {uploadSuccess ? (
            <Button 
              onClick={handleDialogClose} 
              color="primary"
              variant="contained"
              fullWidth
            >
              Done
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => setImagePreview(null)} 
                color="default"
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                variant="contained"
                disabled={imageLoading}
                onClick={() => {
                  // The image is already being uploaded in handleImageChange
                  // This is just for UX to close the dialog
                  setImagePreview(null);
                }}
              >
                {imageLoading ? 'Uploading...' : 'Close'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Profile Information */}
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Update Profile Information
        </Typography>
        
        {error && !passwordError && (
          <Alert severity="error" className={classes.alert}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" className={classes.alert}>
            Profile updated successfully
          </Alert>
        )}
        
        <form onSubmit={handleProfileSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="name"
                value={name}
                onChange={handleProfileChange}
                fullWidth
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                value={email}
                onChange={handleProfileChange}
                fullWidth
                variant="outlined"
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitButton}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Profile'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Password Update */}
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Change Password
        </Typography>
        
        {passwordError && (
          <Alert severity="error" className={classes.alert}>
            {passwordError}
          </Alert>
        )}
        
        <form onSubmit={handlePasswordSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Current Password"
                name="currentPassword"
                value={currentPassword}
                onChange={handlePasswordChange}
                fullWidth
                variant="outlined"
                required
                type="password"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="New Password"
                name="newPassword"
                value={newPassword}
                onChange={handlePasswordChange}
                fullWidth
                variant="outlined"
                required
                type="password"
                helperText="Password must be at least 6 characters"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm New Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handlePasswordChange}
                fullWidth
                variant="outlined"
                required
                type="password"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitButton}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Password'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Account Information */}
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Account Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Account Type</Typography>
            <Typography variant="body1">
              {user && user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Member Since</Typography>
            <Typography variant="body1">
              {user && user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'Unknown'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

Profile.propTypes = {
  auth: PropTypes.object.isRequired,
  updateProfile: PropTypes.func.isRequired,
  updatePassword: PropTypes.func.isRequired,
  uploadProfileImage: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, {
  updateProfile,
  updatePassword,
  uploadProfileImage,
  clearErrors
})(Profile);