import React, { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import LinkBehavior from '../routing/LinkBehavior';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { getWeeklyMenu } from '../../actions/menuActions';
import { getMySelections, getFamilySelections, getPopularMeal } from '../../actions/selectionActions';
import { getVotingStatus } from '../../actions/timeActions';
import { formatTimeRemaining, getDayName } from '../../utils/dateUtils';
import { getSocket } from '../../utils/socket';

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
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  Tooltip,
  makeStyles
} from '@material-ui/core';
import {
  RestaurantMenu,
  AccessTime,
  CheckCircle,
  HowToVote,
  Star,
  CalendarToday,
  BarChart,
  People
} from '@material-ui/icons';
import { Alert, AvatarGroup } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  statusPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  statusIcon: {
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
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
  popularBadge: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  popularIcon: {
    marginRight: theme.spacing(0.5),
    fontSize: '1rem',
  },
  noSelections: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  familyCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    overflow: 'hidden'
  },
  familyCardContent: {
    padding: theme.spacing(3),
  },
  familyMemberImage: {
    marginRight: 12,
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: '3px solid white',
    objectFit: 'cover'
  },
  familyHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
  },
  liveUpdateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    color: 'white',
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 20,
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginLeft: theme.spacing(2)
  },
  topMealsContainer: {
    marginBottom: theme.spacing(4),
  },
  animatedCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    overflow: 'hidden'
  },
  firstPlaceCard: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  secondPlaceCard: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  thirdPlaceCard: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9 aspect ratio
    position: 'relative'
  },
  medalBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    border: '2px solid white',
    backgroundColor: '#f5f5f5'
  },
  voteCount: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: '0.875rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  votersAvatarGroup: {
    marginTop: theme.spacing(1),
  },
  liveIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    color: 'white',
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 20,
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginLeft: theme.spacing(1)
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
}));

