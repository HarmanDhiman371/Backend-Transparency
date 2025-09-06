// components/AuthenticationDemo.js
import React, { useState } from 'react';
import AuthenticationVisualization from './AuthenticationVisualization';
import AuthForm from './AuthForm';
import '../styles/AuthenticationDemo.css';

const AuthenticationDemo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [userData, setUserData] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(5);

  const handleAuthSubmit = (data, isSignup) => {
    setUserData({ ...data, isSignup });
    setIsProcessing(true);
    setIsPaused(false);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleComplete = () => {
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  const handleSpeedChange = (speed) => {
    setAnimationSpeed(speed);
  };

  const handleReset = () => {
    setIsProcessing(false);
    setUserData(null);
    setIsPaused(false);
  };

  return (
    <div className="authentication-demo">
      <h1>Authentication Process Visualization</h1>
      <p className="demo-description">
        See how authentication works behind the scenes when you login or sign up
      </p>

      <div className="demo-container">
        <div className="form-section">
          <AuthForm 
            onSubmit={handleAuthSubmit} 
            disabled={isProcessing}
            onReset={handleReset}
            isProcessing={isProcessing}
            isPaused={isPaused}
            onPauseToggle={handlePauseToggle}
            animationSpeed={animationSpeed}
            onSpeedChange={handleSpeedChange}
          />
        </div>

        <div className="visualization-section">
          <AuthenticationVisualization
            isProcessing={isProcessing}
            userData={userData}
            animationSpeed={animationSpeed}
            isPaused={isPaused}
            onPauseToggle={handlePauseToggle}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthenticationDemo;