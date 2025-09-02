import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MiddlewareDemo.css';

const MiddlewareDemo = () => {
  const navigate = useNavigate();
  const [currentScene, setCurrentScene] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [activeMiddleware, setActiveMiddleware] = useState('auth');

  const middlewareTypes = {
    auth: {
      title: "Authentication Middleware",
      description: "Verifies user identity before allowing access to protected routes",
      checks: ["Token Validation", "User Exists", "Permissions Check"],
      icon: "🔐",
      color: "#ff6b6b"
    },
    validation: {
      title: "Validation Middleware", 
      description: "Ensures incoming data meets required format and standards",
      checks: ["Data Type Check", "Required Fields", "Format Validation"],
      icon: "✅",
      color: "#4ecdc4"
    },
    logging: {
      title: "Logging Middleware",
      description: "Records request details for monitoring and debugging purposes",
      checks: ["Timestamp", "IP Address", "Endpoint", "Status"],
      icon: "📝",
      color: "#45b7d1"
    }
  };

  const startVisualization = (type) => {
    setIsProcessing(true);
    setActiveMiddleware(type);
    setCurrentScene(0);
    
    const scenes = [
      { duration: 2000, message: "📨 Incoming request received..." },
      { duration: 3000, message: `🛡️ ${middlewareTypes[type].title} processing...` },
      { duration: 2500, message: `🔍 Checking: ${middlewareTypes[type].checks[0]}` },
      { duration: 2500, message: `🔍 Checking: ${middlewareTypes[type].checks[1]}` },
      { duration: 2500, message: `🔍 Checking: ${middlewareTypes[type].checks[2]}` },
      { duration: 3000, message: "✅ All checks passed! Forwarding to route..." }
    ];

    let timeAccumulator = 0;
    scenes.forEach((scene, index) => {
      setTimeout(() => {
        if (!isPaused) {
          setCurrentScene(index);
        }
      }, timeAccumulator);
      timeAccumulator += scene.duration;
    });

    setTimeout(() => {
      setIsProcessing(false);
    }, timeAccumulator);
  };

  return (
    <div className="middleware-demo">
      <header>
        <button className="back-button" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
        <h1>Middleware Visualization</h1>
        <p className="subtitle">
          The gatekeepers of your backend - processing requests before they reach your routes
        </p>
      </header>

      <div className="demo-content">
        {/* Middleware Selection */}
        {!isProcessing && (
          <div className="middleware-selection">
            <h2>Choose Middleware to Visualize</h2>
            <div className="middleware-cards">
              {Object.entries(middlewareTypes).map(([key, middleware]) => (
                <div
                  key={key}
                  className="middleware-card"
                  onClick={() => startVisualization(key)}
                  style={{ borderLeft: `4px solid ${middleware.color}` }}
                >
                  <div className="card-icon" style={{ color: middleware.color }}>
                    {middleware.icon}
                  </div>
                  <h3>{middleware.title}</h3>
                  <p>{middleware.description}</p>
                  <div className="card-checks">
                    {middleware.checks.map((check, index) => (
                      <span key={index} className="check-tag">✓ {check}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visualization Area */}
        {isProcessing && (
          <div className="visualization-area">
            <div className="server-flow">
              {/* Client */}
              <div className="node client">
                <div className="node-icon">🌐</div>
                <div className="node-label">Client</div>
              </div>

              {/* Connection Line */}
              <div className="connection-line">
                <div className="data-packet" style={{ animationDelay: `${currentScene * 0.5}s` }}>
                  📨
                </div>
              </div>

              {/* Middleware */}
              <div className="node middleware">
                <div className="node-icon" style={{ color: middlewareTypes[activeMiddleware].color }}>
                  {middlewareTypes[activeMiddleware].icon}
                </div>
                <div className="node-label">{middlewareTypes[activeMiddleware].title}</div>
                <div className="processing-animation">
                  {currentScene >= 2 && currentScene <= 4 && (
                    <div className="check-animation">
                      <div className="check-circle"></div>
                      <span>{middlewareTypes[activeMiddleware].checks[currentScene - 2]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Line */}
              <div className="connection-line">
                <div className="data-packet" style={{ 
                  animationDelay: `${(currentScene + 1) * 0.5}s`,
                  opacity: currentScene >= 5 ? 1 : 0
                }}>
                  ✅
                </div>
              </div>

              {/* Server */}
              <div className="node server">
                <div className="node-icon">🖥️</div>
                <div className="node-label">Server</div>
              </div>
            </div>

            <div className="status-message">
              <div className="message-text">
                {currentScene === 0 && "📨 Request received from client..."}
                {currentScene === 1 && `🛡️ ${middlewareTypes[activeMiddleware].title} activated...`}
                {currentScene === 2 && `🔍 ${middlewareTypes[activeMiddleware].checks[0]}`}
                {currentScene === 3 && `🔍 ${middlewareTypes[activeMiddleware].checks[1]}`}
                {currentScene === 4 && `🔍 ${middlewareTypes[activeMiddleware].checks[2]}`}
                {currentScene === 5 && "✅ All checks passed! Request forwarded to server"}
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentScene + 1) / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Educational Info */}
        <div className="educational-info">
          <h2>What is Middleware?</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>🛡️ Security Gatekeeper</h3>
              <p>Middleware acts as a security checkpoint that every request must pass through before reaching your main application logic.</p>
            </div>
            <div className="info-card">
              <h3>⛓️ Request Pipeline</h3>
              <p>Multiple middleware functions can be chained together, each handling specific aspects like authentication, validation, and logging.</p>
            </div>
            <div className="info-card">
              <h3>🚦 Flow Control</h3>
              <p>Middleware can allow, modify, redirect, or reject requests based on business rules and security requirements.</p>
            </div>
          </div>

          <div className="real-world-example">
            <h3>🎓 College Guard Analogy</h3>
            <p>Think of middleware like a college security guard:</p>
            <ul>
              <li>📋 <strong>Check ID</strong> - Verify you're a student (Authentication)</li>
              <li>🎒 <strong>Check Bag</strong> - Ensure you're not bringing prohibited items (Validation)</li>
              <li>📝 <strong>Log Entry</strong> - Record who enters and when (Logging)</li>
              <li>🚫 <strong>Stop Suspicious</strong> - Prevent unauthorized access (Security)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="speed-control">
          <label>
            <i className="fas fa-tachometer-alt"></i>
            Speed:
          </label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(e.target.value)}
          />
          <span>{animationSpeed}x</span>
        </div>
        
        <button className="control-btn" onClick={() => startVisualization(activeMiddleware)}>
          <i className="fas fa-redo"></i>
          Replay
        </button>
        
        <button className="control-btn" onClick={() => setIsPaused(!isPaused)}>
          <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  );
};

export default MiddlewareDemo;