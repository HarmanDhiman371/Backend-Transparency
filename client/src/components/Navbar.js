import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthDemoClick = () => {
    navigate('/auth-demo');
    setIsMobileMenuOpen(false);
  };

  const handleDSAClick = () => {
    navigate('/dsa');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo" onClick={handleLogoClick}>
          <span className="logo-icon">🔍</span>
          <span className="logo-text">BackendVisualizer</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          <div className="nav-item">
            <span 
              className="nav-link" 
              onClick={() => scrollToSection('topics-section')}
            >
              Visuals
            </span>
          </div>

          <div className="nav-item">
            <span 
              className="nav-link" 
              onClick={() => scrollToSection('learning-paths')}
            >
              Learning Paths
            </span>
          </div>

          <div className="nav-item">
            <span 
              className="nav-link" 
              onClick={handleDSAClick}
            >
              DSA
            </span>
          </div>

          <div className="nav-item">
            <span 
              className="nav-link" 
              onClick={() => scrollToSection('about-section')}
            >
              About Us
            </span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-nav-item">
            <span 
              className="mobile-nav-link"
              onClick={() => scrollToSection('topics-section')}
            >
              Visuals
            </span>
          </div>

          <div className="mobile-nav-item">
            <span 
              className="mobile-nav-link"
              onClick={() => scrollToSection('learning-paths')}
            >
              Learning Paths
            </span>
          </div>

          <div className="mobile-nav-item">
            <span 
              className="mobile-nav-link"
              onClick={handleDSAClick}
            >
              DSA
            </span>
          </div>

          <div className="mobile-nav-item">
            <span 
              className="mobile-nav-link"
              onClick={() => scrollToSection('about-section')}
            >
              About Us
            </span>
          </div>

          <div className="mobile-nav-item">
            <span 
              className="mobile-nav-link auth-demo-btn"
              onClick={handleAuthDemoClick}
            >
              Try Demo <i className="fas fa-arrow-right"></i>
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
