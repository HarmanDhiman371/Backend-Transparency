import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MiddlewareDemo.css';

const MiddlewareDemo = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [requestStatus, setRequestStatus] = useState('success');
  const [packetPosition, setPacketPosition] = useState('md-hidden');
  const [middlewareType, setMiddlewareType] = useState('authentication');
  const [responsePosition, setResponsePosition] = useState('md-hidden');
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
    { title: "Request Initiated", description: "Client sends HTTP request to middleware", duration: 2000 },
    { title: "Middleware Processing", description: "Request reaches middleware layer", duration: 2500 },
    { title: "Middleware Processing", description: middlewareTypes[middlewareType].steps[1], duration: 3000 },
    { title: "Middleware Completed", description: middlewareTypes[middlewareType].steps[3], duration: 2000 },
    { title: "Server Processing", description: "Request passed to server for processing", duration: 3000 },
    { title: "Response Sent", description: "Sending response back to client", duration: 2000 }
  ];

  const startVisualization = (status = 'success') => {
    setIsProcessing(true);
    setCurrentStep(0);
    setRequestStatus(status);
    setPacketPosition('md-hidden');
    setResponsePosition('md-hidden');
    clearTimeout(animationRef.current);

    const animate = (step) => {
      if (step < steps.length && !isPaused) {
        setCurrentStep(step);
        
        // Update packet positions based on current step
        if (step === 0) {
          setPacketPosition('md-client');
        } else if (step === 1) {
          setPacketPosition('md-to-middleware');
        } else if (step === 2) {
          setPacketPosition('md-in-middleware');
        } else if (step === 3) {
          setPacketPosition('md-to-server');
        } else if (step === 4) {
          setPacketPosition('md-in-server');
        } else if (step === 5) {
          setPacketPosition('md-hidden');
          setResponsePosition('md-returning');
        }
        
        animationRef.current = setTimeout(() => {
          animate(step + 1);
        }, steps[step].duration / animationSpeed);
      } else if (step === steps.length) {
        setIsProcessing(false);
        setPacketPosition('md-hidden');
        setResponsePosition('md-hidden');
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
      startVisualizationFromStep(currentStep);
    }
  };

  const startVisualizationFromStep = (step) => {
    if (step < steps.length && !isPaused) {
      setCurrentStep(step);
      animationRef.current = setTimeout(() => {
        startVisualizationFromStep(step + 1);
      }, steps[step].duration / animationSpeed);
    }
  };

  const handleMiddlewareTypeChange = (type) => {
    if (!isProcessing) {
      setMiddlewareType(type);
    }
  };

  const resetVisualization = () => {
    setIsProcessing(false);
    setIsPaused(false);
    setCurrentStep(0);
    setPacketPosition('md-hidden');
    setResponsePosition('md-hidden');
    clearTimeout(animationRef.current);
  };

  return (
    <div className="md-page">
      <header>
        <button className="md-back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Middleware Process Visualization</h1>
        <p className="md-subtitle">
          Watch the animated flow of requests through different middleware types
        </p>
      </header>

      <div className="md-container">
        {/* Educational Section */}
        <div className="md-educational-section">
          <h2>Understanding Middleware</h2>
          <p>
            Middleware is software that acts as a bridge between an operating system or database and applications, 
            especially on a network. It provides common services and capabilities to applications outside of what's 
            offered by the operating system.
          </p>
          
          <div className="md-info-grid">
            <div className="md-info-card">
              <div className="md-card-icon">🛡️</div>
              <h3>Security Layer</h3>
              <p>Middleware acts as a security checkpoint, preventing unauthorized access and validating incoming requests.</p>
            </div>

            <div className="md-info-card">
              <div className="md-card-icon">⚡</div>
              <h3>Performance Optimization</h3>
              <p>By handling common tasks like compression and caching, middleware improves application performance.</p>
            </div>

            <div className="md-info-card">
              <div className="md-card-icon">🔍</div>
              <h3>Request Transformation</h3>
              <p>Middleware can modify requests and responses, adding headers and transforming data formats.</p>
            </div>
          </div>
        </div>

        {/* Middleware Type Selection */}
        <div className="md-selector">
          <h3>Select Middleware Type:</h3>
          <div className="md-buttons">
            {Object.keys(middlewareTypes).map(type => (
              <button
                key={type}
                className={`md-btn ${middlewareType === type ? 'md-active' : ''}`}
                onClick={() => handleMiddlewareTypeChange(type)}
                disabled={isProcessing}
              >
                <span className="md-btn-icon">{middlewareTypes[type].icon}</span>
                <span className="md-btn-text">{middlewareTypes[type].name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visualization Section */}
        <div className="md-visualization-section">
          <div className="md-visualization-container">
            <div className="md-visualization-box">
              <div className="md-visualization-scene">
                
                {/* Client Node */}
                <div className="md-node md-client">
                  <div className="md-node-icon">🌐</div>
                  <div className="md-node-label">CLIENT</div>
                  <div className="md-node-status">
                    {currentStep === 0 ? 'Sending request...' : 
                     currentStep >= 5 ? 'Receiving response...' : 'Waiting...'}
                  </div>
                </div>

                {/* Connection Line to Middleware */}
                <div className="md-connection-line">
                  <div className={`md-line-fill ${['md-to-middleware', 'md-in-middleware', 'md-to-server', 'md-in-server'].includes(packetPosition) ? 'md-active' : ''}`}></div>
                </div>

                {/* Middleware Node */}
                <div className="md-node md-middleware">
                  <div className="md-node-icon">{middlewareTypes[middlewareType].icon}</div>
                  <div className="md-node-label">{middlewareTypes[middlewareType].name.toUpperCase()}</div>
                  <div className="md-node-status">
                    {currentStep === 1 ? middlewareTypes[middlewareType].steps[0] : 
                     currentStep === 2 ? middlewareTypes[middlewareType].steps[1] :
                     currentStep === 3 ? middlewareTypes[middlewareType].steps[3] : 
                     currentStep >= 4 ? 'Processing complete' : 'Ready'}
                  </div>
                  
                  {/* Processing Overlay */}
                  {(currentStep === 2 || currentStep === 3) && (
                    <div className="md-processing-overlay">
                      <div className="md-processing-spinner"></div>
                      <div className="md-processing-text">
                        {currentStep === 2 ? middlewareTypes[middlewareType].steps[2] : 'Processing complete'}
                      </div>
                    </div>
                  )}
                  
                  {/* Validation Result */}
                  {currentStep >= 3 && (
                    <div className={`md-validation-result ${requestStatus}`}>
                      {requestStatus === 'success' ? '✅ Approved' : '❌ Rejected'}
                    </div>
                  )}
                </div>

                {/* Connection Line to Server */}
                <div className="md-connection-line">
                  <div className={`md-line-fill ${['md-to-server', 'md-in-server'].includes(packetPosition) ? 'md-active' : ''}`}></div>
                </div>

                {/* Server Node */}
                <div className="md-node md-server">
                  <div className="md-node-icon">🖥️</div>
                  <div className="md-node-label">SERVER</div>
                  <div className="md-node-status">
                    {currentStep < 4 ? 'Waiting...' : 
                     currentStep === 4 ? 'Processing request...' : 'Request handled'}
                  </div>
                </div>

                {/* Response Line (Downward from Middleware) */}
                <div className="md-response-line">
                  <div className={`md-line-fill ${responsePosition === 'md-returning' ? 'md-active' : ''}`}></div>
                </div>

                {/* Request Packet */}
                <div className={`md-data-packet ${packetPosition}`}>
                  <div className="md-packet-content">
                    📦 Request
                  </div>
                </div>

                {/* Response Packet */}
                <div className={`md-response-packet ${responsePosition}`}>
                  <div className="md-packet-content">
                    ✅ Response
                  </div>
                </div>

              </div>

              {/* Status Display */}
              <div className="md-status-display">
                {currentStep === 0 && "Sending request to middleware..."}
                {currentStep === 1 && "Request arriving at middleware..."}
                {currentStep === 2 && `${middlewareTypes[middlewareType].name} processing request...`}
                {currentStep === 3 && `${middlewareTypes[middlewareType].name} complete. Forwarding to server...`}
                {currentStep === 4 && "Server processing request..."}
                {currentStep === 5 && "Sending response back to client..."}
              </div>
            </div>
          </div>
          
          {/* Current Step Info */}
          <div className="md-step-info">
            <h3>{isProcessing && steps[currentStep] ? steps[currentStep].title : "Ready to Start"}</h3>
            <p>{isProcessing && steps[currentStep] ? steps[currentStep].description : "Click Start to begin the visualization"}</p>
            <div className="md-progress-container">
              <div className="md-progress-bar">
                <div 
                  className="md-progress-fill"
                  style={{ width: isProcessing ? `${((currentStep + 1) / steps.length) * 100}%` : '0%' }}
                ></div>
              </div>
              <span>{isProcessing ? `Step ${currentStep + 1} of ${steps.length}` : 'Not started'}</span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="md-controls-section">
          {!isProcessing ? (
            <div className="md-request-buttons">
              <button className="md-start-button md-success" onClick={() => startVisualization('success')}>
                Start Visualization
              </button>
            </div>
          ) : (
            <div className="md-control-buttons">
              <div className="md-speed-control">
                <label>Speed:</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                />
                <span>{animationSpeed}x</span>
              </div>

              <button className="md-control-btn" onClick={() => resetVisualization()}>
                Reset
              </button>

              <button className="md-control-btn" onClick={pauseAnimation}>
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiddlewareDemo;