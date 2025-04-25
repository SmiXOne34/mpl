import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/authActions';
import LinkBehavior from '../routing/LinkBehavior';

// Material UI
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Hidden,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  makeStyles
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  RestaurantMenu,
  ExitToApp,
  Info,
  Home,
  SupervisorAccount,
  CalendarToday,
  ViewWeek,
  CameraAlt
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    fontWeight: 700,
    color: '#fff',
    textDecoration: 'none',
  },
  navLink: {
    color: '#fff',
    marginLeft: theme.spacing(2),
  },
  drawer: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: theme.spacing(1),
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    border: '2px solid white',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  userName: {
    marginRight: theme.spacing(1),
    color: 'white',
  },
}));

const Navbar = ({ auth: { isAuthenticated, user }, logout }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const onLogout = () => {
    handleClose();
    logout();
  };

  const authLinks = (
    <>
      <Hidden smDown>
        <Button
          color="inherit"
          component={LinkBehavior}
          to="/dashboard"
          className={classes.navLink}
        >
          Dashboard
        </Button>
        <Button
          color="inherit"
          component={LinkBehavior}
          to="/meals/select"
          className={classes.navLink}
        >
          Select Meals
        </Button>
        <Button
          color="inherit"
          component={LinkBehavior}
          to="/meals/weekly"
          className={classes.navLink}
        >
          Weekly Menu
        </Button>
        <Button
          color="inherit"
          component={LinkBehavior}
          to="/meals/history"
          className={classes.navLink}
        >
          History
        </Button>
        {user && user.role === 'admin' && (
          <Button
            color="inherit"
            component={LinkBehavior}
            to="/admin"
            className={classes.navLink}
          >
            Admin
          </Button>
        )}

        <Box className={classes.userInfo}>
          <Hidden xsDown>
            <Typography variant="body2" className={classes.userName}>
              {user && user.name ? user.name.split(' ')[0] : 'User'}
            </Typography>
          </Hidden>
          <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            {user && user.imageUrl ? (
              <Avatar 
                src={user.imageUrl} 
                alt={user.name || 'User'} 
                className={classes.avatar}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Box>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >

          <MenuItem
            component={LinkBehavior}
            to="/profile"
            onClick={handleClose}
          >
            Profile
          </MenuItem>
          <MenuItem onClick={onLogout}>Logout</MenuItem>
        </Menu>
      </Hidden>
      <Hidden mdUp>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
      </Hidden>
    </>
  );

  const guestLinks = (
    <>
      <Hidden smDown>
        <Button
          color="inherit"
          component={LinkBehavior}
          to="/about"
          className={classes.navLink}
        >
          About
        </Button>
        <Button
          color="inherit"
          component={LinkBehavior}
          to="/login"
          className={classes.navLink}
        >
          Login
        </Button>
        <Button
          color="inherit"
          component={LinkBehavior}
          to="/register"
          className={classes.navLink}
        >
          Register
        </Button>
      </Hidden>
      <Hidden mdUp>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
      </Hidden>
    </>
  );

  const drawer = (
    <div className={classes.drawer}>
      {isAuthenticated && user && (
        <Box p={2} display="flex" alignItems="center">
          {user.imageUrl ? (
            <Avatar 
              src={user.imageUrl} 
              alt={user.name || 'User'} 
              style={{ marginRight: 16 }}
            />
          ) : (
            <AccountCircle style={{ marginRight: 16, fontSize: 40 }} />
          )}
          <Typography variant="subtitle1">
            {user.name || 'User'}
          </Typography>
        </Box>
      )}
      <Divider />
      <List>
        <ListItem button component={LinkBehavior} to="/" onClick={handleDrawerToggle}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        {isAuthenticated ? (
          <>
            <ListItem button component={LinkBehavior} to="/dashboard" onClick={handleDrawerToggle}>
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={LinkBehavior} to="/meals/select" onClick={handleDrawerToggle}>
              <ListItemIcon>
                <RestaurantMenu />
              </ListItemIcon>
              <ListItemText primary="Select Meals" />
            </ListItem>
            <ListItem button component={LinkBehavior} to="/meals/weekly" onClick={handleDrawerToggle}>
              <ListItemIcon>
                <ViewWeek />
              </ListItemIcon>
              <ListItemText primary="Weekly Menu" />
            </ListItem>
            <ListItem button component={LinkBehavior} to="/meals/history" onClick={handleDrawerToggle}>
              <ListItemIcon>
                <CalendarToday />
              </ListItemIcon>
              <ListItemText primary="Selection History" />
            </ListItem>
            {user && user.role === 'admin' && (
              <>
                <ListItem button component={LinkBehavior} to="/admin" onClick={handleDrawerToggle}>
                  <ListItemIcon>
                    <SupervisorAccount />
                  </ListItemIcon>
                  <ListItemText primary="Admin" />
                </ListItem>
                <ListItem button component={LinkBehavior} to="/admin/ai-meal-generator" onClick={handleDrawerToggle}>
                  <ListItemIcon>
                    <RestaurantMenu />
                  </ListItemIcon>
                  <ListItemText primary="AI Meal Generator" />
                </ListItem>
                <ListItem button component={LinkBehavior} to="/admin/ai-camera-generator" onClick={handleDrawerToggle}>
                  <ListItemIcon>
                    <CameraAlt />
                  </ListItemIcon>
                  <ListItemText primary="AI Camera Generator" />
                </ListItem>
              </>
            )}
            <Divider />

            <ListItem button component={LinkBehavior} to="/profile" onClick={handleDrawerToggle}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={() => { onLogout(); handleDrawerToggle(); }}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={LinkBehavior} to="/about" onClick={handleDrawerToggle}>
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText primary="About" />
            </ListItem>
            <Divider />
            <ListItem button component={LinkBehavior} to="/login" onClick={handleDrawerToggle}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={LinkBehavior} to="/register" onClick={handleDrawerToggle}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={LinkBehavior}
            to="/"
            className={classes.title}
          >
            <span className={classes.logo}>
              <RestaurantMenu className={classes.logoIcon} />
              MealWise Family
            </span>
          </Typography>
          {isAuthenticated ? authLinks : guestLinks}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </div>
  );
};

Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logout })(Navbar);