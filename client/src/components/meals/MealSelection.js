import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import LinkBehavior from '../routing/LinkBehavior';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getWeeklyMenu } from '../../actions/menuActions';
import { getMySelections, createSelection, deleteSelection } from '../../actions/selectionActions';
import { getVotingStatus } from '../../actions/timeActions';
import { getDayName } from '../../utils/dateUtils';

// Material UI
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles
} from '@material-ui/core';
import {
  AccessTime,
  HowToVote,
  CheckCircle,
  Cancel,
  Info
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  statusPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    color: theme.palette.primary.contrastText,
  },
  statusPaperOpen: {
    backgroundColor: theme.palette.primary.light,
  },
  statusPaperClosingSoon: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  statusPaperClosed: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  statusIcon: {
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
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
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 'inherit',
  },
  inactiveText: {
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  chip: {
    margin: theme.spacing(0.5),
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
    zIndex: 2, // Higher than the inactive overlay
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
}));

const MealSelection = ({
  menu: { currentMenu, loading: menuLoading },
  selection: { mySelections, loading: selectionLoading },
  time: { votingStatus, loading: timeLoading },
  getWeeklyMenu,
  getMySelections,
  createSelection,
  deleteSelection,
  getVotingStatus
}) => {
  const classes = useStyles();
  const history = useHistory();
  // Get the actual current day of the week (0-6, Sunday-Saturday)
  const actualCurrentDay = new Date().getDay();
  
  const [currentDay, setCurrentDay] = useState(actualCurrentDay);
  const [selectedTab, setSelectedTab] = useState(actualCurrentDay);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [removeConfirmDialogOpen, setRemoveConfirmDialogOpen] = useState(false);
  const [mealToVote, setMealToVote] = useState(null);
  const [selectionToRemove, setSelectionToRemove] = useState(null);

  useEffect(() => {
    getWeeklyMenu();
    getMySelections(currentDay);
    getVotingStatus();
  }, [getWeeklyMenu, getMySelections, getVotingStatus, currentDay]);

  const handleTabChange = (event, newValue) => {
    // Clear any existing messages when changing tabs
    setError(null);
    setSuccess(null);
    
    setSelectedTab(newValue);
    setCurrentDay(newValue);
    getMySelections(newValue);
  };

  // Show confirmation dialog before voting
  const showVoteConfirmation = (mealId) => {
    setMealToVote(mealId);
    setConfirmDialogOpen(true);
  };

  // Handle the actual voting after confirmation
  const handleVote = async (mealId) => {
    try {
      console.log('Starting vote process for meal ID:', mealId, 'on day:', currentDay);
      setVotingInProgress(true);
      setError(null);
      setSuccess(null);
      
      // Create the selection
      console.log('Calling createSelection action...');
      const result = await createSelection(mealId, currentDay);
      console.log('createSelection result:', result);
      
      // Refresh the selections
      console.log('Refreshing selections...');
      await getMySelections(currentDay);
      
      // Show success message
      console.log('Vote successful, showing success message');
      setSuccess('Your vote has been successfully recorded! The page will refresh in a moment.');
      
      // Refresh the page after a short delay
      console.log('Setting timeout to refresh page...');
      setTimeout(() => {
        console.log('Refreshing page now...');
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error voting for meal:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : 'No response',
        stack: err.stack
      });
      
      // Set error message
      let errorMessage = 'Failed to vote for meal. Please try again.';
      
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = 'Voting is currently closed. Please try again during voting hours.';
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message && err.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      setVotingInProgress(false);
      
      // Show error for a few seconds, then close the dialog
      setTimeout(() => {
        setConfirmDialogOpen(false);
      }, 1000);
    }
  };

  // Show confirmation dialog before removing vote
  const showRemoveVoteConfirmation = (selectionId) => {
    setSelectionToRemove(selectionId);
    setRemoveConfirmDialogOpen(true);
  };

  // Handle the actual vote removal after confirmation
  const handleRemoveVote = async (selectionId) => {
    try {
      console.log('Starting remove vote process for selection ID:', selectionId);
      setVotingInProgress(true);
      setError(null);
      setSuccess(null);
      
      // Delete the selection
      console.log('Calling deleteSelection action...');
      await deleteSelection(selectionId);
      console.log('deleteSelection completed');
      
      // Refresh the selections
      console.log('Refreshing selections...');
      await getMySelections(currentDay);
      
      // Show success message
      console.log('Vote removal successful, showing success message');
      setSuccess('Your vote has been successfully removed! The page will refresh in a moment.');
      
      // Refresh the page after a short delay
      console.log('Setting timeout to refresh page...');
      setTimeout(() => {
        console.log('Refreshing page now...');
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error removing vote:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : 'No response',
        stack: err.stack
      });
      
      // Set error message
      let errorMessage = 'Failed to remove vote. Please try again.';
      
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = 'Voting is currently closed. Please try again during voting hours.';
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message && err.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      setVotingInProgress(false);
      
      // Show error for a few seconds, then close the dialog
      setTimeout(() => {
        setRemoveConfirmDialogOpen(false);
      }, 1000);
    }
  };

  // Reset voting state after operation completes
  const resetVotingState = () => {
    setVotingInProgress(false);
  };

  // Only show the loading screen on initial load, not during voting
  const isInitialLoading = (menuLoading || selectionLoading || timeLoading) && !votingInProgress;

  if (isInitialLoading) {
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </Container>
    );
  }

  // Check if voting is open
  const isVotingOpen = votingStatus && votingStatus.isOpen;

  // Get meals for the current day
  const mealsForDay = currentMenu?.days?.[currentDay]?.meals || [];

  // Check if a meal is already selected
  const isSelected = (mealId) => {
    return mySelections.some((selection) => selection.mealId._id === mealId);
  };

  // Get selection ID for a meal
  const getSelectionId = (mealId) => {
    const selection = mySelections.find((selection) => selection.mealId._id === mealId);
    return selection ? selection._id : null;
  };

  // Check if user has reached selection limit (2 per day)
  const hasReachedLimit = mySelections.length >= 2;

  return (
    <Container className={classes.container}>
      <Typography variant="h4" component="h1" className={classes.title}>
        Meal Selection
      </Typography>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          {error}
        </Alert>
      )}
      
      {/* Success message */}
      {success && (
        <Alert severity="success" style={{ marginBottom: 16 }}>
          {success}
        </Alert>
      )}

      {/* Voting Status */}
      {votingStatus && (
        <Paper 
          className={`${classes.statusPaper} ${
            isVotingOpen 
              ? votingStatus.hoursRemaining < 1 
                ? classes.statusPaperClosingSoon 
                : classes.statusPaperOpen
              : classes.statusPaperClosed
          }`} 
          elevation={3}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <AccessTime fontSize="large" />
            </Grid>
            <Grid item xs>
              <Typography variant="h6">
                {isVotingOpen
                  ? votingStatus.hoursRemaining < 1
                    ? 'Voting is CLOSING SOON!'
                    : 'Voting is OPEN'
                  : 'Voting is CLOSED'}
              </Typography>
              <Typography variant="body1">
                {isVotingOpen
                  ? votingStatus.hoursRemaining < 1
                    ? `Hurry! Only ${votingStatus.timeRemaining} left to make your selections. Your selections: ${mySelections.length}/2`
                    : `You can select up to 2 meals per day. Your selections: ${mySelections.length}/2`
                  : 'You cannot make selections at this time.'}
              </Typography>
              {isVotingOpen && (
                <Typography variant="body2" style={{ marginTop: 8, fontWeight: 'bold' }}>
                  Note: You can only vote for today's meals ({getDayName(actualCurrentDay)}). 
                  You can view other days but voting is restricted to today.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Day Tabs */}
      <Paper className={classes.tabs}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label={0 === actualCurrentDay ? "Sunday (Today)" : "Sunday"} 
            value={0} 
            style={0 === actualCurrentDay ? { fontWeight: 'bold', color: '#4caf50' } : {}}
          />
          <Tab 
            label={1 === actualCurrentDay ? "Monday (Today)" : "Monday"} 
            value={1} 
            style={1 === actualCurrentDay ? { fontWeight: 'bold', color: '#4caf50' } : {}}
          />
          <Tab 
            label={2 === actualCurrentDay ? "Tuesday (Today)" : "Tuesday"} 
            value={2} 
            style={2 === actualCurrentDay ? { fontWeight: 'bold', color: '#4caf50' } : {}}
          />
          <Tab 
            label={3 === actualCurrentDay ? "Wednesday (Today)" : "Wednesday"} 
            value={3} 
            style={3 === actualCurrentDay ? { fontWeight: 'bold', color: '#4caf50' } : {}}
          />
          <Tab 
            label={4 === actualCurrentDay ? "Thursday (Today)" : "Thursday"} 
            value={4} 
            style={4 === actualCurrentDay ? { fontWeight: 'bold', color: '#4caf50' } : {}}
          />
          <Tab 
            label={5 === actualCurrentDay ? "Friday (Today)" : "Friday"} 
            value={5} 
            style={5 === actualCurrentDay ? { fontWeight: 'bold', color: '#4caf50' } : {}}
          />
          <Tab 
            label={6 === actualCurrentDay ? "Saturday (Today)" : "Saturday"} 
            value={6} 
            style={6 === actualCurrentDay ? { fontWeight: 'bold', color: '#4caf50' } : {}}
          />
        </Tabs>
      </Paper>

      {/* Meals Grid */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">
          {getDayName(currentDay)}'s Meal Options
        </Typography>
        
        {isVotingOpen && selectedTab !== actualCurrentDay && (
          <Chip
            icon={<Info />}
            label={`Voting only available for ${getDayName(actualCurrentDay)} (Today)`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {mealsForDay.length > 0 ? (
        <Grid container spacing={4}>
          {mealsForDay.map((meal) => {
            const selected = isSelected(meal._id);
            const selectionId = getSelectionId(meal._id);

            return (
              <Grid item key={meal._id} xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  {/* Grey overlay for non-active days */}
                  {isVotingOpen && selectedTab !== actualCurrentDay && (
                    <Box className={classes.inactiveOverlay}>
                      <Typography variant="body1" className={classes.inactiveText}>
                        Voting only for today
                      </Typography>
                    </Box>
                  )}
                  
                  {selected && (
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
                    <Box mt={2}>
                      {meal.tags &&
                        meal.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            className={classes.chip}
                          />
                        ))}
                    </Box>
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

                    {isVotingOpen && selectedTab === actualCurrentDay ? (
                      selected ? (
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => showRemoveVoteConfirmation(selectionId)}
                          disabled={votingInProgress}
                          startIcon={votingInProgress ? <CircularProgress size={16} /> : <Cancel />}
                        >
                          {votingInProgress ? 'Processing...' : 'Remove Vote'}
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => showVoteConfirmation(meal._id)}
                          disabled={hasReachedLimit || votingInProgress}
                          startIcon={votingInProgress ? <CircularProgress size={16} /> : <HowToVote />}
                        >
                          {votingInProgress ? 'Processing...' : 'Vote'}
                        </Button>
                      )
                    ) : isVotingOpen && selectedTab !== actualCurrentDay ? (
                      <Button
                        size="small"
                        disabled
                        style={{ 
                          color: '#555',
                          backgroundColor: '#f5f5f5',
                          border: '1px dashed #ccc',
                          opacity: 0.8
                        }}
                        startIcon={<Info style={{ color: '#777' }} />}
                      >
                        Voting only for today
                      </Button>
                    ) : null}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper className={classes.noMeals}>
          <Typography variant="body1" paragraph>
            No meals have been added for {getDayName(currentDay)} yet.
          </Typography>
          {currentMenu ? (
            <Alert severity="info">
              Check back later or contact the admin to add meals for this day.
            </Alert>
          ) : (
            <Alert severity="warning">
              No weekly menu has been created yet. Contact the admin to set up the menu.
            </Alert>
          )}
        </Paper>
      )}

      {isVotingOpen && hasReachedLimit && (
        <Box mt={4}>
          <Alert severity="info">
            You have reached the maximum number of selections (2) for {getDayName(currentDay)}.
            Remove a selection if you want to vote for a different meal.
          </Alert>
        </Box>
      )}
      
      {/* Show warning when voting is about to close */}
      {isVotingOpen && votingStatus && votingStatus.timeRemaining && (
        <Box mt={4}>
          <Alert 
            severity={votingStatus.hoursRemaining < 1 ? "warning" : "success"}
            style={{ backgroundColor: votingStatus.hoursRemaining < 1 ? '#fff3e0' : '#e8f5e9' }}
          >
            {votingStatus.hoursRemaining < 1 
              ? `⚠️ Voting is closing soon! Only ${votingStatus.timeRemaining} left to make your selections.` 
              : `✅ Voting is open. You have ${votingStatus.timeRemaining} left to make your selections.`}
          </Alert>
        </Box>
      )}

      {/* Vote Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        PaperProps={{
          style: {
            borderRadius: '8px',
            padding: '8px',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle id="confirm-dialog-title" style={{ textAlign: 'center' }}>
          <HowToVote style={{ color: '#ff9800', fontSize: '48px', marginBottom: '8px' }} />
          <Typography variant="h5">Confirm Your Vote</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="confirm-dialog-description"
            style={{ 
              textAlign: 'center',
              fontSize: '1.1rem',
              padding: '8px 16px'
            }}
          >
            Are you sure you want to vote for this meal?
          </DialogContentText>
          <DialogContentText 
            style={{ 
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#666',
              marginTop: '8px'
            }}
          >
            You can change your vote later if voting is still open.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', padding: '16px' }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="default" 
            variant="outlined"
            size="large"
            style={{ 
              minWidth: '120px',
              borderRadius: '20px',
              marginRight: '8px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setConfirmDialogOpen(false);
              handleVote(mealToVote);
            }} 
            color="primary" 
            variant="contained"
            size="large"
            autoFocus
            style={{ 
              minWidth: '120px',
              borderRadius: '20px'
            }}
          >
            Confirm Vote
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Vote Confirmation Dialog */}
      <Dialog
        open={removeConfirmDialogOpen}
        onClose={() => setRemoveConfirmDialogOpen(false)}
        aria-labelledby="remove-confirm-dialog-title"
        aria-describedby="remove-confirm-dialog-description"
        PaperProps={{
          style: {
            borderRadius: '8px',
            padding: '8px',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle id="remove-confirm-dialog-title" style={{ textAlign: 'center' }}>
          <Cancel style={{ color: '#f44336', fontSize: '48px', marginBottom: '8px' }} />
          <Typography variant="h5">Remove Your Vote?</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="remove-confirm-dialog-description"
            style={{ 
              textAlign: 'center',
              fontSize: '1.1rem',
              padding: '8px 16px'
            }}
          >
            Are you sure you want to remove your vote for this meal?
          </DialogContentText>
          <DialogContentText 
            style={{ 
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#666',
              marginTop: '8px'
            }}
          >
            You can vote again later if voting is still open.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', padding: '16px' }}>
          <Button 
            onClick={() => setRemoveConfirmDialogOpen(false)} 
            color="default" 
            variant="outlined"
            size="large"
            style={{ 
              minWidth: '120px',
              borderRadius: '20px',
              marginRight: '8px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setRemoveConfirmDialogOpen(false);
              handleRemoveVote(selectionToRemove);
            }} 
            color="secondary" 
            variant="contained"
            size="large"
            autoFocus
            style={{ 
              minWidth: '120px',
              borderRadius: '20px'
            }}
          >
            Remove Vote
          </Button>
        </DialogActions>
      </Dialog>


    </Container>
  );
};

MealSelection.propTypes = {
  menu: PropTypes.object.isRequired,
  selection: PropTypes.object.isRequired,
  time: PropTypes.object.isRequired,
  getWeeklyMenu: PropTypes.func.isRequired,
  getMySelections: PropTypes.func.isRequired,
  createSelection: PropTypes.func.isRequired,
  deleteSelection: PropTypes.func.isRequired,
  getVotingStatus: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  menu: state.menu,
  selection: state.selection,
  time: state.time,
});

export default connect(mapStateToProps, {
  getWeeklyMenu,
  getMySelections,
  createSelection,
  deleteSelection,
  getVotingStatus,
})(MealSelection);