// AuthenticationVisualization.js
import React, { useState, useEffect, useRef } from 'react';
import '../styles/AuthenticationVisualization.css';

const AuthenticationVisualization = ({ 
  isProcessing, 
  userData, 
  animationSpeed = 5,
  isPaused = false,
  onPauseToggle,
  onComplete 
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [scenes, setScenes] = useState([]);
  const [dialogue, setDialogue] = useState('');
  const [showOverview, setShowOverview] = useState(false);
  const [currentTips, setCurrentTips] = useState([]);
  const timeoutsRef = useRef([]);

  // Clear all timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    if (isProcessing && userData && !isPaused) {
      startVisualization();
    } else if (isPaused) {
      clearAllTimeouts();
    }

    return () => clearAllTimeouts();
  }, [isProcessing, userData, animationSpeed, isPaused]);

  const startVisualization = () => {
    clearAllTimeouts();
    
    const isLogin = !userData.isSignup;
    const username = userData.username || userData.email.split('@')[0];
    
    const loginScenes = [
      {
        title: "Request Received",
        message: `Hello ${username}! Your login request has been received.`,
        visual: "request",
        duration: 2000,
        tips: [
          "🌐 Your data travels through secure HTTPS connection",
          "📨 The server processes your request instantly"
        ]
      },
      {
        title: "Validating Input",
        message: "Checking if your email format is correct and password is provided...",
        visual: "validation",
        duration: 2500,
        tips: [
          "✅ Validation prevents bad data from entering our system",
          "🛡️ We check for proper email format and prevent SQL injection"
        ]
      },
      {
        title: "Database Search",
        message: "Searching for your account in our secure database...",
        visual: "database-search",
        duration: 3000,
        tips: [
          "⚡ We use indexed queries for fast search",
          "🔑 Your email is the key to finding your account"
        ]
      },
      {
        title: "User Found",
        message: "Great! I found your account. Now verifying your password...",
        visual: "user-found",
        duration: 2500,
        tips: [
          "🔒 We never store passwords in plain text!",
          "⚖️ Your password is compared against a secure hash"
        ]
      },
      {
        title: "Password Verification",
        message: "Comparing your password with the securely stored hash...",
        visual: "password-check",
        duration: 3500,
        tips: [
          "🧂 bcrypt automatically handles salting for security",
          "🐢 This process is intentionally slow to prevent brute force attacks"
        ]
      },
      {
        title: "Authentication Successful",
        message: "Password matched! You're now authenticated. Welcome back!",
        visual: "success",
        duration: 3000,
        tips: [
          "🎉 Success! You've proven your identity",
          "🔐 Now we'll generate a secure token for your session"
        ]
      },
      {
        title: "Sending Response",
        message: "Preparing your user data and authentication token...",
        visual: "response",
        duration: 2500,
        tips: [
          "📋 The token allows you to stay logged in securely",
          "🚫 We never send your actual password back to you"
        ]
      }
    ];

    const signupScenes = [
      {
        title: "Request Received",
        message: `Welcome ${username}! Your signup request has been received.`,
        visual: "request",
        duration: 2000,
        tips: [
          "👋 Welcome to our platform!",
          "🌐 Your data is transmitted over secure channels"
        ]
      },
      {
        title: "Validating Input",
        message: "Checking if all fields are valid and meet security requirements...",
        visual: "validation",
        duration: 3000,
        tips: [
          "💪 We require strong passwords to keep your account safe",
          "🛡️ All validations happen server-side for security"
        ]
      },
      {
        title: "Checking Availability",
        message: "Verifying if your email and username are available...",
        visual: "availability-check",
        duration: 3500,
        tips: [
          "🔍 We need to ensure your username is unique",
          "📧 Your email must not be already registered"
        ]
      },
      {
        title: "Securing Password",
        message: "Hashing your password with bcrypt for maximum security...",
        visual: "hashing",
        duration: 4000,
        tips: [
          "🔐 Hashing is one-way - we can't see your password!",
          "⚠️ Without hashing, your password could be stolen"
        ]
      },
      {
        title: "Creating Account",
        message: "Storing your information securely in our database...",
        visual: "create-account",
        duration: 3000,
        tips: [
          "💾 Your data is stored in encrypted format",
          "📊 We only store what's necessary for your account"
        ]
      },
      {
        title: "Account Created",
        message: "Your account has been successfully created! Welcome!",
        visual: "success",
        duration: 3000,
        tips: [
          "🎊 Congratulations! Your account is now active",
          "🔓 You can now enjoy all our services securely"
        ]
      },
      {
        title: "Sending Welcome",
        message: "Preparing your account data and welcome message...",
        visual: "response",
        duration: 2500,
        tips: [
          "🎁 We're generating your first authentication token",
          "📬 Check your email for a welcome message!"
        ]
      }
    ];

    const sceneSequence = isLogin ? loginScenes : signupScenes;
    setScenes(sceneSequence);
    setCurrentScene(0);
    setCurrentTips([]);
    setShowOverview(false);

    playScenes(sceneSequence, 0);
  };

  const playScenes = (scenes, startIndex) => {
    let timeAccumulator = 0;
    
    for (let i = startIndex; i < scenes.length; i++) {
      const scene = scenes[i];
      const adjustedDuration = scene.duration * (10 / animationSpeed);
      
      const timeoutId = setTimeout(() => {
        if (isPaused) return;
        
        setCurrentScene(i);
        setDialogue(scene.message);
        setCurrentTips(scene.tips || []);
        
        if (i === scenes.length - 1) {
          const finalTimeoutId = setTimeout(() => {
            if (isPaused) return;
            setShowOverview(true);
            onComplete && onComplete();
          }, adjustedDuration);
          timeoutsRef.current.push(finalTimeoutId);
        }
      }, timeAccumulator);
      
      timeoutsRef.current.push(timeoutId);
      timeAccumulator += adjustedDuration;
    }
  };

  const renderVisualization = () => {
    if (!scenes.length || currentScene === undefined) return null;
    
    const current = scenes[currentScene];
    const isLogin = !userData.isSignup;
    
    switch (current.visual) {
      case "request":
        return (
          <div className="auth-scene request-scene">
            <div className="server">
              <div className="server-icon">🖥️</div>
              <div className="server-glow"></div>
            </div>
            <div className="data-packet incoming">
              <div className="packet-icon">📨</div>
              <div className="packet-content">
                <div>{isLogin ? "Login Request" : "Signup Request"}</div>
                <div className="packet-detail">{userData.email}</div>
              </div>
            </div>
          </div>
        );
      
      case "validation":
        return (
          <div className="auth-scene validation-scene">
            <div className="server">
              <div className="server-icon">🖥️</div>
              <div className="server-glow active"></div>
            </div>
            <div className="validation-check">
              <div className="check-icon">✅</div>
              <div className="check-text">Validating Input</div>
            </div>
            <div className="validation-details">
              <div className="validation-item">
                <span className="validation-status valid">✓</span>
                Email Format
              </div>
              <div className="validation-item">
                <span className="validation-status valid">✓</span>
                Password Present
              </div>
              {!isLogin && (
                <>
                  <div className="validation-item">
                    <span className="validation-status valid">✓</span>
                    Password Match
                  </div>
                  <div className="validation-item">
                    <span className="validation-status valid">✓</span>
                    Password Strength
                  </div>
                </>
              )}
            </div>
          </div>
        );
      
      case "database-search":
        return (
          <div className="auth-scene database-scene">
            <div className="server">
              <div className="server-icon">🖥️</div>
              <div className="server-glow active"></div>
            </div>
            <div className="database">
              <div className="database-icon">🗄️</div>
              <div className="database-glow"></div>
            </div>
            <div className="search-beam"></div>
            <div className="search-text">Searching for user...</div>
          </div>
        );
      
      case "user-found":
        return (
          <div className="auth-scene user-found-scene">
            <div className="database">
              <div className="database-icon">🗄️</div>
              <div className="database-glow active"></div>
            </div>
            <div className="user-record">
              <div className="record-icon">👤</div>
              <div className="record-details">
                <div className="record-name">{userData.username || userData.email.split('@')[0]}</div>
                <div className="record-email">{userData.email}</div>
                <div className="record-status">User Found ✓</div>
              </div>
            </div>
            <div className="success-check">✅</div>
          </div>
        );
      
      case "password-check":
        return (
          <div className="auth-scene password-check-scene">
            <div className="server">
              <div className="server-icon">🖥️</div>
              <div className="server-glow active"></div>
            </div>
            <div className="password-comparison">
              <div className="input-password">
                <div className="password-label">Your Password</div>
                <div className="password-value">••••••••</div>
              </div>
              <div className="comparison-arrow">⇄</div>
              <div className="stored-hash">
                <div className="hash-label">Stored Hash</div>
                <div className="hash-value">$2a$10$N9qo8uLO...</div>
              </div>
            </div>
            <div className="verification-status">
              <div className="verification-progress"></div>
              <div className="verification-text">Verifying...</div>
            </div>
          </div>
        );
      
      case "success":
        return (
          <div className="auth-scene success-scene">
            <div className="success-check-large">✅</div>
            <div className="success-glow"></div>
            <div className="success-message">
              {isLogin ? "Login Successful!" : "Account Created!"}
            </div>
            <div className="success-details">
              <div className="user-welcome">
                Welcome, {userData.username || userData.email.split('@')[0]}!
              </div>
            </div>
          </div>
        );
      
      case "response":
        return (
          <div className="auth-scene response-scene">
            <div className="server">
              <div className="server-icon">🖥️</div>
              <div className="server-glow active"></div>
            </div>
            <div className="response-packet">
              <div className="packet-icon">📨</div>
              <div className="packet-content">
                <div>API Response</div>
                <div className="packet-detail">200 OK</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (showOverview) {
    return (
      <div className="auth-visualization overview-mode">
        <h2>Authentication Process Complete</h2>
        <div className="overview-container">
          <div className="process-flow">
            {scenes.map((scene, index) => (
              <div key={index} className="flow-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <div className="step-title">{scene.title}</div>
                  <div className="step-description">{scene.message}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="overview-message">
            <h3>Process Completed Successfully!</h3>
            <p>Your {userData.isSignup ? 'account has been created' : 'login was successful'}.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-visualization">
      <h2>Authentication Process</h2>
      
      <div className="visualization-area">
        {scenes.length > 0 && (
          <>
            <div className="scene-header">
              <h3>{scenes[currentScene]?.title}</h3>
              <div className="scene-controls">
                <button 
                  className={`pause-btn ${isPaused ? 'paused' : ''}`}
                  onClick={onPauseToggle}
                  disabled={!isProcessing}
                >
                  {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
              </div>
              <div className="scene-progress">
                <div 
                  className="progress-bar" 
                  style={{width: `${((currentScene + 1) / scenes.length) * 100}%`}}
                ></div>
                <div className="progress-text">
                  Step {currentScene + 1} of {scenes.length}
                </div>
              </div>
            </div>
            
            <div className="dialogue-box">
              <div className="dialogue-icon">💬</div>
              <div className="dialogue-text">{dialogue}</div>
            </div>
            
            <div className="visualization-content">
              <div className={`animation-container ${isPaused ? 'paused' : ''}`}>
                {renderVisualization()}
              </div>
              
              <div className="tips-sidebar">
                <div className="tips-header">
                  <span>💡 Did You Know?</span>
                </div>
                <div className="tips-list">
                  {currentTips.map((tip, index) => (
                    <div key={index} className="tip-item">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthenticationVisualization;