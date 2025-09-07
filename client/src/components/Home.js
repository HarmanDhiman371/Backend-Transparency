import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = ({ onAuthDemoClick }) => {
  const navigate = useNavigate();
  const [completedTopics, setCompletedTopics] = useState({});

  useEffect(() => {
    // Load completed topics from localStorage
    const savedProgress = localStorage.getItem("backendVisualizerProgress");
    if (savedProgress) {
      setCompletedTopics(JSON.parse(savedProgress));
    }
  }, []);

  const topics = [
    {
      id: "login-auth",
      title: "Authentication",
      description:
        "Login & Signup processes with password hashing and session management",
      icon: "🔐",
      completed: completedTopics["login-auth"] || false,
    },
    {
      id: "api-calls",
      title: "API Calls",
      description: "RESTful requests, endpoints, status codes and HTTP methods",
      icon: "🌐",
      completed: false,
    },
    {
      id: "event-loop",
      title: "Event Loop",
      description: "Node.js event loop, callbacks, promises and async/await",
      icon: "🔄",
      completed: false,
    },
    {
      id: "load-balancer",
      title: "Load Balancer",
      description: "Distributing traffic across multiple servers efficiently",
      icon: "⚖️",
      completed: false,
    },
    {
      id: "middleware",
      title: "Middleware",
      description: "Request processing pipeline and security checks",
      icon: "🛡️",
      completed: false,
    }
  ];

  const handleTopicClick = (topicId) => {
    if (topicId === "login-auth") {
      if (onAuthDemoClick) {
        onAuthDemoClick();
      } else {
        navigate("/auth-demo");
      }
    } else if (topicId === 'middleware') {
      navigate('/middleware-demo');
    } else if (topicId === 'event-loop') {
      navigate('/eventloop');
    } else if (topicId === 'api-calls') {
      navigate('/api-demo');
    } else if (topicId === 'load-balancer') {
      navigate('/loadbalancer');
    } else {
      alert(`The ${topicId} visualization is coming soon!`);
    }
  };

  const completedCount = topics.filter((topic) => topic.completed).length;
  const totalCount = topics.length;

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Visualize Backend Magic</h1>
          <p>
            Watch backend processes come to life through interactive animations. 
            Understand complex systems by seeing them in action.
          </p>
          <button
            className="cta-button"
            onClick={() =>
              document
                .getElementById("topics-section")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Start Exploring
          </button>
        </div>
        <div className="hero-image">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/8099/8099229.png" 
            alt="Server infrastructure visualization" 
          />
        </div>
      </section>

      {/* Topics Gallery */}
      <section id="topics-section" className="topics-section">
        <div className="section-header">
          <h2>Backend Topics</h2>
          <p>Select a topic to visualize the backend processes</p>
        </div>

        {/* Topics Grid */}
        <div className="topics-grid">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`topic-card ${topic.completed ? "completed" : ""}`}
              onClick={() => handleTopicClick(topic.id)}
            >
              <div className="topic-icon">{topic.icon}</div>
              <h3>{topic.title}</h3>
              <p>{topic.description}</p>
              <div className="hover-effect"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="about-section" className="features-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Experience backend concepts through interactive visualization</p>
        </div>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🎬</div>
            <h3>Cinematic Visualizations</h3>
            <p>
              Watch backend processes unfold like a movie with step-by-step
              animations
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">💡</div>
            <h3>Educational Insights</h3>
            <p>Learn with interactive tips and explanations at each step</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚙️</div>
            <h3>Interactive Controls</h3>
            <p>Pause, rewind, and adjust speed to learn at your own pace</p>
          </div>
         
        </div>
      </section>
    </div>
  );
};

export default Home;