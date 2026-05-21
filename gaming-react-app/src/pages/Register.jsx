import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  UserPlus,
  ArrowRight,
  Gamepad2,
  AlertCircle,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await register(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username
      });
      
      // Redirect to welcome page or dashboard
      navigate('/');
      
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <motion.div 
      className="register-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="register-container">
        <motion.div className="register-card" variants={itemVariants}>
          {/* Header */}
          <div className="register-header">
            <div className="logo-section">
              <Gamepad2 className="logo-icon" />
              <h1 className="logo-text">GameHub</h1>
            </div>
            <h2 className="register-title">Join GameHub!</h2>
            <p className="register-subtitle">Create your account and start your gaming adventure</p>
          </div>

          {/* Registration Form */}
          <form className="register-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message general-error">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Name Fields Row */}
            <div className="form-row">
              {/* First Name */}
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className={errors.firstName ? 'error' : ''}
                  />
                </div>
                {errors.firstName && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.firstName}</span>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className={errors.lastName ? 'error' : ''}
                  />
                </div>
                {errors.lastName && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className={errors.username ? 'error' : ''}
                />
              </div>
              {errors.username && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('password')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill strength-${passwordStrength.strength}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`strength-label strength-${passwordStrength.strength}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              
              {errors.password && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="password-match">
                    <Check size={16} />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="form-group">
              <label className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">
                  I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.terms}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="register-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Social Registration */}
          <div className="social-login">
            <button className="social-btn google-btn">
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
              Sign up with Google
            </button>
            <button className="social-btn github-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Sign up with GitHub
            </button>
          </div>

          {/* Login Link */}
          <div className="login-link">
            <p>Already have an account?</p>
            <Link to="/login" className="login-btn-link">
              Sign In
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Background Elements */}
        <div className="background-elements">
          <div className="floating-element element-1">🎮</div>
          <div className="floating-element element-2">🕹️</div>
          <div className="floating-element element-3">👾</div>
          <div className="floating-element element-4">🎯</div>
          <div className="floating-element element-5">🏆</div>
          <div className="floating-element element-6">⭐</div>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;