const Dashboard = ({
  auth: { user },
  menu: { currentMenu, loading: menuLoading },
  selection: { mySelections, familySelections, popularMeal, loading: selectionLoading },
  time: { votingStatus, loading: timeLoading },
  getWeeklyMenu,
  getMySelections,
  getFamilySelections,
  getPopularMeal,
  getVotingStatus,
  dispatch
}) => {
  const classes = useStyles();
  const [currentDay] = useState(new Date().getDay());
  const [dayName] = useState(getDayName(currentDay));
  const [liveUpdate, setLiveUpdate] = useState(false);
  
  // Group selections by user
  const groupedSelections = useMemo(() => {
    if (!familySelections) return [];
    
    const userMap = new Map();
    
    familySelections.forEach(selection => {
      const userId = selection.userId._id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: selection.userId,
          selections: []
        });
      }
      userMap.get(userId).selections.push(selection);
    });
    
    return Array.from(userMap.values());
  }, [familySelections]);
  
  // Calculate top 3 most popular meals from selections
  const topMeals = useMemo(() => {
    if (!familySelections || !Array.isArray(familySelections) || familySelections.length === 0) return [];
    
    // Count votes for each meal
    const mealVotes = new Map();
    
    familySelections.forEach(selection => {
      // Skip invalid selections
      if (!selection || !selection.mealId || !selection.userId) return;
      
      const mealId = selection.mealId._id;
      if (!mealId) return; // Skip if mealId is missing
      
      if (!mealVotes.has(mealId)) {
        mealVotes.set(mealId, {
          meal: selection.mealId,
          count: 0,
          voters: [],
          position: 0 // Will be set later
        });
      }
      
      const mealData = mealVotes.get(mealId);
      mealData.count += 1;
      
      // Add voter if not already in the list and if userId has _id property
      if (selection.userId._id && 
          !mealData.voters.some(voter => voter && voter._id === selection.userId._id)) {
        mealData.voters.push(selection.userId);
      }
    });
    
    // Convert to array and sort by vote count (descending)
    const sortedMeals = Array.from(mealVotes.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Get top 3
    
    // Assign positions (1st, 2nd, 3rd)
    sortedMeals.forEach((meal, index) => {
      meal.position = index + 1;
    });
    
    return sortedMeals;
  }, [familySelections]);

  useEffect(() => {
    getWeeklyMenu();
    getMySelections(currentDay);
    getFamilySelections(currentDay);
    getPopularMeal(currentDay);
    getVotingStatus();

    // Set up socket listeners
    const socket = getSocket();
    if (socket) {
      socket.on('selection:created', () => {
        setLiveUpdate(true);
        getMySelections(currentDay);
        getFamilySelections(currentDay);
        getPopularMeal(currentDay).then(() => {
          // Show the live update indicator for 3 seconds
          setTimeout(() => setLiveUpdate(false), 3000);
        });
      });

      socket.on('selection:deleted', () => {
        setLiveUpdate(true);
        getMySelections(currentDay);
        getFamilySelections(currentDay);
        getPopularMeal(currentDay).then(() => {
          // Show the live update indicator for 3 seconds
          setTimeout(() => setLiveUpdate(false), 3000);
        });
      });

      socket.on('meal:popular', (data) => {
        if (data.day === currentDay) {
          setLiveUpdate(true);
          getPopularMeal(currentDay).then(() => {
            // Show the live update indicator for 3 seconds
            setTimeout(() => setLiveUpdate(false), 3000);
          });
        }
      });

      socket.on('voting:status', (status) => {
        // Update voting status when received from server
        // This is handled by the reducer
      });

      // Clean up listeners on unmount
      return () => {
        socket.off('selection:created');
        socket.off('selection:deleted');
        socket.off('meal:popular');
        socket.off('voting:status');
      };
    }
  }, [
    getWeeklyMenu,
    getMySelections,
    getFamilySelections,
    getPopularMeal,
    getVotingStatus,
    currentDay
  ]);
  
  // No notification-related useEffect needed

  const isLoading = menuLoading || selectionLoading || timeLoading;

  if (isLoading) {
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
      {/* Welcome Message */}
      <Paper 
        elevation={2} 
        style={{ 
          background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
          padding: '16px',
          borderRadius: '10px',
          marginBottom: '20px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <RestaurantMenu 
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            fontSize: '80px', 
            opacity: 0.15,
            transform: 'rotate(15deg)',
            zIndex: 1
          }} 
        />
        <RestaurantMenu 
          style={{ 
            position: 'absolute', 
            bottom: '-15px', 
            left: '15%', 
            fontSize: '60px', 
            opacity: 0.1,
            transform: 'rotate(-10deg)',
            zIndex: 1
          }} 
        />
        
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Avatar 
              src={user && user.imageUrl ? user.imageUrl : ''}
              style={{ 
                width: '36px', 
                height: '36px', 
                backgroundColor: 'white',
                color: '#4caf50',
                boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
              }}
            >
              {user && user.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h6" component="h1" style={{ fontWeight: 'bold', zIndex: 2, position: 'relative' }}>
              Welcome back, {user && user.name ? user.name.split(' ')[0] : 'Friend'}!
            </Typography>
            <Typography variant="caption" style={{ marginTop: '4px', opacity: 0.9, zIndex: 2, position: 'relative', display: 'block' }}>
              Here's what's happening with your meal planning today.
            </Typography>
          </Grid>
          <Grid item>
            <Box display="flex" alignItems="center">
              <CalendarToday style={{ marginRight: '4px', fontSize: '0.9rem' }} />
              <Typography variant="body2">{dayName}</Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Quick stats */}
        <Box mt={2} display="flex" flexWrap="wrap">
          <Box 
            mr={2} 
            mt={1} 
            style={{ 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RestaurantMenu style={{ marginRight: '4px', fontSize: '0.9rem', color: '#e65100' }} />
            <Typography variant="body2" style={{ color: '#e65100', fontWeight: 500 }}>
              {mySelections && mySelections.length > 0 
                ? `${mySelections.length} meal${mySelections.length > 1 ? 's' : ''} selected` 
                : 'No meals selected'}
            </Typography>
          </Box>
          
          <Box 
            mr={2} 
            mt={1} 
            style={{ 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <HowToVote style={{ marginRight: '4px', fontSize: '0.9rem', color: '#e65100' }} />
            <Typography variant="body2" style={{ color: '#e65100', fontWeight: 500 }}>
              {votingStatus && votingStatus.isOpen 
                ? `Voting open for ${formatTimeRemaining(votingStatus.hoursRemaining, votingStatus.minutesRemaining)}` 
                : 'Voting closed'}
            </Typography>
          </Box>
        </Box>
        
        {/* Action Buttons */}
        <Box mt={2} display="flex" justifyContent="flex-end" zIndex={2} position="relative">
          {/* Vote button - changes based on voting status */}
          <Button
            variant="contained"
            color="secondary"
            component={votingStatus && votingStatus.isOpen ? LinkBehavior : 'button'}
            to={votingStatus && votingStatus.isOpen ? "/meals/select" : undefined}
            size="small"
            disabled={!votingStatus}
            style={{ 
              marginRight: '10px',
              borderRadius: '20px',
              backgroundColor: votingStatus && votingStatus.isOpen ? '#ffffff' : '#e63946',
              color: votingStatus && votingStatus.isOpen ? '#4caf50' : '#ffffff',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '6px 16px'
            }}
            startIcon={<HowToVote style={{ 
              color: votingStatus && votingStatus.isOpen ? '#4caf50' : '#ffffff' 
            }} />}
          >
            {votingStatus && votingStatus.isOpen ? 'Vote Now' : 'Vote Closed'}
          </Button>
          
          {/* Profile button - always visible */}
          <Button
            variant="outlined"
            component={LinkBehavior}
            to="/profile"
            size="small"
            style={{ 
              borderRadius: '20px',
              borderColor: '#ffffff',
              color: '#ffffff',
              fontWeight: 'bold',
              padding: '6px 16px'
            }}
            startIcon={<Avatar 
              src={user && user.imageUrl ? user.imageUrl : ''}
              style={{ width: '20px', height: '20px' }}
            >
              {user && user.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </Avatar>}
          >
            My Profile
          </Button>
        </Box>
      </Paper>

      {/* Main Action Button */}
      {votingStatus && (
        <Box mb={4} textAlign="center">
          <Button
            variant="contained"
            color={votingStatus.isOpen ? "primary" : "default"}
            component={LinkBehavior}
            to="/meals/select"
            size="large"
            style={{ 
              padding: '12px 24px', 
              borderRadius: '30px',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              minWidth: '200px'
            }}
            startIcon={votingStatus.isOpen ? <HowToVote style={{ fontSize: '1.5rem' }} /> : <RestaurantMenu style={{ fontSize: '1.5rem' }} />}
          >
            {votingStatus.isOpen ? 'Vote for Meals Now' : 'View Weekly Menu'}
          </Button>
        </Box>
      )}

      {/* My Selections */}
      <Box display="flex" alignItems="center" mb={2}>
        <CheckCircle style={{ color: '#4caf50', marginRight: '8px' }} />
        <Typography variant="h5" style={{ fontWeight: 500 }}>
          My Selections for {dayName}
        </Typography>
      </Box>
      {mySelections && mySelections.length > 0 ? (
        <Grid container spacing={4}>
          {mySelections.map((selection) => (
            <Grid item key={selection._id} xs={12} sm={6} md={4}>
              <Card className={classes.card}>
                <CardMedia
                  className={classes.cardMedia}
                  image={selection.mealId.imageUrl || 'https://source.unsplash.com/random'}
                  title={selection.mealId.name}
                />
                <CardContent className={classes.cardContent}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {selection.mealId.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    {selection.mealId.description}
                  </Typography>
                  <Box mt={2}>
                    {selection.mealId.tags &&
                      selection.mealId.tags.map((tag) => (
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
                    to={`/meals/${selection.mealId._id}`}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper className={classes.noSelections}>
          <Typography variant="body1" paragraph>
            You haven't made any selections for {dayName} yet.
          </Typography>
          {votingStatus && votingStatus.isOpen && (
            <Button
              variant="contained"
              color="primary"
              component={LinkBehavior}
              to="/meals/select"
              startIcon={<HowToVote />}
            >
              Select Meals
            </Button>
          )}
        </Paper>
      )}

      <Divider className={classes.divider} />

      {/* Popular Meals Podium */}
      <Box 
        display="flex" 
        alignItems="center" 
        mb={4} 
        pb={2}
        borderBottom="2px solid #e0e0e0"
      >
        <BarChart style={{ 
          color: '#ff9800', 
          marginRight: '12px',
          fontSize: '2rem'
        }} />
        <Box flexGrow={1}>
          <Box display="flex" alignItems="center">
            <Typography variant="h5" style={{ fontWeight: 600 }}>
              Top Meals for {dayName}
            </Typography>
            {/* Removed live update badge */}
          </Box>
          <Typography variant="body2" color="textSecondary">
            See which meals are most popular with your family members
          </Typography>
        </Box>
      </Box>
      
      {topMeals && topMeals.length > 0 ? (
        <>
          {/* Animated Cards View */}
          <Grid container spacing={3} className={classes.topMealsContainer}>
            {topMeals.map((mealData) => {
              // Determine card style based on position
              let cardClassName, medalColor, medalText;
              
              switch(mealData.position) {
                case 1:
                  cardClassName = classes.firstPlaceCard;
                  medalColor = '#FFD700'; // Gold
                  medalText = '1st';
                  break;
                case 2:
                  cardClassName = classes.secondPlaceCard;
                  medalColor = '#C0C0C0'; // Silver
                  medalText = '2nd';
                  break;
                case 3:
                  cardClassName = classes.thirdPlaceCard;
                  medalColor = '#CD7F32'; // Bronze
                  medalText = '3rd';
                  break;
                default:
                  cardClassName = '';
                  medalColor = '#9e9e9e'; // Grey
                  medalText = `${mealData.position}th`;
              }
              
              return (
                <Grid item xs={12} sm={6} md={4} key={mealData.meal && mealData.meal._id ? mealData.meal._id : `meal-${mealData.position}`}>
                  <Card className={`${classes.animatedCard} ${cardClassName}`}>
                    <Box position="relative">
                      <CardMedia
                        className={classes.cardMedia}
                        image={mealData.meal && mealData.meal.imageUrl ? mealData.meal.imageUrl : 'https://source.unsplash.com/random?food'}
                        title={mealData.meal && mealData.meal.name ? mealData.meal.name : 'Meal'}
                      />
                      
                      {/* Simple Medal Badge */}
                      <Box 
                        className={classes.medalBadge}
                        style={{ 
                          backgroundColor: medalColor
                        }}
                      >
                        <Typography variant="body2" style={{ fontWeight: 'bold', color: 'white' }}>
                          {medalText}
                        </Typography>
                      </Box>
                      
                      {/* Simple Vote Count */}
                      <Box className={classes.voteCount}>
                        <Typography variant="body2">
                          {mealData.count} {mealData.count === 1 ? 'vote' : 'votes'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="h6" style={{ fontWeight: 600 }} noWrap>
                          {mealData.meal && mealData.meal.name ? mealData.meal.name : 'Unnamed Meal'}
                        </Typography>
                        
                        {/* Removed live update indicator */}
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        style={{ 
                          height: 40, 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {mealData.meal && mealData.meal.description ? mealData.meal.description : 'No description available'}
                      </Typography>
                      
                      {/* Tags */}
                      <Box mt={2} mb={1}>
                        {mealData.meal && mealData.meal.tags && Array.isArray(mealData.meal.tags) && mealData.meal.tags.length > 0 ? (
                          mealData.meal.tags.slice(0, 3).map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag || 'Tag'}
                              size="small"
                              style={{ 
                                margin: '0 4px 4px 0',
                                backgroundColor: mealData.position === 1 
                                  ? '#fff3e0' 
                                  : mealData.position === 2 
                                    ? '#f5f5f5' 
                                    : '#efebe9',
                                color: mealData.position === 1 
                                  ? '#ff9800' 
                                  : mealData.position === 2 
                                    ? '#757575' 
                                    : '#795548'
                              }}
                            />
                          ))
                        ) : (
                          <Chip
                            label="No tags"
                            size="small"
                            style={{ 
                              margin: '0 4px 4px 0',
                              backgroundColor: '#f5f5f5',
                              color: '#757575'
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* Voters */}
                      <Box mt={2}>
                        <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginBottom: 4 }}>
                          Voted by:
                        </Typography>
                        <AvatarGroup max={5} className={classes.votersAvatarGroup}>
                          {mealData.voters && Array.isArray(mealData.voters) && mealData.voters.length > 0 ? (
                            mealData.voters.map((voter, index) => (
                              <Tooltip key={voter && voter._id ? voter._id : index} title={voter && voter.name ? voter.name : 'User'}>
                                <Avatar 
                                  alt={voter && voter.name ? voter.name : 'User'} 
                                  src={voter && voter.imageUrl ? voter.imageUrl : ''}
                                  style={{ 
                                    width: 32, 
                                    height: 32,
                                    border: `2px solid ${medalColor}`,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  {voter && voter.name ? voter.name.charAt(0).toUpperCase() : 'U'}
                                </Avatar>
                              </Tooltip>
                            ))
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No voters yet
                            </Typography>
                          )}
                        </AvatarGroup>
                      </Box>
                    </CardContent>
                    
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        component={LinkBehavior}
                        to={mealData.meal && mealData.meal._id ? `/meals/${mealData.meal._id}` : '/meals'}
                        variant="outlined"
                        style={{ 
                          marginLeft: 'auto',
                          marginRight: 'auto'
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        <Paper className={classes.noSelections} style={{ backgroundColor: '#fff9c4', padding: '24px' }}>
          <Box display="flex" alignItems="center" flexDirection="column">
            <Star style={{ color: '#ff9800', fontSize: '3rem', marginBottom: '16px', opacity: 0.6 }} />
            <Typography variant="h6" gutterBottom>
              No Popular Meal Yet
            </Typography>
            <Typography variant="body1" align="center">
              No votes have been cast for {dayName} yet. Once family members start voting, the most popular meal will appear here.
            </Typography>
            {votingStatus && votingStatus.isOpen && (
              <Button
                variant="contained"
                color="primary"
                component={LinkBehavior}
                to="/meals/select"
                style={{ marginTop: '16px' }}
                startIcon={<HowToVote />}
              >
                Cast Your Vote
              </Button>
            )}
          </Box>
        </Paper>
      )}

      <Divider className={classes.divider} />

      {/* Family Selections */}
      <Box 
        display="flex" 
        alignItems="center" 
        mb={4} 
        pb={2}
        borderBottom="2px solid #e0e0e0"
      >
        <People style={{ 
          color: '#4caf50', 
          marginRight: '12px',
          fontSize: '2rem'
        }} />
        <Box>
          <Typography variant="h5" style={{ fontWeight: 600 }}>
            Family Selections for {dayName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            See what everyone in your family has chosen to eat today
          </Typography>
        </Box>
      </Box>
      {groupedSelections && groupedSelections.length > 0 ? (
        <Grid container spacing={4}>
          {groupedSelections.map((userGroup) => (
            <Grid item key={userGroup.user._id} xs={12} sm={6} md={4}>
              <Card className={classes.familyCard}>
                <Box className={classes.familyHeader}>
                  {userGroup.user.imageUrl ? (
                    <Box
                      component="img"
                      src={userGroup.user.imageUrl}
                      alt={userGroup.user.name}
                      className={classes.familyMemberImage}
                    />
                  ) : (
                    <Avatar 
                      alt={userGroup.user.name}
                      className={classes.familyMemberImage}
                    >
                      {userGroup.user.name ? userGroup.user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="h6" style={{ fontWeight: 500 }}>
                      {userGroup.user.name ? userGroup.user.name.split(' ')[0] : 'User'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userGroup.selections.length > 1 
                        ? `${userGroup.selections.length} meals selected` 
                        : '1 meal selected'}
                    </Typography>
                  </Box>
                </Box>
                <CardContent className={classes.familyCardContent}>
                  {userGroup.selections.map((selection, index) => (
                    <Box key={selection._id} mb={index < userGroup.selections.length - 1 ? 3 : 0}>
                      <Box display="flex" alignItems="flex-start" mb={1}>
                        <RestaurantMenu color="primary" style={{ marginRight: 8, marginTop: 4 }} />
                        <Typography variant="body1" color="primary" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {selection.mealId.name}
                        </Typography>
                      </Box>
                      
                      {selection.mealId.description && (
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 12 }}>
                          {selection.mealId.description.length > 60 
                            ? `${selection.mealId.description.substring(0, 60)}...` 
                            : selection.mealId.description}
                        </Typography>
                      )}
                      
                      <Box mt={1}>
                        {selection.mealId.tags &&
                          selection.mealId.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              className={classes.chip}
                              style={{ 
                                backgroundColor: '#f0f7ff', 
                                color: '#3f51b5',
                                fontWeight: 500,
                                margin: '0 4px 4px 0'
                              }}
                            />
                          ))}
                      </Box>
                      
                      {index < userGroup.selections.length - 1 && (
                        <Divider style={{ margin: '16px 0 8px 0' }} />
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper className={classes.noSelections}>
          <Typography variant="body1">
            No family members have made selections for {dayName} yet.
          </Typography>
        </Paper>
      )}

      <Divider className={classes.divider} />

      {/* Quick Links */}
      <Grid container spacing={4}>
        
        {/* Quick Links */}
        <Grid item xs={12} md={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <BarChart style={{ color: '#4caf50', marginRight: '8px' }} />
            <Typography variant="h5" style={{ fontWeight: 500 }}>
              Quick Links
            </Typography>
          </Box>
          <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Meal Selection
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={LinkBehavior}
              to="/meals/select"
              fullWidth
              startIcon={<HowToVote />}
              disabled={!votingStatus?.isOpen}
              style={{ marginBottom: 8 }}
            >
              {votingStatus?.isOpen ? 'Vote for Meals' : 'Voting Closed'}
            </Button>
            <Typography variant="body2" color="textSecondary">
              {votingStatus?.isOpen 
                ? 'Voting is currently open. Cast your votes now!' 
                : 'Voting is currently closed. Check back later.'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Weekly Menu
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={LinkBehavior}
              to="/meals/select"
              fullWidth
              startIcon={<RestaurantMenu />}
              style={{ marginBottom: 8 }}
            >
              Select Meals
            </Button>
            <Typography variant="body2" color="textSecondary">
              Choose your meals for the current week
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Selection History
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={LinkBehavior}
              to="/meals/history"
              fullWidth
              startIcon={<CalendarToday />}
              style={{ marginBottom: 8 }}
            >
              View History
            </Button>
            <Button
              variant="outlined"
              color="primary"
              component={LinkBehavior}
              to="/meals/statistics"
              fullWidth
              startIcon={<BarChart />}
              style={{ marginBottom: 8 }}
            >
              View Statistics
            </Button>
            <Typography variant="body2" color="textSecondary">
              Browse your past meal selections and statistics
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Profile
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={LinkBehavior}
              to="/profile"
              fullWidth
              style={{ marginBottom: 8 }}
            >
              Manage Profile
            </Button>
            <Typography variant="body2" color="textSecondary">
              Update your account settings and preferences
            </Typography>
          </Paper>
        </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

Dashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  menu: PropTypes.object.isRequired,
  selection: PropTypes.object.isRequired,
  time: PropTypes.object.isRequired,
  getWeeklyMenu: PropTypes.func.isRequired,
  getMySelections: PropTypes.func.isRequired,
  getFamilySelections: PropTypes.func.isRequired,
  getPopularMeal: PropTypes.func.isRequired,
  getVotingStatus: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  menu: state.menu,
  selection: state.selection,
  time: state.time,
});

const ConnectedDashboard = connect(
  mapStateToProps,
  {
    getWeeklyMenu,
    getMySelections,
    getFamilySelections,
    getPopularMeal,
    getVotingStatus,
  }
)(Dashboard);

// Wrap the connected component to get access to dispatch
export default function DashboardWithDispatch(props) {
  const dispatch = useDispatch();
  return <ConnectedDashboard {...props} dispatch={dispatch} />;
}