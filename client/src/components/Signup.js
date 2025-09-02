// components/Signup.js
import React, { useState } from 'react';
import '../styles/Signup.css';

const Signup = ({ onSubmit, disabled }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    onSubmit(formData, true);
  };

  return (
    <div className="signup-form">
      <form onSubmit={handleSubmit}>
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
          <label htmlFor="username">
            <i className="fas fa-user"></i>
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
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
            required
            disabled={disabled}
          />
        </div>

        <button type="submit" disabled={disabled}>
          <i className="fas fa-user-plus"></i>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;