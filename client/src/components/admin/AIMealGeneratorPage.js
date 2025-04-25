import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import LinkBehavior from '../routing/LinkBehavior';
import AIMealGenerator from './AIMealGenerator';

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
  EmojiObjects
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

const AIMealGeneratorPage = () => {
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
        <Typography color="textPrimary">AI Meal Generator</Typography>
      </Breadcrumbs>

      {/* Page Title */}
      <Box display="flex" alignItems="center" className={classes.title}>
        <EmojiObjects className={classes.headerIcon} color="primary" />
        <Typography variant="h4" component="h1">
          AI Meal Generator
        </Typography>
      </Box>

      {/* Description */}
      <Paper className={classes.paper}>
        <Typography variant="body1" paragraph>
          Use artificial intelligence to generate detailed meal recipes with ingredients and preparation steps.
          The AI can create recipes based on cuisine type, meal type, dietary restrictions, and more.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>How it works:</strong> Select the cuisine type, meal type, and other options below, then click "Generate Meal".
          The AI will create a detailed recipe that you can review, edit if needed, and save to your meal database.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Note: The AI will generate real recipes based on your specifications. You can customize the generated recipes before saving them.
        </Typography>
      </Paper>

      {/* AI Meal Generator Component */}
      <AIMealGenerator />
    </Container>
  );
};

export default AIMealGeneratorPage;