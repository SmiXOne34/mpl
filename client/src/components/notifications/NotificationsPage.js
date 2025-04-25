import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getNotifications, markAsRead, clearAllNotifications } from '../../actions/notificationActions';
import { formatDate } from '../../utils/dateUtils';
import NotificationPreferences from './NotificationPreferences';
import { debounce } from 'lodash';
import { exportToCSV } from '../../utils/exportUtils';

// Material UI
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  makeStyles
} from '@material-ui/core';
import {
  ArrowBack,
  RestaurantMenu,
  Event,
  Info,
  Delete,
  CheckCircle,
  DeleteSweep,
  FiberNew,
  Search,
  FilterList,
  Clear,
  GetApp,
  Settings
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
    marginBottom: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  notificationItem: {
    borderLeft: '4px solid transparent',
    marginBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  unreadNotification: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  notificationTime: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  noNotifications: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
  tabs: {
    marginBottom: theme.spacing(3),
  },
  newIndicator: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
  },
  backButton: {
    marginBottom: theme.spacing(3),
  },
  searchFilterContainer: {
    marginBottom: theme.spacing(3),
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  filterFormControl: {
    minWidth: 120,
    marginRight: theme.spacing(2),
  },
  filterChip: {
    margin: theme.spacing(0.5),
  },
  activeFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
  },
  clearFiltersButton: {
    marginLeft: 'auto',
  },
  notificationList: {
    maxHeight: 'calc(100vh - 400px)',
    overflow: 'auto',
  },
}));

