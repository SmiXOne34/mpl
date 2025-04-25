import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getSelectionHistory } from '../../actions/selectionActions';
import { formatDate } from '../../utils/dateUtils';
import { exportToCSV } from '../../utils/exportUtils';

// Material UI
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  makeStyles
} from '@material-ui/core';
import {
  ArrowBack,
  BarChart,
  Favorite,
  TrendingUp,
  GetApp,
  CalendarToday,
  RestaurantMenu,
  LocalDining
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  statCard: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  statIcon: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
    fontSize: 40,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
  tabContent: {
    padding: theme.spacing(3),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  exportButton: {
    marginTop: theme.spacing(2),
  },
  mealLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  barContainer: {
    height: 20,
    backgroundColor: theme.palette.grey[200],
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: theme.palette.primary.main,
  },
}));

const MealStatistics = ({
  selection: { history, loading },
  getSelectionHistory
}) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [timeframe, setTimeframe] = useState('all');
  const [stats, setStats] = useState({
    totalSelections: 0,
    uniqueMeals: 0,
    topMeals: [],
    topTags: [],
    selectionsByDay: [],
  });
  
  useEffect(() => {
    getSelectionHistory(timeframe);
  }, [getSelectionHistory, timeframe]);
  
  useEffect(() => {
    if (history && history.length > 0) {
      calculateStats();
    }
  }, [history]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };
  
  const calculateStats = () => {
    // Total selections
    const totalSelections = history.length;
    
    // Unique meals
    const uniqueMealIds = new Set(history.map(selection => selection.mealId._id));
    const uniqueMeals = uniqueMealIds.size;
    
    // Top meals
    const mealCounts = {};
    history.forEach(selection => {
      const mealId = selection.mealId._id;
      mealCounts[mealId] = (mealCounts[mealId] || 0) + 1;
    });
    
    const topMeals = Object.keys(mealCounts)
      .map(mealId => {
        const selection = history.find(s => s.mealId._id === mealId);
        return {
          mealId,
          name: selection.mealId.name,
          count: mealCounts[mealId],
          percentage: (mealCounts[mealId] / totalSelections) * 100
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Top tags
    const tagCounts = {};
    history.forEach(selection => {
      if (selection.mealId.tags) {
        selection.mealId.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    const topTags = Object.keys(tagCounts)
      .map(tag => ({
        name: tag,
        count: tagCounts[tag],
        percentage: (tagCounts[tag] / totalSelections) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Selections by day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = {};
    
    dayNames.forEach(day => {
      dayCounts[day] = 0;
    });
    
    history.forEach(selection => {
      dayCounts[selection.dayName] = (dayCounts[selection.dayName] || 0) + 1;
    });
    
    const selectionsByDay = dayNames.map(day => ({
      name: day,
      count: dayCounts[day],
      percentage: (dayCounts[day] / totalSelections) * 100
    }));
    
    setStats({
      totalSelections,
      uniqueMeals,
      topMeals,
      topTags,
      selectionsByDay,
    });
  };
  
  const exportStatistics = () => {
    // Prepare data for export
    const data = history.map(selection => ({
      date: new Date(selection.createdAt).toLocaleDateString(),
      day: selection.dayName,
      meal: selection.mealId.name,
      tags: selection.mealId.tags ? selection.mealId.tags.join(', ') : '',
    }));
    
    // Define headers
    const headers = [
      { title: 'Date', key: 'date' },
      { title: 'Day', key: 'day' },
      { title: 'Meal', key: 'meal' },
      { title: 'Tags', key: 'tags' },
    ];
    
    // Export to CSV
    exportToCSV(data, headers, 'meal-selection-history.csv');
  };
  
  if (loading) {
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
      <Button
        variant="outlined"
        color="primary"
        component={RouterLink}
        to="/dashboard"
        startIcon={<ArrowBack />}
        style={{ marginBottom: 16 }}
      >
        Back to Dashboard
      </Button>
      
      <Typography variant="h4" component="h1" className={classes.title}>
        Meal Statistics and Analytics
      </Typography>
      
      <Paper>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Overview" icon={<BarChart />} />
          <Tab label="Meal Preferences" icon={<Favorite />} />
          <Tab label="Trends" icon={<TrendingUp />} />
        </Tabs>
        
        <Box className={classes.tabContent}>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Time Period:
            </Typography>
            <Box>
              <Chip
                label="All Time"
                color={timeframe === 'all' ? 'primary' : 'default'}
                onClick={() => handleTimeframeChange('all')}
                className={classes.chip}
              />
              <Chip
                label="This Week"
                color={timeframe === 'week' ? 'primary' : 'default'}
                onClick={() => handleTimeframeChange('week')}
                className={classes.chip}
              />
              <Chip
                label="This Month"
                color={timeframe === 'month' ? 'primary' : 'default'}
                onClick={() => handleTimeframeChange('month')}
                className={classes.chip}
              />
            </Box>
          </Box>
          
          {history && history.length > 0 ? (
            <>
              {tabValue === 0 && (
                // Overview Tab
                <div>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper className={classes.statCard} elevation={2}>
                        <RestaurantMenu className={classes.statIcon} />
                        <div>
                          <Typography variant="body1" color="textSecondary">
                            Total Selections
                          </Typography>
                          <Typography className={classes.statValue}>
                            {stats.totalSelections}
                          </Typography>
                        </div>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper className={classes.statCard} elevation={2}>
                        <LocalDining className={classes.statIcon} />
                        <div>
                          <Typography variant="body1" color="textSecondary">
                            Unique Meals Selected
                          </Typography>
                          <Typography className={classes.statValue}>
                            {stats.uniqueMeals}
                          </Typography>
                        </div>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper className={classes.statCard} elevation={2}>
                        <CalendarToday className={classes.statIcon} />
                        <div>
                          <Typography variant="body1" color="textSecondary">
                            Most Active Day
                          </Typography>
                          <Typography className={classes.statValue}>
                            {stats.selectionsByDay.length > 0
                              ? stats.selectionsByDay.sort((a, b) => b.count - a.count)[0].name
                              : 'N/A'}
                          </Typography>
                        </div>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Divider className={classes.divider} />
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Top 5 Selected Meals
                      </Typography>
                      {stats.topMeals.map((meal, index) => (
                        <div key={meal.mealId}>
                          <Typography variant="body1">
                            {index + 1}. {meal.name} ({meal.count} selections)
                          </Typography>
                          <div className={classes.barContainer}>
                            <div 
                              className={classes.bar} 
                              style={{ width: `${meal.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Selections by Day
                      </Typography>
                      {stats.selectionsByDay.map((day) => (
                        <div key={day.name}>
                          <Typography variant="body1">
                            {day.name} ({day.count} selections)
                          </Typography>
                          <div className={classes.barContainer}>
                            <div 
                              className={classes.bar} 
                              style={{ width: `${day.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<GetApp />}
                    onClick={exportStatistics}
                    className={classes.exportButton}
                  >
                    Export Selection History
                  </Button>
                </div>
              )}
              
              {tabValue === 1 && (
                // Meal Preferences Tab
                <div>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Top Meal Tags
                      </Typography>
                      {stats.topTags.map((tag, index) => (
                        <div key={tag.name}>
                          <Typography variant="body1">
                            {index + 1}. {tag.name} ({tag.count} occurrences)
                          </Typography>
                          <div className={classes.barContainer}>
                            <div 
                              className={classes.bar} 
                              style={{ width: `${tag.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Box mt={4}>
                        <Typography variant="h6" gutterBottom>
                          Tag Distribution
                        </Typography>
                        <TableContainer className={classes.tableContainer}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Tag</TableCell>
                                <TableCell align="right">Count</TableCell>
                                <TableCell align="right">Percentage</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {stats.topTags.map((tag) => (
                                <TableRow key={tag.name}>
                                  <TableCell>
                                    <Chip 
                                      label={tag.name} 
                                      size="small" 
                                      className={classes.chip}
                                    />
                                  </TableCell>
                                  <TableCell align="right">{tag.count}</TableCell>
                                  <TableCell align="right">
                                    {tag.percentage.toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Detailed Meal Preferences
                      </Typography>
                      <TableContainer className={classes.tableContainer}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Meal</TableCell>
                              <TableCell align="right">Selections</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats.topMeals.map((meal) => (
                              <TableRow key={meal.mealId}>
                                <TableCell>
                                  <RouterLink 
                                    to={`/meals/${meal.mealId}`}
                                    className={classes.mealLink}
                                  >
                                    {meal.name}
                                  </RouterLink>
                                </TableCell>
                                <TableCell align="right">{meal.count}</TableCell>
                                <TableCell align="right">
                                  {meal.percentage.toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </div>
              )}
              
              {tabValue === 2 && (
                // Trends Tab
                <div>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Selection Trends by Day
                      </Typography>
                      <TableContainer className={classes.tableContainer}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Day</TableCell>
                              <TableCell align="right">Selections</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats.selectionsByDay.map((day) => (
                              <TableRow key={day.name}>
                                <TableCell>{day.name}</TableCell>
                                <TableCell align="right">{day.count}</TableCell>
                                <TableCell align="right">
                                  {day.percentage.toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Recent Selection History
                      </Typography>
                      <TableContainer className={classes.tableContainer}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Day</TableCell>
                              <TableCell>Meal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {history.slice(0, 10).map((selection) => (
                              <TableRow key={selection._id}>
                                <TableCell>
                                  {formatDate(selection.createdAt, { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </TableCell>
                                <TableCell>{selection.dayName}</TableCell>
                                <TableCell>
                                  <RouterLink 
                                    to={`/meals/${selection.mealId._id}`}
                                    className={classes.mealLink}
                                  >
                                    {selection.mealId.name}
                                  </RouterLink>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </div>
              )}
            </>
          ) : (
            <Alert severity="info">
              No selection data available to generate statistics.
              {timeframe !== 'all' && (
                <Box mt={1}>
                  Try selecting a different time period or make some meal selections first.
                </Box>
              )}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

MealStatistics.propTypes = {
  selection: PropTypes.object.isRequired,
  getSelectionHistory: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  selection: state.selection,
});

export default connect(mapStateToProps, {
  getSelectionHistory,
})(MealStatistics);