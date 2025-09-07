// components/AuthDemo.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import'../styles/auth.css';
import ProcessVisualization from './ProcessVisualization';

const AuthDemo = () => {
  const [currentView, setCurrentView] = useState('login');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(10);
  const [showForm, setShowForm] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const visualizationContainerRef = useRef();
  const visualizationRef = useRef();
  const navigate = useNavigate();

  const handleFormSubmit = (data, isSignup) => {
    setIsProcessing(true);
    setIsPaused(false);
    setUserData({ ...data, isSignup });
    setShowForm(false);
    
    // Scroll to visualization after a short delay
    setTimeout(() => {
      if (visualizationContainerRef.current) {
        visualizationContainerRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  };

  const handleViewChange = (view) => {
    if (!isProcessing) {
      setCurrentView(view);
    }
  };

  const handleReplay = () => {
    if (userData && visualizationRef.current) {
      setIsProcessing(true);
      setIsPaused(false);
      setShowForm(false);
      visualizationRef.current.replayAnimation();
    }
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    if (visualizationRef.current) {
      if (isPaused) {
        visualizationRef.current.resumeAnimation();
      } else {
        visualizationRef.current.pauseAnimation();
      }
    }
  };

  const handleAnimationComplete = () => {
    setIsProcessing(false);
    setIsPaused(false);
    setShowForm(true);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <header>
        <button className="back-button" onClick={handleBackToHome}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
        <h1>Authentication Process Visualizer</h1>
        <p className="subtitle">
          See exactly what happens during login and signup processes
        </p>
      </header>

      <div 
        ref={visualizationContainerRef}
        className={`visualization-container ${!showForm ? 'expanded' : ''}`}
      >
        {showForm && (
          <div className="user-interface-panel">
            <div className="form-toggle">
              <button 
                className={currentView === 'login' ? 'active' : ''}
                onClick={() => handleViewChange('login')}
                disabled={isProcessing}
              >
                Login
              </button>
              <button 
                className={currentView === 'signup' ? 'active' : ''}
                onClick={() => handleViewChange('signup')}
                disabled={isProcessing}
              >
                Sign Up
              </button>
            </div>

            {currentView === 'login' ? (
              <Login onSubmit={handleFormSubmit} disabled={isProcessing} />
            ) : (
              <Signup onSubmit={handleFormSubmit} disabled={isProcessing} />
            )}
          </div>
        )}

        <ProcessVisualization 
          ref={visualizationRef}
          isProcessing={isProcessing} 
          userData={userData}
          animationSpeed={animationSpeed}
          isPaused={isPaused}
          onPauseToggle={handlePauseToggle}
          onComplete={handleAnimationComplete}
        />
      </div>

      <div className="controls">
        <div className="speed-control">
          <label htmlFor="speed">
            <i className="fas fa-tachometer-alt"></i>
            Animation Speed:
          </label>
          <input 
            type="range" 
            id="speed" 
            min="1" 
            max="15" 
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
            disabled={isProcessing}
          />
          <span className="speed-value">{animationSpeed}x</span>
        </div>
        
        <button className="control-btn" onClick={handleReplay} disabled={isProcessing}>
          <i className="fas fa-redo"></i>
          Replay Animation
        </button>
        
        <button 
          className="control-btn" 
          onClick={handlePauseToggle} 
          disabled={!isProcessing}
        >
          <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </>
  );
};

export default AuthDemo;