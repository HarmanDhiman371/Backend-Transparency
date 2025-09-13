import React, { useState, useRef, useEffect } from 'react';
import './ApiFlowVisualization.css';

const ApiFlowVisualization = () => {
  const [animationState, setAnimationState] = useState('idle');
  const [speed, setSpeed] = useState(1);
  const [city, setCity] = useState('London');
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [explanation, setExplanation] = useState('Click Start to begin the API flow visualization');
  
  const requestPacketRef = useRef(null);
  const responsePacketRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pathProgressRef = useRef(0);

  // Path coordinates for the request and response
  const requestPath = [
    { x: 10, y: 50, name: 'Client', desc: 'User device making the API request' },
    { x: 20, y: 30, name: 'Router 1', desc: 'Routes requests to appropriate network paths' },
    { x: 35, y: 60, name: 'Switch', desc: 'Directs data packets within the local network' },
    { x: 50, y: 40, name: 'DNS Server', desc: 'Translates domain names to IP addresses' },
    { x: 35, y: 60, name: 'Switch', desc: 'Returns to switch after DNS resolution' },
    { x: 65, y: 20, name: 'Router 2', desc: 'Routes request to external network' },
    { x: 80, y: 50, name: 'Load Balancer', desc: 'Distributes traffic across multiple servers' },
    { x: 70, y: 70, name: 'Firewall', desc: 'Filters and secures incoming requests' },
    { x: 90, y: 50, name: 'API Server', desc: 'Processes the request and returns response' }
  ];

  const responsePath = [
    { x: 90, y: 50, name: 'API Server', desc: 'Sends response back to client' },
    { x: 70, y: 70, name: 'Firewall', desc: 'Validates outgoing response' },
    { x: 40, y: 70, name: 'Router 3', desc: 'Routes response back through network' },
    { x: 35, y: 60, name: 'Switch', desc: 'Directs response to local network' },
    { x: 20, y: 30, name: 'Router 1', desc: 'Final routing to client device' },
    { x: 10, y: 50, name: 'Client', desc: 'Receives and processes the API response' }
  ];

  // Animation stages with durations (in ms)
  const stages = [
    { name: 'Client Request', duration: 2000, desc: 'User initiates API call from their device' },
    { name: 'DNS Resolution', duration: 2500, desc: 'Domain name is translated to IP address' },
    { name: 'TCP Handshake', duration: 2000, desc: 'Connection is established with the server' },
    { name: 'HTTP Request', duration: 3000, desc: 'Request is sent to the API server' },
    { name: 'Server Processing', duration: 2500, desc: 'Server processes the request and prepares response' },
    { name: 'Response', duration: 2000, desc: 'Response is sent back to the client' }
  ];

  // Start the animation
  const startAnimation = () => {
    if (animationState === 'running') return;
    
    setAnimationState('running');
    setProgress(0);
    setActiveStage(0);
    pathProgressRef.current = 0;
    startTimeRef.current = performance.now();
    setExplanation('Request initiated from client device');
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Pause the animation
  const pauseAnimation = () => {
    if (animationState === 'paused') return;
    setAnimationState('paused');
    setExplanation('Animation paused');
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Resume the animation
  const resumeAnimation = () => {
    if (animationState === 'running') return;
    setAnimationState('running');
    setExplanation('Resuming animation');
    startTimeRef.current = performance.now() - (pathProgressRef.current * getTotalDuration());
    animationRef.current = requestAnimationFrame(animate);
  };

  // Reset the animation
  const resetAnimation = () => {
    setAnimationState('idle');
    setProgress(0);
    setActiveStage(0);
    pathProgressRef.current = 0;
    setExplanation('Click Start to begin the API flow visualization');
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setWeatherData(null);
  };

  // Calculate total animation duration
  const getTotalDuration = () => {
    return stages.reduce((total, stage) => total + stage.duration, 0);
  };

  // Main animation function
  const animate = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = (timestamp - startTimeRef.current) * speed;
    const totalDuration = getTotalDuration();
    const progress = Math.min(elapsed / totalDuration, 1);
    
    setProgress(progress * 100);
    pathProgressRef.current = progress;
    
    // Update active stage based on progress
    let accumulatedTime = 0;
    let currentStage = 0;
    
    for (let i = 0; i < stages.length; i++) {
      accumulatedTime += stages[i].duration;
      if (elapsed < accumulatedTime) {
        currentStage = i;
        break;
      }
    }
    
    setActiveStage(currentStage);
    setExplanation(stages[currentStage].desc);
    
    // Update packet positions
    if (progress < 0.75) { // Request phase (first 75% of progress)
      const requestProgress = progress / 0.75;
      const requestPoint = getPointOnPath(requestPath, requestProgress);
      if (requestPacketRef.current) {
        requestPacketRef.current.style.left = `${requestPoint.x}%`;
        requestPacketRef.current.style.top = `${requestPoint.y}%`;
        
        // Calculate rotation angle for the packet
        if (requestProgress > 0 && requestProgress < 1) {
          const nextPoint = getPointOnPath(requestPath, requestProgress + 0.01);
          const angle = Math.atan2(nextPoint.y - requestPoint.y, nextPoint.x - requestPoint.x) * 180 / Math.PI;
          requestPacketRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        }
      }
    } else { // Response phase (last 25% of progress)
      const responseProgress = (progress - 0.75) / 0.25;
      const responsePoint = getPointOnPath(responsePath, responseProgress);
      if (responsePacketRef.current) {
        responsePacketRef.current.style.left = `${responsePoint.x}%`;
        responsePacketRef.current.style.top = `${responsePoint.y}%`;
        
        // Calculate rotation angle for the packet
        if (responseProgress > 0 && responseProgress < 1) {
          const nextPoint = getPointOnPath(responsePath, responseProgress + 0.01);
          const angle = Math.atan2(nextPoint.y - responsePoint.y, nextPoint.x - responsePoint.x) * 180 / Math.PI;
          responsePacketRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        }
      }
    }
    
    // Continue animation if not finished
    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setAnimationState('completed');
      setExplanation('API response received successfully');
      // Simulate receiving weather data
      setWeatherData({
        location: city,
        temperature: Math.round(20 + Math.random() * 15),
        condition: ['Clear', 'Clouds', 'Rain', 'Thunderstorm'][Math.floor(Math.random() * 4)],
        humidity: Math.round(40 + Math.random() * 40),
        wind: Math.round(5 + Math.random() * 15),
        feelsLike: Math.round(20 + Math.random() * 15),
        pressure: Math.round(1000 + Math.random() * 50)
      });
    }
  };

  // Calculate a point along the path based on progress (0 to 1)
  const getPointOnPath = (path, progress) => {
    if (progress <= 0) return path[0];
    if (progress >= 1) return path[path.length - 1];
    
    const exactIndex = progress * (path.length - 1);
    const index = Math.floor(exactIndex);
    const segmentProgress = exactIndex - index;
    
    const x = path[index].x + (path[index + 1].x - path[index].x) * segmentProgress;
    const y = path[index].y + (path[index + 1].y - path[index].y) * segmentProgress;
    
    return { x, y, name: path[index].name, desc: path[index].desc };
  };

  // Draw the path on the canvas
  useEffect(() => {
    const canvas = document.getElementById('pathCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw request path
    ctx.beginPath();
    ctx.moveTo(requestPath[0].x / 100 * width, requestPath[0].y / 100 * height);
    
    for (let i = 1; i < requestPath.length; i++) {
      ctx.lineTo(requestPath[i].x / 100 * width, requestPath[i].y / 100 * height);
    }
    
    ctx.strokeStyle = 'rgba(255, 230, 109, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw response path
    ctx.beginPath();
    ctx.moveTo(responsePath[0].x / 100 * width, responsePath[0].y / 100 * height);
    
    for (let i = 1; i < responsePath.length; i++) {
      ctx.lineTo(responsePath[i].x / 100 * width, responsePath[i].y / 100 * height);
    }
    
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, []);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="auth-visualizer-app">
      <div className="app">
        <header>
          <h1>Advanced API Flow Visualization</h1>
          <p className="subtitle">Watch the journey of an API request through network components with detailed explanations</p>
        </header>
        
        <div className="input-container">
          <input 
            type="text" 
            className="city-input" 
            placeholder="Enter city name (e.g., London)" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button className="btn" onClick={startAnimation}>
            <i className="fas fa-cloud-sun"></i> Get Weather
          </button>
        </div>
        
        <div className="controls">
          <button className="btn" onClick={startAnimation} disabled={animationState === 'running'}>
            <i className="fas fa-play"></i> Start API Call
          </button>
          <button className="btn" onClick={pauseAnimation} disabled={animationState !== 'running'}>
            <i className="fas fa-pause"></i> Pause
          </button>
          <button className="btn" onClick={resumeAnimation} disabled={animationState !== 'paused'}>
            <i className="fas fa-play"></i> Resume
          </button>
          <button className="btn" onClick={resetAnimation}>
            <i className="fas fa-redo"></i> Reset
          </button>
          
          <div className="speed-control">
            <span>Speed:</span>
            <button 
              className={`speed-btn ${speed === 0.5 ? 'active' : ''}`} 
              onClick={() => setSpeed(0.5)}
            >
              <i className="fas fa-tachometer-alt-slow"></i> Slow
            </button>
            <button 
              className={`speed-btn ${speed === 1 ? 'active' : ''}`} 
              onClick={() => setSpeed(1)}
            >
              <i className="fas fa-tachometer-alt-average"></i> Normal
            </button>
            <button 
              className={`speed-btn ${speed === 2 ? 'active' : ''}`} 
              onClick={() => setSpeed(2)}
            >
              <i className="fas fa-tachometer-alt-fast"></i> Fast
            </button>
          </div>
        </div>
        
        <div className="stage-indicator">
          <div className="stage-line"></div>
          <div className="stage-progress" style={{ width: `${progress}%` }}></div>
          
          {stages.map((stage, index) => (
            <div 
              key={index} 
              className={`stage ${index === activeStage ? 'active' : ''} ${index < activeStage ? 'completed' : ''}`}
            >
              <div className="stage-icon">
                <i className={`fas ${index === 0 ? 'fa-laptop' : 
                              index === 1 ? 'fa-globe' : 
                              index === 2 ? 'fa-handshake' : 
                              index === 3 ? 'fa-paper-plane' : 
                              index === 4 ? 'fa-server' : 'fa-reply'}`}></i>
              </div>
              <div className="stage-title">{stage.name}</div>
              <div className="stage-desc">{stage.duration}ms</div>
            </div>
          ))}
        </div>
        
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="explanation-box">
          <div className="explanation-title">Current Process:</div>
          <div className="explanation-content">{explanation}</div>
        </div>
        
        <div className="visualization-container">
          <div className="network-topography">
            <canvas id="pathCanvas" width="1000" height="600"></canvas>
            
            {/* Network Nodes with Labels */}
            {requestPath.map((point, index) => (
              <div key={index} className="network-node" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
                <div className="node-icon">
                  <i className={`fas ${
                    point.name.includes('Client') ? 'fa-laptop' :
                    point.name.includes('Router') ? 'fa-route' :
                    point.name.includes('Switch') ? 'fa-network-wired' :
                    point.name.includes('DNS') ? 'fa-globe' :
                    point.name.includes('Load Balancer') ? 'fa-balance-scale' :
                    point.name.includes('Firewall') ? 'fa-shield-alt' : 'fa-server'
                  }`}></i>
                </div>
                <div className="node-label">{point.name}</div>
                <div className="node-tooltip">{point.desc}</div>
              </div>
            ))}
            
            {/* Request Packet */}
            <div 
              ref={requestPacketRef}
              className="data-packet request-packet"
              style={{ left: '10%', top: '50%' }}
            >
              <i className="fas fa-paper-plane"></i>
              <div className="packet-content">
                GET /data/2.5/weather?q={city}
              </div>
            </div>
            
            {/* Response Packet */}
            <div 
              ref={responsePacketRef}
              className="data-packet response-packet"
              style={{ display: progress > 0.75 ? 'flex' : 'none', left: '90%', top: '50%' }}
            >
              <i className="fas fa-reply"></i>
              <div className="packet-content">
                HTTP/1.1 200 OK<br/>
                Content-Type: application/json
              </div>
            </div>
          </div>
        </div>
        
        <div className="info-panel">
          <div className="request-info">
            <h3 className="panel-title"><i className="fas fa-paper-plane"></i> Request Details <span className="http-badge">GET</span></h3>
            <div className="info-content">
              <div className="info-line">
                <span className="info-label">API Endpoint:</span>
                <span className="info-value">https://api.openweathermap.org/data/2.5/weather</span>
              </div>
              <div className="info-line">
                <span className="info-label">Method:</span>
                <span className="info-value">GET</span>
              </div>
              <div className="info-line">
                <span className="info-label">Parameters:</span>
                <span className="info-value">q={city}&appid=API_KEY&units=metric</span>
              </div>
              <div className="info-line">
                <span className="info-label">Headers:</span>
                <span className="info-value">Accept: application/json</span>
              </div>
            </div>
          </div>
          
          <div className="response-info">
            <h3 className="panel-title"><i className="fas fa-reply"></i> Response Details</h3>
            <div className="info-content">
              <div className="info-line">
                <span className="info-label">Status:</span>
                <span className="info-value">
                  {animationState === 'completed' ? 'Completed' : 
                  animationState === 'running' ? 'In Progress' : 'Waiting...'}
                </span>
              </div>
              <div className="info-line">
                <span className="info-label">HTTP Status:</span>
                <span className="info-value">{animationState === 'completed' ? '200 OK' : '---'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {weatherData && (
          <div className="weather-display">
            <h3 className="panel-title"><i className="fas fa-cloud-sun"></i> Weather Data</h3>
            <div className="weather-card">
              <div className="weather-location">{weatherData.location}</div>
              <div className="weather-temp">{weatherData.temperature}°C</div>
              <div className="weather-condition">
                <i className={`fas ${
                  weatherData.condition.toLowerCase().includes('clear') ? 'fa-sun' :
                  weatherData.condition.toLowerCase().includes('cloud') ? 'fa-cloud' :
                  weatherData.condition.toLowerCase().includes('rain') ? 'fa-cloud-rain' :
                  weatherData.condition.toLowerCase().includes('thunder') ? 'fa-bolt' : 'fa-question'
                }`}></i>
                <span>{weatherData.condition}</span>
              </div>
              <div className="weather-details">
                <div className="weather-detail">
                  <div>Humidity</div>
                  <div>{weatherData.humidity}%</div>
                </div>
                <div className="weather-detail">
                  <div>Wind</div>
                  <div>{weatherData.wind} km/h</div>
                </div>
                <div className="weather-detail">
                  <div>Feels Like</div>
                  <div>{weatherData.feelsLike}°C</div>
                </div>
                <div className="weather-detail">
                  <div>Pressure</div>
                  <div>{weatherData.pressure} hPa</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiFlowVisualization;