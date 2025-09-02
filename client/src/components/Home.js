import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = ({ onAuthDemoClick }) => {
  const navigate = useNavigate();
  const [completedTopics, setCompletedTopics] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");

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
      category: "security",
      icon: "🔐",
      difficulty: "beginner",
      completed: completedTopics["login-auth"] || false,
    },
    {
      id: "api-calls",
      title: "API Calls",
      description: "RESTful requests, endpoints, status codes and HTTP methods",
      category: "fundamentals",
      icon: "🌐",
      difficulty: "beginner",
      completed: false,
    },
    {
      id: "database-ops",
      title: "Database Operations",
      description: "CRUD operations, relationships, queries and optimization",
      category: "data",
      icon: "🗄️",
      difficulty: "intermediate",
      completed: false,
    },
    {
      id: "payment-processing",
      title: "Payment Processing",
      description: "Stripe/PayPal integration flows and transaction handling",
      category: "ecommerce",
      icon: "💳",
      difficulty: "advanced",
      completed: false,
    },
    {
      id: "file-uploads",
      title: "File Uploads",
      description: "File storage, processing, and CDN distribution",
      category: "storage",
      icon: "📤",
      difficulty: "intermediate",
      completed: false,
    },
    {
      id: "caching",
      title: "Caching Strategies",
      description: "Redis, CDN, and browser caching mechanisms",
      category: "performance",
      icon: "⚡",
      difficulty: "advanced",
      completed: false,
    },
    {
      id: "middleware",
      title: "Middleware",
      description: "Request processing pipeline and security checks",
      category: "fundamentals",
      icon: "🛡️",
      difficulty: "intermediate",
      completed: false,
    },
  ];

  const categories = [
    { id: "all", name: "All Topics" },
    { id: "fundamentals", name: "Fundamentals" },
    { id: "security", name: "Security" },
    { id: "data", name: "Data Management" },
    { id: "ecommerce", name: "E-Commerce" },
    { id: "performance", name: "Performance" },
    { id: "storage", name: "Storage" },
  ];

  const learningPaths = [
    {
      title: "Web Development Fundamentals",
      topics: ["api-calls", "login-auth", "database-ops"],
      description: "Start with the core concepts of backend development",
    },
    {
      title: "Full-Stack Mastery",
      topics: ["api-calls", "database-ops", "file-uploads", "caching"],
      description: "Deep dive into comprehensive backend systems",
    },
    {
      title: "E-Commerce Specialist",
      topics: ["payment-processing", "database-ops", "caching"],
      description: "Learn backend systems for online stores",
    },
  ];

  const handleTopicClick = (topicId) => {
    if (topicId === "login-auth") {
      // Use the passed function for navigation
      if (onAuthDemoClick) {
        onAuthDemoClick();
      } else {
        // Fallback if prop is not provided
        navigate("/auth-demo");
      }
    }else if (topicId === 'middleware') {
    navigate('/middleware-demo');
  } 
     else {
      // For other topics, show a preview or coming soon
      alert(`The ${topicId} visualization is coming soon!`);
    }
  };

  const filteredTopics =
    activeCategory === "all"
      ? topics
      : topics.filter((topic) => topic.category === activeCategory);

  const completedCount = topics.filter((topic) => topic.completed).length;
  const totalCount = topics.length;

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>See Backend Processes in Action</h1>
          <p>
            Visualize what happens behind the scenes when you interact with web
            applications. Understand backend concepts through interactive
            animations.
          </p>
          <div className="hero-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <span>
              {completedCount} of {totalCount} topics completed
            </span>
          </div>
          <button
            className="cta-button"
            onClick={() =>
              document
                .getElementById("topics-section")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore Topics
          </button>
        </div>
        <div className="hero-visualization">
          <div className="floating-server">🖥️</div>
          <div className="floating-database">🗄️</div>
          <div className="floating-api">🌐</div>
          <div className="connecting-line"></div>
        </div>
      </section>

      {/* Topics Gallery */}
      <section id="topics-section" className="topics-section">
        <div className="section-header">
          <h2>Backend Topics</h2>
          <p>Select a topic to visualize the backend processes</p>
        </div>

        {/* Category Filters */}
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`filter-btn ${
                activeCategory === category.id ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Topics Grid */}
        <div className="topics-grid">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={`topic-card ${topic.completed ? "completed" : ""}`}
              onClick={() => handleTopicClick(topic.id)}
            >
              <div className="topic-icon">{topic.icon}</div>
              <h3>{topic.title}</h3>
              <p>{topic.description}</p>
              <div className="topic-meta">
                <span className={`difficulty difficulty-${topic.difficulty}`}>
                  {topic.difficulty}
                </span>
                {topic.completed && (
                  <span className="completed-check">✅ Completed</span>
                )}
              </div>
              <div className="hover-effect"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Paths */}
      <section id="learning-paths" className="learning-paths">
        <div className="section-header">
          <h2>Learning Paths</h2>
          <p>Structured learning journeys for different goals</p>
        </div>
        <div className="paths-container">
          {learningPaths.map((path, index) => (
            <div key={index} className="path-card">
              <h3>{path.title}</h3>
              <p>{path.description}</p>
              <div className="path-topics">
                {path.topics.map((topicId) => {
                  const topic = topics.find((t) => t.id === topicId);
                  return topic ? (
                    <span key={topicId} className="path-topic-tag">
                      {topic.icon} {topic.title}
                    </span>
                  ) : null;
                })}
              </div>
              <button className="path-button">Start Path</button>
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
          <div className="feature">
            <div className="feature-icon">🌙</div>
            <h3>Dark Theme</h3>
            <p>
              Comfortable viewing experience with our developer-friendly dark
              theme
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
