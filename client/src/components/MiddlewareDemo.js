import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MiddlewareDemo.css';

const MiddlewareDemo = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [requestStatus, setRequestStatus] = useState('pending');
  const [packetPosition, setPacketPosition] = useState('hidden');
  const [middlewareType, setMiddlewareType] = useState('authentication');
  const animationRef = useRef(null);

  const middlewareTypes = {
    authentication: {
      name: "Authentication",
      icon: "🔐",
      steps: [
        "Receiving request...",
        "Checking credentials...",
        "Validating token...",
        "Authentication passed"
      ]
    },
    validation: {
      name: "Validation",
      icon: "📋",
      steps: [
        "Receiving request...",
        "Checking data format...",
        "Validating fields...",
        "Validation passed"
      ]
    },
    logging: {
      name: "Logging",
      icon: "📝",
      steps: [
        "Receiving request...",
        "Recording timestamp...",
        "Logging request details...",
        "Logging complete"
      ]
    },
    compression: {
      name: "Compression",
      icon: "🗜️",
      steps: [
        "Receiving request...",
        "Analyzing payload...",
        "Compressing data...",
        "Compression complete"
      ]
    }
  };

  const steps = [
    {
      title: "Request Initiated",
      description: "Client sends HTTP request to server",
      visual: "request-sent",
      duration: 2000
    },
    {
      title: `${middlewareTypes[middlewareType].name} Middleware`,
      description: "Request reaches middleware layer for processing",
      visual: "middleware-processing",
      duration: 2500
    },
    {
      title: `${middlewareTypes[middlewareType].name} Processing`,
      description: middlewareTypes[middlewareType].steps[1],
      visual: "middleware-processing",
      duration: 3000
    },
    {
      title: `${middlewareTypes[middlewareType].name} Completed`, 
      description: middlewareTypes[middlewareType].steps[3],
      visual: "middleware-complete",
      duration: 2000
    },
    {
      title: "Server Processing",
      description: "Request passed middleware, proceeding to server",
      visual: "server-processing",
      duration: 3000
    },
    {
      title: "Response Sent",
      description: "Sending response back to client",
      visual: "response-sent",
      duration: 2000
    }
  ];

  const startVisualization = (status = 'success') => {
    setIsProcessing(true);
    setCurrentStep(0);
    setRequestStatus(status);
    setPacketPosition('hidden');
    clearTimeout(animationRef.current);

    const animate = (step) => {
      if (step < steps.length && !isPaused) {
        // Update state based on current step
        if (step === 0) {
          setPacketPosition('to-middleware');
        } else if (step === 1) {
          setPacketPosition('in-middleware');
        } else if (step === 2) {
          setPacketPosition('in-middleware');
        } else if (step === 3) {
          setPacketPosition('to-server');
        } else if (step === 4) {
          setPacketPosition('in-server');
        } else if (step === 5) {
          setPacketPosition('returning');
        }
        
        setCurrentStep(step);
        
        animationRef.current = setTimeout(() => {
          animate(step + 1);
        }, steps[step].duration * (10 / animationSpeed));
      } else if (step === steps.length) {
        setIsProcessing(false);
        setPacketPosition('hidden');
      }
    };

    animate(0);
  };

  useEffect(() => {
    return () => clearTimeout(animationRef.current);
  }, [isPaused, animationSpeed]);

  const pauseAnimation = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      clearTimeout(animationRef.current);
    } else {
      // Resume from current step
      const resumeFromStep = currentStep;
      setIsProcessing(true);
      
      animationRef.current = setTimeout(() => {
        startVisualizationFromStep(resumeFromStep);
      }, 100);
    }
  };

  const startVisualizationFromStep = (step) => {
    if (step < steps.length && !isPaused) {
      setCurrentStep(step);
      
      animationRef.current = setTimeout(() => {
        startVisualizationFromStep(step + 1);
      }, steps[step].duration * (10 / animationSpeed));
    } else if (step === steps.length) {
      setIsProcessing(false);
      setPacketPosition('hidden');
    }
  };

  const handleMiddlewareTypeChange = (type) => {
    if (!isProcessing) {
      setMiddlewareType(type);
    }
  };

  const renderVisualization = () => {
    return (
      <div className="visualization-container">
        <div className="visualization-box">
          <div className="visualization-scene">
            {/* Client - Left side */}
            <div className="node client">
              <div className="node-icon">🌐</div>
              <div className="node-label">CLIENT</div>
              <div className="node-status">
                {currentStep === 0 ? 'Sending request...' : 
                 currentStep >= 5 ? 'Receiving response...' : 'Waiting...'}
              </div>
            </div>

            {/* Connection Line to Middleware */}
            <div className="connection-line">
              <div className={`line-fill ${packetPosition === 'to-middleware' ? 'active' : ''}`}></div>
            </div>

            {/* Middleware - Center */}
            <div className="node middleware">
              <div className="node-icon">{middlewareTypes[middlewareType].icon}</div>
              <div className="node-label">{middlewareTypes[middlewareType].name.toUpperCase()}</div>
              <div className="node-status">
                {currentStep === 1 ? middlewareTypes[middlewareType].steps[0] : 
                 currentStep === 2 ? middlewareTypes[middlewareType].steps[1] :
                 currentStep === 3 ? middlewareTypes[middlewareType].steps[3] : 
                 currentStep >= 4 ? 'Processing complete' : 'Ready'}
              </div>
              
              {/* Processing indicators */}
              {(currentStep === 2) && (
                <div className="processing-overlay">
                  <div className="processing-spinner"></div>
                  <div className="processing-text">
                    {middlewareTypes[middlewareType].steps[2]}
                  </div>
                </div>
              )}
              
              {/* Validation Result */}
              {currentStep >= 3 && (
                <div className={`validation-result ${requestStatus}`}>
                  {requestStatus === 'success' ? '✅ Approved' : '❌ Rejected'}
                </div>
              )}
            </div>

            {/* Connection Line to Server */}
            <div className="connection-line">
              <div className={`line-fill ${packetPosition === 'to-server' ? 'active' : ''}`}></div>
            </div>

            {/* Server - Right side */}
            <div className="node server">
              <div className="node-icon">🖥️</div>
              <div className="node-label">SERVER</div>
              <div className="node-status">
                {currentStep < 4 ? 'Waiting...' : 
                 currentStep === 4 ? 'Processing request...' : 'Request handled'}
              </div>
              
              {/* Processing indicator */}
              {currentStep === 4 && (
                <div className="processing-overlay">
                  <div className="processing-spinner"></div>
                  <div className="processing-text">Processing your request</div>
                </div>
              )}
            </div>

            {/* Connection Line for Response */}
            {/* <div className="connection-line response">
              <div className={`line-fill ${packetPosition === 'returning' ? 'active' : ''}`}></div>
            </div> */}

            {/* Request Packet - Only visible when moving between nodes */}
            <div className={`data-packet ${packetPosition} ${packetPosition.includes('to-') || packetPosition.includes('returning') ? 'moving' : ''}`}>
              <div className="packet-content">
                {packetPosition === 'returning' ? '✅ Response' : '📦 Request'}
              </div>
            </div>
          </div>

          {/* Status Display at Bottom */}
          <div className="status-display">
            {currentStep === 0 && "Sending request to server..."}
            {currentStep === 1 && "Request arriving at middleware..."}
            {currentStep === 2 && `${middlewareTypes[middlewareType].name} middleware processing request...`}
            {currentStep === 3 && `${middlewareTypes[middlewareType].name} complete. Forwarding to server...`}
            {currentStep === 4 && "Server processing request..."}
            {currentStep === 5 && "Sending response back to client..."}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="middleware-demo-page">
      <header>
        <button className="back-button" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
        <h1>Middleware Process Visualization</h1>
        <p className="subtitle">
          Watch the animated flow of requests through different middleware types
        </p>
      </header>

      <div className="demo-container">
        {/* Middleware Type Selection */}
        <div className="middleware-selector">
          <h3>Select Middleware Type:</h3>
          <div className="middleware-buttons">
            {Object.keys(middlewareTypes).map(type => (
              <button
                key={type}
                className={`middleware-btn ${middlewareType === type ? 'active' : ''}`}
                onClick={() => handleMiddlewareTypeChange(type)}
                disabled={isProcessing}
              >
                <span className="middleware-btn-icon">{middlewareTypes[type].icon}</span>
                <span className="middleware-btn-text">{middlewareTypes[type].name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visualization Section */}
        <div className="visualization-section">
          {renderVisualization()}
          
          {/* Current Step Info */}
          <div className="step-info">
            <h3>{isProcessing && steps[currentStep] ? steps[currentStep].title : "Ready to Start"}</h3>
            <p>{isProcessing && steps[currentStep] ? steps[currentStep].description : "Click Start to begin the visualization"}</p>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: isProcessing ? `${((currentStep + 1) / steps.length) * 100}%` : '0%' }}
                ></div>
              </div>
              <span>{isProcessing ? `Step ${currentStep + 1} of ${steps.length}` : 'Not started'}</span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section">
          {!isProcessing ? (
            <div className="request-buttons">
              <button className="start-button success" onClick={() => startVisualization('success')}>
                <i className="fas fa-play"></i> Start Visualization
              </button>
            </div>
          ) : (
            <div className="control-buttons">
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
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                />
                <span>{animationSpeed}x</span>
              </div>

              <button className="control-btn" onClick={() => startVisualization(requestStatus)}>
                <i className="fas fa-redo"></i> Restart
              </button>

              <button
                className="control-btn"
                onClick={pauseAnimation}
              >
                <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          )}
        </div>

        {/* Educational Section */}
        <div className="educational-section">
          <h2>Understanding Middleware</h2>
          
          <div className="info-grid">
            <div className="info-card">
              <div className="card-icon">🛡️</div>
              <h3>Security Layer</h3>
              <p>Middleware acts as a security checkpoint, preventing unauthorized access and validating incoming requests before they reach your core application logic.</p>
            </div>

            <div className="info-card">
              <div className="card-icon">⚡</div>
              <h3>Performance Optimization</h3>
              <p>By handling common tasks like compression, caching, and rate limiting, middleware improves application performance and reduces server load.</p>
            </div>

            <div className="info-card">
              <div className="card-icon">🔍</div>
              <h3>Request Transformation</h3>
              <p>Middleware can modify requests and responses, adding headers, parsing data, and transforming formats between client and server.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiddlewareDemo;