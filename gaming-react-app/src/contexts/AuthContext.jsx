import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.isAuthenticated) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would validate credentials with your backend
      // For demo purposes, we'll accept any valid email/password combination
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const userData = {
        id: Date.now(), // Simulate user ID
        email,
        name: email.split('@')[0],
        username: email.split('@')[0],
        avatar: `https://via.placeholder.com/150x150/00d4ff/ffffff?text=${email.charAt(0).toUpperCase()}`,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Basic validation
      const { firstName, lastName, username, email, password, confirmPassword } = userData;
      
      if (!firstName || !lastName || !username || !email || !password) {
        throw new Error('All fields are required');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const newUser = {
        id: Date.now(),
        email,
        name: `${firstName} ${lastName}`,
        username,
        firstName,
        lastName,
        avatar: `https://via.placeholder.com/150x150/00d4ff/ffffff?text=${firstName.charAt(0)}${lastName.charAt(0)}`,
        isAuthenticated: true,
        joinDate: new Date().toISOString(),
        loginTime: new Date().toISOString()
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    
    // Clear any other user-related data
    localStorage.removeItem('favorites'); // Reset favorites on logout
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would verify the current password with your backend
      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      // Simulate successful password change
      const updatedUser = {
        ...user,
        passwordChangedAt: new Date().toISOString()
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password (forgot password)
  const resetPassword = async (email) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Simulate sending reset email
      return { 
        success: true, 
        message: 'Password reset instructions have been sent to your email' 
      };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has specific permissions
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // For demo purposes, all authenticated users have basic permissions
    const basicPermissions = ['read', 'comment', 'favorite'];
    const adminPermissions = ['write', 'edit', 'delete', 'admin'];
    
    // Check if user is admin (for demo, users with 'admin' in email are admins)
    const isAdmin = user.email?.includes('admin');
    
    if (isAdmin) {
      return [...basicPermissions, ...adminPermissions].includes(permission);
    }
    
    return basicPermissions.includes(permission);
  };

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Methods
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;