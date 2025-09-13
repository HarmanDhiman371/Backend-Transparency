// App.js (updated)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AuthDemo from './components/AuthDemo';
import MiddlewareDemo from './components/MiddlewareDemo';
import EventLoopDemo from './components/EventLoopDemo';
import AuthForm from './components/AuthForm';
// Updated import
import LoadBalancer from './components/LoadBalancer';
import './styles/LoadBalancer.css';
import './styles/App.css';
import Footer from './components/Footer';
// import ApiFlowVisualization from './components/Api';
import DsaPage from './components/DsaPage';
import SortingPage from './components/SortingPage';
import SearchingPage from './components/SearchingPage';
function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eventloop" element={<EventLoopDemo />} />
           <Route path="/loadbalancer" element={<LoadBalancer />} />
           <Route path= "/auth-demo" element= {<AuthForm/>}/>
           
            <Route path= "/dsa" element= {<DsaPage/>}/>
            <Route path= "/sorting" element= {<SortingPage/>}/>
            <Route path= "/searching" element= {<SearchingPage/>}/>
          {/* <Route path="/auth-demo" element={<AuthDemo />} /> */}
          <Route path="/middleware-demo" element={<MiddlewareDemo />} />
        </Routes>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;