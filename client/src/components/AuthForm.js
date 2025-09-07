import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
const AuthVisualizer = () => {
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
    <div className="app auth-visualizer-app">
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
            <div className={`form-toggle ${currentView === 'signup' ? 'signup-mode' : ''}`}>
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
              <LoginForm onSubmit={handleFormSubmit} disabled={isProcessing} />
            ) : (
              <SignupForm onSubmit={handleFormSubmit} disabled={isProcessing} />
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
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onSubmit, disabled }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, false);
  };

  return (
    <div className="login-form">
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

        <button type="submit" disabled={disabled}>
          <i className="fas fa-sign-in-alt"></i>
          Login
        </button>
      </form>
    </div>
  );
};

// Signup Form Component
const SignupForm = ({ onSubmit, disabled }) => {
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

// Process Visualization Component
const ProcessVisualization = forwardRef(({ 
  isProcessing, 
  userData, 
  animationSpeed, 
  isPaused, 
  onPauseToggle, 
  onComplete 
}, ref) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [scenes, setScenes] = useState([]);
  const [dialogue, setDialogue] = useState('');
  const [showOverview, setShowOverview] = useState(false);
  const [currentTips, setCurrentTips] = useState([]);
  const [timeouts, setTimeouts] = useState([]);

  useImperativeHandle(ref, () => ({
    replayAnimation: () => {
      if (userData) {
        timeouts.forEach(timeout => clearTimeout(timeout));
        setTimeouts([]);
        
        setCurrentScene(0);
        setShowOverview(false);
        startVisualization();
      }
    },
    pauseAnimation: () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    },
    resumeAnimation: () => {
      if (userData && currentScene < scenes.length) {
        continueVisualizationFrom(currentScene);
      }
    }
  }));

  useEffect(() => {
    if (isProcessing && userData && !isPaused) {
      startVisualization();
    } else if (isPaused) {
      timeouts.forEach(timeout => clearTimeout(timeout));
    }
  }, [isProcessing, userData, animationSpeed, isPaused]);

  const startVisualization = () => {
    const isLogin = !userData.isSignup;
    const username = userData.username || userData.email.split('@')[0];
    
    const loginScenes = [
      {
        title: "Request Received",
        message: `Hello ${username}! Your login request has been received by our server.`,
        visual: "request",
        duration: 2500,
        tips: [
          "🌐 Your data travels through secure HTTPS connection",
          "📨 The server processes your request instantly"
        ]
      },
      {
        title: "Validating Input",
        message: "Checking if your email format is correct and all required fields are filled...",
        visual: "validation",
        duration: 3000,
        tips: [
          "✅ Validation prevents bad data from entering our system",
          "🛡️ We check for proper email format and prevent SQL injection"
        ]
      },
      {
        title: "Database Search",
        message: "Searching for your account in our secure database...",
        visual: "database-search",
        duration: 4000,
        tips: [
          "⚡ We use indexed queries for fast search",
          "🔑 Your email is the key to finding your account"
        ]
      },
      {
        title: "User Found",
        message: "Great! I found your account. Now verifying your password...",
        visual: "user-found",
        duration: 3000,
        tips: [
          "🔒 We never store passwords in plain text!",
          "⚖️ Your password is compared against a secure hash"
        ]
      },
      {
        title: "Password Comparison",
        message: "Comparing your password with the securely stored hash using bcrypt...",
        visual: "password-check",
        duration: 5000,
        tips: [
          "🧂 bcrypt automatically handles salting for security",
          "🐢 This process is intentionally slow to prevent brute force attacks"
        ]
      },
      {
        title: "Authentication Successful",
        message: "Password matched! You're now authenticated. Welcome back!",
        visual: "success",
        duration: 3500,
        tips: [
          "🎉 Success! You've proven your identity",
          "🔐 Now we'll generate a secure token for your session"
        ]
      },
      {
        title: "Sending Response",
        message: "Preparing your user data and authentication token...",
        visual: "response",
        duration: 3000,
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
        duration: 2500,
        tips: [
          "👋 Welcome to our platform!",
          "🌐 Your data is transmitted over secure channels"
        ]
      },
      {
        title: "Validating Input",
        message: "Checking if all fields are valid, passwords match, and meet security requirements...",
        visual: "validation",
        duration: 3500,
        tips: [
          "💪 We require strong passwords to keep your account safe",
          "🛡️ All validations happen server-side for security"
        ]
      },
      {
        title: "Checking Availability",
        message: "Verifying if your email and username are available...",
        visual: "availability-check",
        duration: 4000,
        tips: [
          "🔍 We need to ensure your username is unique",
          "📧 Your email must not be already registered"
        ]
      },
      {
        title: "Securing Password",
        message: "Hashing your password with bcrypt (12 rounds) for maximum security...",
        visual: "hashing",
        duration: 6000,
        tips: [
          "🔐 Hashing is one-way - we can't see your password!",
          "⚠️ Without hashing, your password could be stolen if our database is compromised"
        ]
      },
      {
        title: "Creating Account",
        message: "Storing your information securely in our database...",
        visual: "create-account",
        duration: 4000,
        tips: [
          "💾 Your data is stored in encrypted format",
          "📊 We only store what's necessary for your account"
        ]
      },
      {
        title: "Account Created",
        message: "Your account has been successfully created! Welcome to our community!",
        visual: "success",
        duration: 3500,
        tips: [
          "🎊 Congratulations! Your account is now active",
          "🔓 You can now enjoy all our services securely"
        ]
      },
      {
        title: "Sending Welcome",
        message: "Preparing your account data and welcome message...",
        visual: "response",
        duration: 3000,
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
    const newTimeouts = [];
    
    for (let i = startIndex; i < scenes.length; i++) {
      const scene = scenes[i];
      const adjustedDuration = scene.duration * (10 / animationSpeed);
      
      newTimeouts.push(setTimeout(() => {
        if (isPaused) return;
        
        setCurrentScene(i);
        setDialogue(scene.message);
        setCurrentTips(scene.tips || []);
        
        if (i === scenes.length - 1) {
          newTimeouts.push(setTimeout(() => {
            if (isPaused) return;
            setShowOverview(true);
            if (onComplete) onComplete();
          }, adjustedDuration));
        }
      }, timeAccumulator));
      
      timeAccumulator += adjustedDuration;
    }
    
    setTimeouts(newTimeouts);
  };

  const continueVisualizationFrom = (sceneIndex) => {
    const remainingScenes = scenes.slice(sceneIndex);
    playScenes(remainingScenes, sceneIndex);
  };

  const renderVisualization = () => {
    if (!scenes.length || currentScene === undefined) return null;
    
    const current = scenes[currentScene];
    const isLogin = !userData.isSignup;
    
    switch (current.visual) {
      case "request":
        return (
          <div className="scene request-scene">
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
          <div className="scene validation-scene">
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
          <div className="scene database-scene">
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
            <div className="search-results">
              <div className="searching-animation">
                <div className="search-dot"></div>
                <div className="search-dot"></div>
                <div className="search-dot"></div>
              </div>
            </div>
          </div>
        );
      
      case "availability-check":
        return (
          <div className="scene availability-scene">
            <div className="server">
              <div className="server-icon">🖥️</div>
              <div className="server-glow active"></div>
            </div>
            <div className="database">
              <div className="database-icon">🗄️</div>
              <div className="database-glow"></div>
            </div>
            <div className="checking-animation">
              <div className="check-icon">🔍</div>
              <div className="checking-text">Checking Availability</div>
            </div>
            <div className="availability-results">
              <div className="availability-item">
                <span className="availability-status checking">⏳</span>
                Email Availability
              </div>
              <div className="availability-item">
                <span className="availability-status checking">⏳</span>
                Username Availability
              </div>
            </div>
          </div>
        );
      
      case "user-found":
        return (
          <div className="scene user-found-scene">
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
          <div className="scene password-check-scene">
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
                <div className="hash-value">$2a$10$N9qo8uLOickgx2ZMRZoMye...</div>
              </div>
            </div>
            <div className="verification-status">
              <div className="verification-progress"></div>
              <div className="verification-text">Verifying...</div>
            </div>
          </div>
        );
      
      case "hashing":
        return (
          <div className="scene hashing-scene">
            <div className="server">
              <div className="server-icon">🖥️</div>
              <div className="server-glow active"></div>
            </div>
            <div className="hashing-process">
              <div className="password-input">
                <div className="password-text">Your Password</div>
                <div className="password-display">••••••••</div>
              </div>
              <div className="hashing-animation">
                <div className="hash-particle"></div>
                <div className="hash-particle"></div>
                <div className="hash-particle"></div>
                <div className="hash-particle"></div>
                <div className="hash-machine">⚙️</div>
              </div>
              <div className="hash-output">
                <div className="hash-label">Secure Hash</div>
                <div className="hash-result">$2a$10$N9qo8uLOickgx2ZMRZoMye...</div>
              </div>
            </div>
            <div className="hashing-explanation">
              <div className="explanation-text">
                Your password is being hashed with bcrypt (12 rounds)
              </div>
            </div>
          </div>
        );
      
      case "create-account":
        return (
          <div className="scene create-account-scene">
            <div className="server">
              <div className="server-icon">🖥️</div>
              <div className="server-glow active"></div>
            </div>
            <div className="database">
              <div className="database-icon">🗄️</div>
              <div className="database-glow"></div>
            </div>
            <div className="data-flow"></div>
            <div className="creation-animation">
              <div className="creating-text">Creating Account</div>
              <div className="progress-indicator">
                <div className="progress-bar-create"></div>
              </div>
            </div>
          </div>
        );
      
      case "success":
        return (
          <div className="scene success-scene">
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
          <div className="scene response-scene">
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
            <div className="response-data">
              <div className="data-preview">
                <pre>
{`{
  "status": "success",
  "user": {
    "name": "${userData.username || userData.email.split('@')[0]}",
    "email": "${userData.email}"
  }
}`}
                </pre>
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
      <div className="process-visualization overview-mode">
        <h2>Process Overview</h2>
        <div className="overview-container">
          <div className="process-flow">
            {scenes.map((scene, index) => (
              <React.Fragment key={index}>
                <div className="flow-step">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <div className="step-title">{scene.title}</div>
                    <div className="step-description">{scene.message}</div>
                  </div>
                </div>
                {index < scenes.length - 1 && (
                  <div className="step-connector">
                    <div className="connector-line"></div>
                    <div className="connector-arrow">↓</div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="overview-message">
            <h3>Process Completed Successfully!</h3>
            <p>Your {userData.isSignup ? 'account has been created' : 'login was successful'}.</p>
            
            <div className="api-response">
              <div className="response-header">API Response</div>
              <pre className="response-body">
{`{
  "status": "success",
  "message": "User ${userData.isSignup ? 'created' : 'authenticated'}",
  "data": {
    "user": {
      "id": "usr_${Math.random().toString(36).substr(2, 9)}",
      "name": "${userData.username || userData.email.split('@')[0]}",
      "email": "${userData.email}"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="process-visualization">
      <h2>Backend Process Visualization</h2>
      
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
                  <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
                  {isPaused ? 'Resume' : 'Pause'}
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
            
            <div className="visualization-content-container">
              <div className={`visualization-content ${isPaused ? 'paused' : ''}`}>
                {renderVisualization()}
              </div>
              
              <div className="tips-sidebar">
                <div className="tips-header">
                  <i className="fas fa-lightbulb"></i>
                  Did You Know?
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
});

ProcessVisualization.displayName = 'ProcessVisualization';

export default AuthVisualizer;