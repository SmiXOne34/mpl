import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getSelectionHistory } from '../../actions/selectionActions';
import { formatDate } from '../../utils/dateUtils';

// Material UI
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Divider,
  CircularProgress,
  makeStyles
} from '@material-ui/core';
import {
  ArrowBack,
  RestaurantMenu,
  CalendarToday,
  FilterList
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
  },
  tableContainer: {
    marginTop: theme.spacing(3),
  },
  chip: {
    margin: theme.spacing(0.5),
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
  filterContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  filterChip: {
    margin: theme.spacing(0.5),
  },
  noHistory: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  mealLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const SelectionHistory = ({
  selection: { history, loading },
  getSelectionHistory
}) => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month'
  
  useEffect(() => {
    getSelectionHistory(filter);
  }, [getSelectionHistory, filter]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(0);
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
        Meal Selection History
      </Typography>
      
      <Paper className={classes.paper}>
        <div className={classes.filterContainer}>
          <Typography variant="h6">
            <FilterList style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Filter by Time Period
          </Typography>
          <Box>
            <Chip
              label="All Time"
              color={filter === 'all' ? 'primary' : 'default'}
              onClick={() => handleFilterChange('all')}
              className={classes.filterChip}
            />
            <Chip
              label="This Week"
              color={filter === 'week' ? 'primary' : 'default'}
              onClick={() => handleFilterChange('week')}
              className={classes.filterChip}
            />
            <Chip
              label="This Month"
              color={filter === 'month' ? 'primary' : 'default'}
              onClick={() => handleFilterChange('month')}
              className={classes.filterChip}
            />
          </Box>
        </div>
        
        {history && history.length > 0 ? (
          <>
            <TableContainer className={classes.tableContainer}>
              <Table aria-label="selection history table">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Day</TableCell>
                    <TableCell>Meal</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((selection) => (
                      <TableRow key={selection._id}>
                        <TableCell>
                          {formatDate(selection.createdAt, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </TableCell>
                        <TableCell>
                          {selection.dayName}
                        </TableCell>
                        <TableCell>
                          <RouterLink 
                            to={`/meals/${selection.mealId._id}`}
                            className={classes.mealLink}
                          >
                            {selection.mealId.name}
                          </RouterLink>
                        </TableCell>
                        <TableCell>
                          {selection.mealId.tags &&
                            selection.mealId.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                className={classes.chip}
                              />
                            ))}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="primary"
                            component={RouterLink}
                            to={`/meals/${selection.mealId._id}`}
                          >
                            View Meal
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={history.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <div className={classes.noHistory}>
            <CalendarToday style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              No Selection History Found
            </Typography>
            <Typography variant="body1" paragraph>
              {filter === 'all'
                ? "You haven't made any meal selections yet."
                : `You haven't made any meal selections in this ${
                    filter === 'week' ? 'week' : 'month'
                  }.`}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/meals/select"
              startIcon={<RestaurantMenu />}
            >
              Select Meals
            </Button>
          </div>
        )}
      </Paper>
      
      <Divider className={classes.divider} />
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Selection Statistics
            </Typography>
            
            {history && history.length > 0 ? (
              <Box mt={2}>
                <Typography variant="body1">
                  <strong>Total Selections:</strong> {history.length}
                </Typography>
                
                <Typography variant="body1" style={{ marginTop: 8 }}>
                  <strong>Most Selected Meal:</strong>{' '}
                  {(() => {
                    // Calculate most selected meal
                    const mealCounts = {};
                    history.forEach((selection) => {
                      const mealId = selection.mealId._id;
                      mealCounts[mealId] = (mealCounts[mealId] || 0) + 1;
                    });
                    
                    let mostSelectedMealId = null;
                    let maxCount = 0;
                    
                    Object.keys(mealCounts).forEach((mealId) => {
                      if (mealCounts[mealId] > maxCount) {
                        mostSelectedMealId = mealId;
                        maxCount = mealCounts[mealId];
                      }
                    });
                    
                    const mostSelectedMeal = history.find(
                      (selection) => selection.mealId._id === mostSelectedMealId
                    );
                    
                    return mostSelectedMeal ? (
                      <RouterLink
                        to={`/meals/${mostSelectedMeal.mealId._id}`}
                        className={classes.mealLink}
                      >
                        {mostSelectedMeal.mealId.name} ({maxCount} times)
                      </RouterLink>
                    ) : (
                      'None'
                    );
                  })()}
                </Typography>
                
                <Typography variant="body1" style={{ marginTop: 8 }}>
                  <strong>Most Active Day:</strong>{' '}
                  {(() => {
                    // Calculate most active day
                    const dayCounts = {};
                    history.forEach((selection) => {
                      const day = selection.dayName;
                      dayCounts[day] = (dayCounts[day] || 0) + 1;
                    });
                    
                    let mostActiveDay = null;
                    let maxCount = 0;
                    
                    Object.keys(dayCounts).forEach((day) => {
                      if (dayCounts[day] > maxCount) {
                        mostActiveDay = day;
                        maxCount = dayCounts[day];
                      }
                    });
                    
                    return mostActiveDay ? `${mostActiveDay} (${maxCount} selections)` : 'None';
                  })()}
                </Typography>
              </Box>
            ) : (
              <Alert severity="info">
                No selection data available to generate statistics.
              </Alert>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/meals/select"
              fullWidth
              style={{ marginBottom: 8 }}
              startIcon={<RestaurantMenu />}
            >
              Select Meals
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/meals/select"
              fullWidth
              style={{ marginBottom: 8 }}
            >
              Select Meals
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/meals/statistics"
              fullWidth
              style={{ marginBottom: 8 }}
            >
              View Statistics
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/dashboard"
              fullWidth
            >
              Back to Dashboard
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

SelectionHistory.propTypes = {
  selection: PropTypes.object.isRequired,
  getSelectionHistory: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  selection: state.selection,
});

export default connect(mapStateToProps, {
  getSelectionHistory,
})(SelectionHistory);