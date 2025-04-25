import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import LinkBehavior from '../routing/LinkBehavior';
import AICameraGenerator from './AICameraGenerator';

// Material UI
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  makeStyles
} from '@material-ui/core';
import {
  Dashboard as DashboardIcon,
  NavigateNext,
  CameraAlt
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  breadcrumbs: {
    marginBottom: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
  }
}));

const AICameraGeneratorPage = () => {
  const classes = useStyles();

  return (
    <Container className={classes.container}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        aria-label="breadcrumb"
        className={classes.breadcrumbs}
      >
        <Link color="inherit" component={LinkBehavior} to="/admin">
          <DashboardIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }} />
          Admin Dashboard
        </Link>
        <Typography color="textPrimary">AI Camera Meal Generator</Typography>
      </Breadcrumbs>

      {/* Page Title */}
      <Box display="flex" alignItems="center" className={classes.title}>
        <CameraAlt className={classes.headerIcon} color="primary" />
        <Typography variant="h4" component="h1">
          AI Camera Meal Generator
        </Typography>
      </Box>

      {/* Description */}
      <Paper className={classes.paper}>
        <Typography variant="body1" paragraph>
          Use your camera to take photos of your fridge or ingredients, and let AI suggest recipes based on what you have available.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>How it works:</strong> Take a photo of your ingredients or upload an image, then click "Analyze Ingredients & Generate Recipes".
          The AI will identify the ingredients in your photo and suggest recipes you can make with them.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Note: For best results, make sure your ingredients are clearly visible in the photo with good lighting.
        </Typography>
      </Paper>

      {/* AI Camera Generator Component */}
      <AICameraGenerator />
    </Container>
  );
};

export default AICameraGeneratorPage;