// components/AuthForm.js
import React, { useState } from 'react';
import '../styles/AuthForm.css';

const AuthForm = ({ 
  onSubmit, 
  disabled, 
  onReset, 
  isProcessing, 
  isPaused, 
  onPauseToggle, 
  animationSpeed, 
  onSpeedChange 
}) => {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSignup && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    onSubmit(formData, isSignup);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: ''
    });
    onReset();
  };

  return (
    <div className="auth-form-container">
      <div className="form-header">
        <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
        <button 
          type="button" 
          className="toggle-mode-btn"
          onClick={toggleMode}
          disabled={isProcessing}
        >
          {isSignup ? 'Already have an account? Login' : 'Need an account? Sign up'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {isSignup && (
          <div className="input-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required={isSignup}
              disabled={disabled}
            />
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email">
            <i className="fas fa-envelope"></i>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">
            <i className="fas fa-lock"></i>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        {isSignup && (
          <div className="input-group">
            <label htmlFor="confirmPassword">
              <i className="fas fa-lock"></i>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required={isSignup}
              disabled={disabled}
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={disabled}
          className="submit-btn"
        >
          <i className={`fas ${isSignup ? 'fa-user-plus' : 'fa-sign-in-alt'}`}></i>
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>

      {isProcessing && (
        <div className="controls">
          <div className="control-group">
            <button 
              type="button" 
              className={`control-btn ${isPaused ? 'paused' : ''}`}
              onClick={onPauseToggle}
            >
              <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            
            <button 
              type="button" 
              className="control-btn reset-btn"
              onClick={onReset}
            >
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>

          <div className="speed-control">
            <span>Animation Speed:</span>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={animationSpeed} 
              onChange={(e) => onSpeedChange(parseInt(e.target.value))}
              className="speed-slider"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForm;