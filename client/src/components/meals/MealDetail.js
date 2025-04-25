import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import LinkBehavior from '../routing/LinkBehavior';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getMeal } from '../../actions/mealActions';

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
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import {
  ArrowBack,
  Restaurant,
  LocalDining,
  Timer,
  Category,
  Star
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
    height: 'auto',
    maxHeight: 400,
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
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  infoIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
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
  nutritionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  ratingIcon: {
    color: theme.palette.warning.main,
    marginRight: theme.spacing(0.5),
  },
}));

const MealDetail = ({ meal: { meal, loading }, getMeal }) => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  
  useEffect(() => {
    getMeal(id);
  }, [getMeal, id]);
  
  if (loading || !meal) {
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
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBack />}
          onClick={() => history.goBack()}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        
        <Typography variant="h4" component="h1" className={classes.title}>
          {meal.name}
        </Typography>
        
        {meal.imageUrl && (
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className={classes.image}
          />
        )}
        
        <Box mb={3}>
          {meal.tags &&
            meal.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                className={classes.chip}
                color="primary"
                variant="outlined"
              />
            ))}
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {meal.description}
            </Typography>
            
            {meal.ingredients && meal.ingredients.length > 0 && (
              <>
                <Divider className={classes.divider} />
                <Typography variant="h6" gutterBottom>
                  Ingredients
                </Typography>
                <ul>
                  {meal.ingredients.map((ingredient, index) => (
                    <li key={index}>
                      <Typography variant="body1">
                        {typeof ingredient === 'string' 
                          ? ingredient 
                          : `${ingredient.name}${ingredient.quantity ? ` - ${ingredient.quantity}` : ''}${ingredient.unit ? ` ${ingredient.unit}` : ''}`}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </>
            )}
            
            {meal.instructions && (
              <>
                <Divider className={classes.divider} />
                <Typography variant="h6" gutterBottom>
                  Preparation Instructions
                </Typography>
                <Typography variant="body1" paragraph>
                  {meal.instructions}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} style={{ padding: 16 }}>
              <Typography variant="h6" gutterBottom>
                Meal Information
              </Typography>
              
              {meal.prepTime && (
                <div className={classes.infoItem}>
                  <Timer className={classes.infoIcon} />
                  <Typography variant="body1">
                    Prep Time: {meal.prepTime} minutes
                  </Typography>
                </div>
              )}
              
              {meal.cookTime && (
                <div className={classes.infoItem}>
                  <LocalDining className={classes.infoIcon} />
                  <Typography variant="body1">
                    Cook Time: {meal.cookTime} minutes
                  </Typography>
                </div>
              )}
              
              {meal.servings && (
                <div className={classes.infoItem}>
                  <Restaurant className={classes.infoIcon} />
                  <Typography variant="body1">
                    Servings: {meal.servings}
                  </Typography>
                </div>
              )}
              
              {meal.category && (
                <div className={classes.infoItem}>
                  <Category className={classes.infoIcon} />
                  <Typography variant="body1">
                    Category: {meal.category}
                  </Typography>
                </div>
              )}
              
              {meal.rating && (
                <div className={classes.ratingContainer}>
                  <Star className={classes.ratingIcon} />
                  <Typography variant="body1">
                    Rating: {meal.rating}/5
                  </Typography>
                </div>
              )}
              
              {meal.nutrition && (
                <>
                  <Divider style={{ margin: '16px 0' }} />
                  <Typography variant="h6" gutterBottom>
                    Nutrition Facts
                  </Typography>
                  
                  {Object.entries(meal.nutrition).map(([key, value]) => (
                    <div key={key} className={classes.nutritionItem}>
                      <Typography variant="body2">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {value}
                      </Typography>
                    </div>
                  ))}
                </>
              )}
              
              {meal.allergens && meal.allergens.length > 0 && (
                <>
                  <Divider style={{ margin: '16px 0' }} />
                  <Typography variant="h6" gutterBottom>
                    Allergens
                  </Typography>
                  <Box>
                    {meal.allergens.map((allergen) => (
                      <Chip
                        key={allergen}
                        label={allergen}
                        size="small"
                        className={classes.chip}
                        color="secondary"
                      />
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

MealDetail.propTypes = {
  meal: PropTypes.object.isRequired,
  getMeal: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  meal: state.meal,
});

export default connect(mapStateToProps, { getMeal })(MealDetail);