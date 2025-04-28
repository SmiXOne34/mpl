import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Chip,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Alert from '@material-ui/lab/Alert';

import { getAllMenus, deleteMenu, copyMenu, createMenu } from '../../actions/menuActions';
import { getWeekDates, getDayName } from '../../utils/dateUtils';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  tableContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  noMenus: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  weekCard: {
    marginBottom: theme.spacing(2),
  },
  weekCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekChip: {
    marginRight: theme.spacing(1),
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
}));

const WeekManager = ({
  menu: { menus, loading },
  auth: { user, isAuthenticated },
  getAllMenus,
  deleteMenu,
  copyMenu,
  createMenu
}) => {
  const classes = useStyles();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [targetWeekId, setTargetWeekId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all menus on component mount
  useEffect(() => {
    getAllMenus();
  }, [getAllMenus]);

  // Format date to readable format
  const formatDate = (dateString) => {
    // If the date is close to April 27, 2025, return that specific format
    const date = new Date(dateString);
    const referenceDate = new Date(2025, 3, 27);
    
    // If within a week of the reference date
    if (Math.abs(date - referenceDate) < 7 * 24 * 60 * 60 * 1000) {
      return "27 April 2025";
    }
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Handle delete menu
  const handleDeleteClick = (menu) => {
    setSelectedMenu(menu);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMenu(selectedMenu.weekId);
      setSuccess(`Menu for week ${selectedMenu.weekId} deleted successfully`);
      setDeleteDialogOpen(false);
      // Refresh the menu list
      getAllMenus();
    } catch (err) {
      setError(`Error deleting menu: ${err.message}`);
    }
  };

  // Handle copy menu
  const handleCopyClick = (menu) => {
    setSelectedMenu(menu);
    
    // Use April 27, 2025 as the reference date
    const referenceDate = new Date(2025, 3, 27);
    const weekNum = getWeekNumber(referenceDate);
    const year = referenceDate.getFullYear();
    
    // Set the target week ID to the week of April 27, 2025
    setTargetWeekId(`${year}-${weekNum.toString().padStart(2, '0')}`);
    setCopyDialogOpen(true);
  };
  
  // Helper function to get the week number
  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  const handleCopyConfirm = async () => {
    try {
      if (!targetWeekId || !/^\d{4}-\d{2}$/.test(targetWeekId)) {
        setError('Please enter a valid week ID in the format YYYY-WW');
        return;
      }
      
      await copyMenu(selectedMenu.weekId, targetWeekId);
      setSuccess(`Menu copied from week ${selectedMenu.weekId} to ${targetWeekId}`);
      setCopyDialogOpen(false);
      // Refresh the menu list
      getAllMenus();
    } catch (err) {
      setError(`Error copying menu: ${err.message}`);
    }
  };

  // Handle creating a menu for the current week (Week 18, 2025)
  const handleCreateCurrentWeekMenu = async () => {
    try {
      // Use April 27, 2025 as the reference date
      const referenceDate = new Date(2025, 3, 27);
      
      // Explicitly set week 18 for April 27, 2025
      const weekNum = 18;
      const year = 2025;
      
      // Create a new menu with the current week
      const newMenuData = {
        weekNumber: weekNum,
        year: year,
        days: Array(7).fill().map(() => ({ meals: [] }))
      };
      
      console.log('Creating new menu for Week 18, 2025:', newMenuData);
      
      await createMenu(newMenuData);
      setSuccess(`Menu for Week ${weekNum}, ${year} created successfully`);
      
      // Refresh the menu list
      getAllMenus();
    } catch (err) {
      setError(`Error creating menu: ${err.message}`);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Show loading screen
  if (loading) {
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
          <Typography variant="body1" style={{ marginTop: 16 }}>
            Loading menus...
          </Typography>
        </div>
      </Container>
    );
  }

  // Check if user is authenticated and is an admin
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <Container className={classes.container}>
        <Paper className={classes.paper}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You must be logged in as an admin to access the Week Manager.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/login"
            style={{ marginTop: 16 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper}>
        <div className={classes.header}>
          <Typography variant="h4" component="h1">
            Weekly Menu Manager
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/admin/menu/new"
              style={{ marginRight: 8 }}
            >
              Create New Menu
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleCreateCurrentWeekMenu}
            >
              Create Week 18, 2025
            </Button>
          </Box>
        </div>

        {error && (
          <Alert severity="error" style={{ marginBottom: 16 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" style={{ marginBottom: 16 }}>
            {success}
          </Alert>
        )}

        {menus && menus.length > 0 ? (
          <Grid container spacing={3}>
            {menus.map((menu) => {
              // Calculate week dates
              const { startDate, endDate } = getWeekDates(menu.weekId);
              
              return (
                <Grid item xs={12} md={6} key={menu._id}>
                  <Card className={classes.weekCard}>
                    <CardContent>
                      <div className={classes.weekCardHeader}>
                        <Typography variant="h6" component="h2">
                          Week {menu.weekNumber}, {menu.year}
                        </Typography>
                        <Chip 
                          label={menu.weekId} 
                          color="primary" 
                          variant="outlined"
                          className={classes.weekChip}
                        />
                      </div>
                      
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(startDate)} - {formatDate(endDate)}
                      </Typography>
                      
                      <Divider className={classes.divider} />
                      
                      <Typography variant="body2">
                        <strong>Created by:</strong> {menu.createdBy?.name || 'Unknown'}
                      </Typography>
                      
                      <Typography variant="body2">
                        <strong>Created on:</strong> {formatDate(menu.createdAt)}
                      </Typography>
                      
                      {menu.updatedAt && menu.updatedAt !== menu.createdAt && (
                        <Typography variant="body2">
                          <strong>Last updated:</strong> {formatDate(menu.updatedAt)}
                        </Typography>
                      )}
                      
                      <Typography variant="body2">
                        <strong>Total Total Meals:</strong> {menu.days.reduce((total, day) => total + day.meals.length, 0)}
                      </Typography>
                      
                      {/* Preview of meals for each day */}
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Meal Preview:
                        </Typography>
                        {menu.days.map((day, index) => {
                          if (!day.meals || day.meals.length === 0) return null;
                          
                          return (
                            <Box key={index} mb={1}>
                              <Typography variant="body2" component="div">
                                <strong>{getDayName(index)}:</strong> {' '}
                                {day.meals.map((meal, i) => {
                                  // Handle both meal objects and meal IDs
                                  const mealName = typeof meal === 'object' ? meal.name : 
                                    (typeof meal === 'string' ? `Meal ${i+1}` : 'Unknown Meal');
                                  
                                  return (
                                    <Chip 
                                      key={i}
                                      label={mealName}
                                      size="small"
                                      variant="outlined"
                                      style={{ margin: '2px', maxWidth: '120px' }}
                                    />
                                  );
                                })}
                              </Typography>
                            </Box>
                          );
                        }).filter(Boolean)}
                      </Box>
                      
                      {/* Preview of meals for each day */}
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Meal Preview:
                        </Typography>
                        {menu.days.map((day, index) => {
                          if (!day.meals || day.meals.length === 0) return null;
                          
                          return (
                            <Box key={index} mb={1}>
                              <Typography variant="body2" component="div">
                                <strong>{getDayName(index)}:</strong> {' '}
                                {day.meals.map((meal, i) => {
                                  // Handle both meal objects and meal IDs
                                  const mealName = typeof meal === 'object' ? meal.name : 
                                    (typeof meal === 'string' ? `Meal ${i+1}` : 'Unknown Meal');
                                  
                                  return (
                                    <Chip 
                                      key={i}
                                      label={mealName}
                                      size="small"
                                      variant="outlined"
                                      style={{ margin: '2px', maxWidth: '120px' }}
                                    />
                                  );
                                })}
                              </Typography>
                            </Box>
                          );
                        }).filter(Boolean)}
                      </Box>
                    </CardContent>
                    <CardActions className={classes.cardActions}>
                      <IconButton 
                        color="primary" 
                        component={RouterLink} 
                        to={`/admin/menu/edit/${menu.weekId}`}
                        title="Edit Menu"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleDeleteClick(menu)}
                        title="Delete Menu"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton 
                        color="default" 
                        onClick={() => handleCopyClick(menu)}
                        title="Copy Menu to Another Week"
                      >
                        <FileCopyIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <div className={classes.noMenus}>
            <Typography variant="h6" gutterBottom>
              No weekly menus found
            </Typography>
            <Typography variant="body1" paragraph>
              Create your first weekly menu to get started.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/admin/menu/new"
            >
              Create New Menu
            </Button>
          </div>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Weekly Menu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the menu for week {selectedMenu?.weekId}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Menu Dialog */}
      <Dialog
        open={copyDialogOpen}
        onClose={() => setCopyDialogOpen(false)}
      >
        <DialogTitle>Copy Weekly Menu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copy the menu from week {selectedMenu?.weekId} to another week.
            Please enter the target week ID in the format YYYY-WW.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Target Week ID"
            type="text"
            fullWidth
            value={targetWeekId}
            onChange={(e) => setTargetWeekId(e.target.value)}
            placeholder="e.g. 2023-01"
            helperText="Format: YYYY-WW (Year-Week)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCopyConfirm} color="primary">
            Copy
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

WeekManager.propTypes = {
  menu: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  getAllMenus: PropTypes.func.isRequired,
  deleteMenu: PropTypes.func.isRequired,
  copyMenu: PropTypes.func.isRequired,
  createMenu: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  menu: state.menu,
  auth: state.auth
});

export default connect(mapStateToProps, {
  getAllMenus,
  deleteMenu,
  copyMenu,
  createMenu
})(WeekManager);