const NotificationsPage = ({
  notification: { notifications, loading, error },
  getNotifications,
  markAsRead,
  clearAllNotifications
}) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);
  
  // Filter notifications based on search term and filters
  useEffect(() => {
    if (!notifications) return;
    
    // Create a debounced filter function
    const debouncedFilter = debounce(() => {
      let filtered = [...notifications];
      
      // Filter by tab (read status)
      if (tabValue === 1) {
        filtered = filtered.filter(notification => !notification.read);
      } else if (tabValue === 2) {
        filtered = filtered.filter(notification => notification.read);
      }
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          notification => 
            notification.title.toLowerCase().includes(term) || 
            notification.message.toLowerCase().includes(term)
        );
      }
      
      // Filter by notification type
      if (typeFilter !== 'all') {
        filtered = filtered.filter(notification => notification.type === typeFilter);
      }
      
      // Filter by date
      if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        filtered = filtered.filter(notification => {
          const notificationDate = new Date(notification.createdAt);
          
          switch (dateFilter) {
            case 'today':
              return notificationDate >= today;
            case 'yesterday':
              return notificationDate >= yesterday && notificationDate < today;
            case 'week':
              return notificationDate >= lastWeek;
            case 'month':
              return notificationDate >= lastMonth;
            default:
              return true;
          }
        });
      }
      
      setFilteredNotifications(filtered);
    }, 300);
    
    debouncedFilter();
    
    // Clean up
    return () => {
      debouncedFilter.cancel();
    };
  }, [notifications, searchTerm, typeFilter, dateFilter, tabValue]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle type filter change
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };
  
  // Handle date filter change
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateFilter('all');
  };
  
  // Get active filters for display
  const getActiveFilters = () => {
    const filters = [];
    
    if (typeFilter !== 'all') {
      let label = '';
      switch (typeFilter) {
        case 'event':
          label = 'Events';
          break;
        case 'meal':
          label = 'Meals';
          break;
        case 'system':
          label = 'System';
          break;
        default:
          label = typeFilter;
      }
      filters.push({ key: 'type', label, value: typeFilter });
    }
    
    if (dateFilter !== 'all') {
      let label = '';
      switch (dateFilter) {
        case 'today':
          label = 'Today';
          break;
        case 'yesterday':
          label = 'Yesterday';
          break;
        case 'week':
          label = 'Last 7 days';
          break;
        case 'month':
          label = 'Last 30 days';
          break;
        default:
          label = dateFilter;
      }
      filters.push({ key: 'date', label, value: dateFilter });
    }
    
    return filters;
  };
  
  // Handle export to CSV
  const handleExportCSV = () => {
    if (!filteredNotifications || filteredNotifications.length === 0) {
      return;
    }
    
    // Define CSV headers
    const headers = [
      { title: 'Title', key: 'title' },
      { title: 'Message', key: 'message' },
      { title: 'Type', key: 'type' },
      { title: 'Date', key: 'createdAt', format: (value) => formatDate(value) },
      { title: 'Read', key: 'read', format: (value) => value ? 'Yes' : 'No' }
    ];
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `notifications_${date}.csv`;
    
    // Export to CSV
    exportToCSV(filteredNotifications, headers, filename);
  };
  
  const handleNotificationClick = (id) => {
    markAsRead(id);
  };
  
  const handleMarkAllAsRead = () => {
    // Mark all notifications as read
    notifications.forEach(notification => {
      if (!notification.read) {
        markAsRead(notification._id);
      }
    });
  };
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const togglePreferences = () => {
    setShowPreferences(!showPreferences);
  };
  
  const handleClearAll = () => {
    clearAllNotifications();
    setOpenDialog(false);
  };
  
  // This is now handled in the useEffect with the search and filter functionality
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'meal':
        return <RestaurantMenu color="primary" />;
      case 'event':
        return <Event color="primary" />;
      default:
        return <Info color="primary" />;
    }
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
        className={classes.backButton}
      >
        Back to Dashboard
      </Button>
      
      <div className={classes.header}>
        <Typography variant="h4" component="h1" className={classes.title}>
          Notifications
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CheckCircle />}
            onClick={handleMarkAllAsRead}
            disabled={!notifications || notifications.filter(n => !n.read).length === 0}
            style={{ marginRight: 8 }}
          >
            Mark All as Read
          </Button>
          <Button
            variant="outlined"
            color="default"
            startIcon={<GetApp />}
            onClick={handleExportCSV}
            disabled={!filteredNotifications || filteredNotifications.length === 0}
            style={{ marginRight: 8 }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Settings />}
            onClick={togglePreferences}
            style={{ marginRight: 8 }}
          >
            Preferences
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DeleteSweep />}
            onClick={handleOpenDialog}
            disabled={!notifications || notifications.length === 0}
          >
            Clear All
          </Button>
        </Box>
      </div>
      
      {error && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          {error}
        </Alert>
      )}
      
      {/* Notification Preferences */}
      {showPreferences && (
        <NotificationPreferences />
      )}
      
      <Paper className={classes.paper}>
        {/* Search and Filter UI */}
        <div className={classes.searchFilterContainer}>
          <TextField
            className={classes.searchField}
            fullWidth
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl variant="outlined" className={classes.filterFormControl} fullWidth>
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="event">Events</MenuItem>
                  <MenuItem value="meal">Meals</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl variant="outlined" className={classes.filterFormControl} fullWidth>
                <InputLabel id="date-filter-label">Date</InputLabel>
                <Select
                  labelId="date-filter-label"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  label="Date"
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4} container alignItems="center">
              {(typeFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
                <Button
                  variant="outlined"
                  color="default"
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                  className={classes.clearFiltersButton}
                >
                  Clear Filters
                </Button>
              )}
            </Grid>
          </Grid>
          
          {/* Active Filters */}
          <div className={classes.activeFilters}>
            {getActiveFilters().map((filter) => (
              <Chip
                key={filter.key}
                label={filter.label}
                onDelete={() => {
                  if (filter.key === 'type') setTypeFilter('all');
                  if (filter.key === 'date') setDateFilter('all');
                }}
                className={classes.filterChip}
                color="primary"
                variant="outlined"
              />
            ))}
            {searchTerm && (
              <Chip
                label={`Search: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                className={classes.filterChip}
                color="primary"
                variant="outlined"
              />
            )}
          </div>
        </div>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          className={classes.tabs}
        >
          <Tab label="All" />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                Unread
                {notifications && notifications.filter(n => !n.read).length > 0 && (
                  <Box 
                    component="span" 
                    bgcolor="secondary.main" 
                    color="secondary.contrastText" 
                    borderRadius="50%" 
                    px={1} 
                    ml={1}
                    fontSize="0.75rem"
                  >
                    {notifications.filter(n => !n.read).length}
                  </Box>
                )}
              </Box>
            } 
          />
          <Tab label="Read" />
        </Tabs>
        
        {filteredNotifications.length > 0 ? (
          <List>
            {filteredNotifications.map((notification) => (
              <Paper 
                key={notification._id} 
                variant="outlined"
                className={`${classes.notificationItem} ${!notification.read ? classes.unreadNotification : ''}`}
              >
                <ListItem
                  button
                  component={RouterLink}
                  to={`/notifications/${notification._id}`}
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        {notification.title}
                        {!notification.read && (
                          <FiberNew className={classes.newIndicator} fontSize="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" display="block" className={classes.notificationTime}>
                          {formatDate(notification.createdAt, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        ) : (
          <div className={classes.noNotifications}>
            <Info color="disabled" style={{ fontSize: 48, marginBottom: 8 }} />
            <Typography variant="body1">
              {tabValue === 0 && "You don't have any notifications"}
              {tabValue === 1 && "You don't have any unread notifications"}
              {tabValue === 2 && "You don't have any read notifications"}
            </Typography>
          </div>
        )}
      </Paper>
      
      {/* Notification Preferences */}
      <NotificationPreferences />
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Clear All Notifications
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to clear all notifications? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClearAll} color="secondary" autoFocus>
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

NotificationsPage.propTypes = {
  notification: PropTypes.object.isRequired,
  getNotifications: PropTypes.func.isRequired,
  markAsRead: PropTypes.func.isRequired,
  clearAllNotifications: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  notification: state.notification,
});

export default connect(mapStateToProps, {
  getNotifications,
  markAsRead,
  clearAllNotifications,
})(NotificationsPage);