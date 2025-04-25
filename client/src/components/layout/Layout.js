import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logout } from '../../actions/authActions';
import AlertContainer from './AlertContainer';

// Material UI
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Hidden,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  makeStyles
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  Dashboard,
  RestaurantMenu,
  HowToVote,
  People,
  Settings,
  ExitToApp,
  AccountCircle,
  Notifications,
  ChevronLeft
} from '@material-ui/icons';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  title: {
    flexGrow: 1,
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      marginLeft: drawerWidth,
    },
  },
  toolbar: theme.mixins.toolbar,
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginLeft: theme.spacing(1),
  },
  userInfo: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  userAvatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    marginBottom: theme.spacing(1),
  },
  userRole: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    marginTop: theme.spacing(0.5),
  },
  activeListItem: {
    backgroundColor: theme.palette.action.selected,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}));

const Layout = ({ children, auth: { isAuthenticated, user }, logout }) => {
  const classes = useStyles();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    const items = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard',
        roles: ['admin', 'user', 'viewer'],
      },
      {
        text: 'Meal Selection',
        icon: <HowToVote />,
        path: '/meals/select',
        roles: ['admin', 'user'],
      },
      {
        text: 'Meals',
        icon: <RestaurantMenu />,
        path: '/meals',
        roles: ['admin', 'user', 'viewer'],
      },
    ];

    // Add admin-only items
    if (user && user.role === 'admin') {
      items.push(
        {
          text: 'Admin Dashboard',
          icon: <Dashboard />,
          path: '/admin',
          roles: ['admin'],
        },
        {
          text: 'Manage Users',
          icon: <People />,
          path: '/admin/users',
          roles: ['admin'],
        },
        {
          text: 'System Settings',
          icon: <Settings />,
          path: '/admin/settings',
          roles: ['admin'],
        }
      );
    }

    return items.filter(
      (item) => !user || item.roles.includes(user.role)
    );
  };

  const drawer = (
    <div>
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeft />
        </IconButton>
      </div>
      <Divider />
      {user && (
        <div className={classes.userInfo}>
          <Avatar className={classes.userAvatar}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1">{user.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {user.email}
          </Typography>
          <Box className={classes.userRole}>
            {user.role}
          </Box>
        </div>
      )}
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.path}
            className={location.pathname === item.path ? classes.activeListItem : ''}
            onClick={handleDrawerClose}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title} component={RouterLink} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            MealWise Family
          </Typography>

          {isAuthenticated ? (
            <>
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={0} color="secondary">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                startIcon={<AccountCircle />}
              >
                {user && user.name.split(' ')[0]}
              </Button>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  component={RouterLink}
                  to="/profile"
                  onClick={handleMenuClose}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <nav className={classes.drawer}>
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>

      <main className={classes.content}>
        <div className={classes.toolbar} />
        <AlertContainer />
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  auth: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logout })(Layout);