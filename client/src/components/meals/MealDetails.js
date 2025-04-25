import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import LinkBehavior from '../routing/LinkBehavior';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getMeal, clearMeal } from '../../actions/mealActions';
import { createSelection } from '../../actions/selectionActions';
import { getVotingStatus } from '../../actions/timeActions';

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
  ListItemIcon,
  ListItemText,
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import {
  AccessTime,
  Restaurant,
  LocalDining,
  CheckCircle,
  ArrowBack,
  HowToVote
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
    marginBottom: theme.spacing(2),
  },
  image: {
    width: '100%',
    height: 300,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(4),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
}));

const MealDetails = ({
  meal: { meal, loading, error },
  time: { votingStatus, loading: timeLoading },
  auth: { user },
  getMeal,
  clearMeal,
  createSelection,
  getVotingStatus
}) => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  const currentDay = new Date().getDay();
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [votingError, setVotingError] = useState(null);
  const [votingSuccess, setVotingSuccess] = useState(null);

  useEffect(() => {
    getMeal(id);
    getVotingStatus();

    return () => {
      clearMeal();
    };
  }, [getMeal, clearMeal, getVotingStatus, id]);

  const handleVote = async () => {
    try {
      setVotingInProgress(true);
      setVotingError(null);
      setVotingSuccess(null);
      
      await createSelection(meal._id, currentDay);
      
      // Show success message
      setVotingSuccess('Your vote has been successfully recorded!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        history.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error voting for meal:', err);
      
      // Set error message
      let errorMessage = 'Failed to vote for meal. Please try again.';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.error || errorMessage;
      }
      setVotingError(errorMessage);
    } finally {
      setVotingInProgress(false);
    }
  };

  if (loading || timeLoading) {
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={classes.container}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            component={LinkBehavior}
            to="/dashboard"
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  if (!meal) {
    return (
      <Container className={classes.container}>
        <Alert severity="info">Meal not found</Alert>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            component={LinkBehavior}
            to="/dashboard"
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  const canVote = votingStatus && votingStatus.isOpen && user && user.role !== 'viewer';

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper}>
        <Typography variant="h4" component="h1" className={classes.title}>
          {meal.name}
        </Typography>

        {votingError && (
          <Alert severity="error" style={{ marginBottom: 16 }}>
            {votingError}
          </Alert>
        )}
        
        {votingSuccess && (
          <Alert 
            severity="success" 
            style={{ 
              marginBottom: 16,
              padding: '16px',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {votingSuccess}
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Redirecting to dashboard...
            </Typography>
          </Alert>
        )}

        {meal.imageUrl && (
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className={classes.image}
          />
        )}

        <Box mb={2}>
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

        <Typography variant="body1" paragraph>
          {meal.description}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <AccessTime color="primary" />
              <Typography variant="h6" style={{ marginLeft: 8 }}>
                Preparation Time
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              {meal.prepTime} minutes
            </Typography>

            <Box display="flex" alignItems="center" mb={1}>
              <LocalDining color="primary" />
              <Typography variant="h6" style={{ marginLeft: 8 }}>
                Servings
              </Typography>
            </Box>
            <Typography variant="body1">
              {meal.servings} {meal.servings === 1 ? 'person' : 'people'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <Restaurant color="primary" />
              <Typography variant="h6" style={{ marginLeft: 8 }}>
                Dietary Information
              </Typography>
            </Box>
            <Typography variant="body1">
              {meal.dietaryInfo || 'No specific dietary information'}
            </Typography>
          </Grid>
        </Grid>

        <Divider className={classes.divider} />

        <Typography variant="h5" className={classes.sectionTitle}>
          Ingredients
        </Typography>
        <List>
          {meal.ingredients && meal.ingredients.length > 0 ? (
            meal.ingredients.map((ingredient, index) => (
              <ListItem key={index} className={classes.listItem}>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    typeof ingredient === 'string' 
                      ? ingredient 
                      : `${ingredient.name} - ${ingredient.quantity}${ingredient.unit ? ' ' + ingredient.unit : ''}`
                  } 
                />
              </ListItem>
            ))
          ) : (
            <ListItem className={classes.listItem}>
              <ListItemText primary="No ingredients available" />
            </ListItem>
          )}
        </List>

        <Divider className={classes.divider} />

        <Typography variant="h5" className={classes.sectionTitle}>
          Preparation Steps
        </Typography>
        <List>
          {meal.preparationSteps && meal.preparationSteps.length > 0 ? (
            meal.preparationSteps.map((step, index) => (
              <ListItem key={index} className={classes.listItem}>
                <ListItemIcon>
                  <Typography variant="h6" color="primary">
                    {index + 1}.
                  </Typography>
                </ListItemIcon>
                <ListItemText primary={typeof step === 'string' ? step : JSON.stringify(step)} />
              </ListItem>
            ))
          ) : (
            <ListItem className={classes.listItem}>
              <ListItemText primary="No preparation steps available" />
            </ListItem>
          )}
        </List>

        <div className={classes.buttonContainer}>
          <Button
            variant="outlined"
            color="primary"
            component={LinkBehavior}
            to="/dashboard"
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>

          {canVote && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleVote}
              disabled={votingInProgress}
              startIcon={votingInProgress ? <CircularProgress size={16} /> : <HowToVote />}
            >
              {votingInProgress ? 'Processing...' : 'Vote for This Meal'}
            </Button>
          )}

          {user && user.role === 'admin' && (
            <Button
              variant="contained"
              color="secondary"
              component={LinkBehavior}
              to={`/admin/meals/edit/${meal._id}`}
            >
              Edit Meal
            </Button>
          )}
        </div>
      </Paper>
    </Container>
  );
};

MealDetails.propTypes = {
  meal: PropTypes.object.isRequired,
  time: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  getMeal: PropTypes.func.isRequired,
  clearMeal: PropTypes.func.isRequired,
  createSelection: PropTypes.func.isRequired,
  getVotingStatus: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  meal: state.meal,
  time: state.time,
  auth: state.auth,
});

export default connect(mapStateToProps, {
  getMeal,
  clearMeal,
  createSelection,
  getVotingStatus,
})(MealDetails);