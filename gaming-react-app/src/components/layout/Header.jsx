import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Heart, User, Gamepad2, LogIn, UserPlus, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ onSearchChange, searchTerm }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Games', path: '/games' },
    { name: 'Advanced', path: '/advanced-games' },
    { name: 'Categories', path: '/categories' },
    { name: 'Favorites', path: '/favorites' },
    { name: 'About', path: '/about' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <Gamepad2 className="logo-icon" />
          <span className="logo-text">GameHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className={`search-container ${isSearchOpen ? 'open' : ''}`}>
          <Search className="search-icon" size={14} />
          <input
            type="text"
            placeholder="Search games..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          <button
            className="action-btn search-toggle"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search size={14} />
          </button>
          
          {isAuthenticated && (
            <Link to="/favorites" className="action-btn">
              <Heart size={16} />
            </Link>
          )}
          
          {/* User Menu */}
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button
                className="action-btn user-menu-toggle"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                ) : (
                  <User size={16} />
                )}
              </button>
              
              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user?.name}</div>
                      <div className="user-email">{user?.email}</div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <div className="dropdown-menu">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      to="/favorites" 
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Heart size={16} />
                      <span>Favorites</span>
                    </Link>
                    <Link 
                      to="/settings" 
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login-btn">
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="auth-btn register-btn">
                <UserPlus size={16} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="action-btn menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.name}
          </Link>
        ))}
        
        {/* Mobile Auth Links */}
        <div className="mobile-auth">
          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">{user?.name}</div>
                  <div className="mobile-user-email">{user?.email}</div>
                </div>
              </div>
              <Link
                to="/profile"
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} />
                Profile
              </Link>
              <Link
                to="/settings"
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings size={16} />
                Settings
              </Link>
              <button
                className="mobile-nav-link logout-btn"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="mobile-nav-link auth-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn size={16} />
                Sign In
              </Link>
              <Link
                to="/register"
                className="mobile-nav-link auth-link register"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserPlus size={16} />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;