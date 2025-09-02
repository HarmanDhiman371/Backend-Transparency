import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AuthDemo from './components/AuthDemo';
import MiddlewareDemo from './components/MiddlewareDemo';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth-demo" element={<AuthDemo />} />
          <Route path="/middleware-demo" element={<MiddlewareDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;