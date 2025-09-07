// App.js (updated)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AuthDemo from './components/AuthDemo';
import MiddlewareDemo from './components/MiddlewareDemo';
import EventLoopDemo from './components/EventLoopDemo';
import AuthenticationDemo from './components/AuthenticationDemo'; 
// Updated import
import LoadBalancer from './components/LoadBalancer';
import './styles/LoadBalancer.css';
import './styles/App.css';
import Footer from './components/Footer';
function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eventloop" element={<EventLoopDemo />} />
           <Route path="/loadbalancer" element={<LoadBalancer />} />
          
          <Route path="/authentication" element={<AuthenticationDemo />} /> {/* Updated route */}
          <Route path="/auth-demo" element={<AuthDemo />} />
          <Route path="/middleware-demo" element={<MiddlewareDemo />} />
        </Routes>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;