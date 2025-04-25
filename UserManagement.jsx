import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

import { getUsers, createUser, updateUser, deleteUser, updateUserRole } from '../actions/userActions';

/**
 * UserManagement Component
 * Allows admin users to manage family members and their roles
 */
const UserManagement = () => {
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const { user: currentUser } = useSelector(state => state.auth);
  const { users, loading, error } = useSelector(state => state.users);
  
  // Local state
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'chooser',
    preferences: []
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch users on component mount
  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);
  
  // Handle user form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value
    });
  };
  
  // Handle preferences input change
  const handlePreferencesChange = (e) => {
    const { value } = e.target;
    setUserForm({
      ...userForm,
      preferences: typeof value === 'string' ? value.split(',') : value
    });
  };
  
  // Open user form for creating a new user
  const handleOpenCreateForm = () => {
    setEditMode(false);
    setCurrentEditUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'chooser',
      preferences: []
    });
    setFormOpen(true);
  };
  
  // Open user form for editing an existing user
  const handleOpenEditForm = (user) => {
    setEditMode(true);
    setCurrentEditUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password field for security
      role: user.role,
      preferences: user.preferences || []
    });
    setFormOpen(true);
  };
  
  // Close user form
  const handleCloseForm = () => {
    setFormOpen(false);
  };
  
  // Submit user form
  const handleSubmitUser = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!userForm.name || !userForm.email || (!editMode && !userForm.password)) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    // Create form data object
    const userData = { ...userForm };
    
    // If editing and password is empty, remove it from the data
    if (editMode && !userData.password) {
      delete userData.password;
    }
    
    if (editMode && currentEditUser) {
      dispatch(updateUser(currentEditUser._id, userData));
    } else {
      dispatch(createUser(userData));
    }
    
    setFormOpen(false);
    setSnackbar({
      open: true,
      message: editMode ? 'User updated successfully' : 'User created successfully',
      severity: 'success'
    });
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  
  // Delete user
  const handleDeleteUser = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete._id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
    }
  };
  
  // Open role change dialog
  const handleOpenRoleDialog = (user) => {
    setUserToChangeRole(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };
  
  // Close role change dialog
  const handleCloseRoleDialog = () => {
    setRoleDialogOpen(false);
    setUserToChangeRole(null);
  };
  
  // Update user role
  const handleUpdateRole = () => {
    if (userToChangeRole && newRole) {
      dispatch(updateUserRole(userToChangeRole._id, { role: newRole }));
      setRoleDialogOpen(false);
      setUserToChangeRole(null);
      setSnackbar({
        open: true,
        message: 'User role updated successfully',
        severity: 'success'
      });
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Get role icon and color
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return {
          icon: <AdminIcon />,
          color: 'error',
          label: 'Admin'
        };
      case 'chooser':
        return {
          icon: <PersonIcon />,
          color: 'primary',
          label: 'Chooser'
        };
      case 'viewer':
        return {
          icon: <VisibilityIcon />,
          color: 'default',
          label: 'Viewer'
        };
      default:
        return {
          icon: <PersonIcon />,
          color: 'default',
          label: role
        };
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading users...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PersonAddIcon />}
            onClick={handleOpenCreateForm}
            sx={{ mr: 2 }}
          >
            Add New User
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={() => dispatch(getUsers())}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Preferences</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => {
              const roleDisplay = getRoleDisplay(user.role);
              
              return (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={roleDisplay.icon}
                      label={roleDisplay.label}
                      color={roleDisplay.color}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {user.preferences && user.preferences.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {user.preferences.map(pref => (
                          <Chip 
                            key={pref} 
                            label={pref} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No preferences
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit User">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditForm(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Change Role">
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleOpenRoleDialog(user)}
                      >
                        <AdminIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(user)}
                        disabled={user._id === currentUser.id} // Prevent deleting yourself
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* User Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? `Edit User: ${currentEditUser?.name}` : 'Create New User'}
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmitUser}>
            <TextField
              name="name"
              label="Name"
              value={userForm.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={userForm.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              name="password"
              label={editMode ? "New Password (leave blank to keep current)" : "Password"}
              type="password"
              value={userForm.password}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required={!editMode}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={userForm.role}
                onChange={handleInputChange}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="chooser">Chooser</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="preferences-label">Dietary Preferences</InputLabel>
              <Select
                labelId="preferences-label"
                multiple
                value={userForm.preferences}
                onChange={handlePreferencesChange}
                label="Dietary Preferences"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="vegetarian">Vegetarian</MenuItem>
                <MenuItem value="vegan">Vegan</MenuItem>
                <MenuItem value="gluten-free">Gluten-Free</MenuItem>
                <MenuItem value="dairy-free">Dairy-Free</MenuItem>
                <MenuItem value="nut-free">Nut-Free</MenuItem>
                <MenuItem value="low-carb">Low-Carb</MenuItem>
                <MenuItem value="spicy">Spicy</MenuItem>
                <MenuItem value="no-seafood">No Seafood</MenuItem>
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitUser}
            variant="contained" 
            color="primary"
          >
            {editMode ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Role Change Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={handleCloseRoleDialog}
      >
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Change the role for user "{userToChangeRole?.name}".
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="new-role-label">Role</InputLabel>
            <Select
              labelId="new-role-label"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="chooser">Chooser</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Role Permissions:
            </Typography>
            <Typography variant="body2">
              <strong>Admin:</strong> Full access to manage meals, users, and view all data.
            </Typography>
            <Typography variant="body2">
              <strong>Chooser:</strong> Can select meals from the weekly menu.
            </Typography>
            <Typography variant="body2">
              <strong>Viewer:</strong> Can only view the dashboard and meal selections.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateRole} 
            color="primary"
            variant="contained"
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;