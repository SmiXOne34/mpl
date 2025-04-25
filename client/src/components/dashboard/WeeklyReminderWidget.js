import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getWeeklyMenu } from '../../actions/menuActions';
import { getMySelections } from '../../actions/selectionActions';
import { getDayName, formatDate } from '../../utils/dateUtils';

// Material UI
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  Divider,
  Chip,
  makeStyles
} from '@material-ui/core';
import {
  RestaurantMenu,
  CalendarToday,
  CheckCircle,
  Warning,
  Info
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  titleIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  reminderList: {
    maxHeight: 300,
    overflow: 'auto',
    flexGrow: 1,
  },
  reminderItem: {
    marginBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  footer: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
  },
  noReminders: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  chip: {
    marginLeft: theme.spacing(1),
  },
  selectedChip: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  pendingChip: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
}));

const WeeklyReminderWidget = ({
  menu: { currentMenu, loading: menuLoading },
  selection: { mySelections, loading: selectionLoading },
  getWeeklyMenu,
  getMySelections
}) => {
  const classes = useStyles();
  const [upcomingDays, setUpcomingDays] = useState([]);
  
  useEffect(() => {
    getWeeklyMenu();
    
    // Get the next 3 days
    const today = new Date().getDay();
    const nextDays = [];
    for (let i = 0; i < 3; i++) {
      const nextDay = (today + i) % 7;
      nextDays.push(nextDay);
      getMySelections(nextDay);
    }
    setUpcomingDays(nextDays);
  }, [getWeeklyMenu, getMySelections]);
  
  const isLoading = menuLoading || selectionLoading;
  
  // Check if user has made selections for a day
  const hasSelectionForDay = (day) => {
    return mySelections && mySelections.some(selection => selection.day === day);
  };
  
  // Get day status chip
  const getDayStatusChip = (day) => {
    if (hasSelectionForDay(day)) {
      return (
        <Chip
          size="small"
          label="Selected"
          icon={<CheckCircle />}
          className={`${classes.chip} ${classes.selectedChip}`}
        />
      );
    } else {
      return (
        <Chip
          size="small"
          label="Pending"
          icon={<Warning />}
          className={`${classes.chip} ${classes.pendingChip}`}
        />
      );
    }
  };
  
  return (
    <Paper className={classes.paper}>
      <div className={classes.title}>
        <CalendarToday className={classes.titleIcon} />
        <Typography variant="h6">
          Upcoming Meals
        </Typography>
      </div>
      
      {isLoading ? (
        <div className={classes.noReminders}>
          <Typography variant="body1">
            Loading upcoming meals...
          </Typography>
        </div>
      ) : (
        <>
          {currentMenu ? (
            <>
              <List className={classes.reminderList}>
                {upcomingDays.map((day) => (
                  <Paper 
                    key={day} 
                    variant="outlined"
                    className={classes.reminderItem}
                  >
                    <ListItem
                      button
                      component={RouterLink}
                      to="/meals/select"
                    >
                      <ListItemIcon>
                        <RestaurantMenu color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            {getDayName(day)}
                            {getDayStatusChip(day)}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" component="span">
                            {hasSelectionForDay(day) 
                              ? "You've selected your meal for this day"
                              : "You haven't selected a meal for this day yet"}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
              
              <Divider />
              
              <div className={classes.footer}>
                <Button
                  color="primary"
                  component={RouterLink}
                  to="/meals/select"
                >
                  Select Meals
                </Button>
              </div>
            </>
          ) : (
            <div className={classes.noReminders}>
              <Info color="disabled" style={{ fontSize: 40, marginBottom: 8 }} />
              <Typography variant="body1">
                No upcoming meals to display
              </Typography>
            </div>
          )}
        </>
      )}
    </Paper>
  );
};

WeeklyReminderWidget.propTypes = {
  menu: PropTypes.object.isRequired,
  selection: PropTypes.object.isRequired,
  getWeeklyMenu: PropTypes.func.isRequired,
  getMySelections: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  menu: state.menu,
  selection: state.selection,
});

export default connect(mapStateToProps, {
  getWeeklyMenu,
  getMySelections,
})(WeeklyReminderWidget);