import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoadBalancer.css';

const INITIAL_SERVERS = [
  { id: 'server-1', queue: [] },
  { id: 'server-2', queue: [] },
  { id: 'server-3', queue: [] },
  { id: 'server-4', queue: [] }
];

const LoadBalancer = () => {
  const navigate = useNavigate();
  
  // states & refs
  const [servers, setServers] = useState(INITIAL_SERVERS);
  const [algorithm, setAlgorithm] = useState('roundRobin');
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState({ total:0, distributed:0, completed:0 });
  const [speed, setSpeed] = useState(1);
  const [activeLine, setActiveLine] = useState(null);
  const [paths, setPaths] = useState([]);
  const [svgSize, setSvgSize] = useState({w:0,h:0});
  const [tooltip, setTooltip] = useState(null);
  const [autoRequestCount, setAutoRequestCount] = useState(0);

  const containerRef = useRef(null);
  const clientRef = useRef(null);
  const internetRef = useRef(null);
  const lbRef = useRef(null);
  const serverRowRefs = useRef([]);
  const serversRef = useRef(servers);
  const requestIdRef = useRef(0);
  const lastServerRef = useRef(-1);
  const movingDotsRef = useRef([]);
  const autoIntervalRef = useRef(null);

  useEffect(() => {
    serversRef.current = servers;
  }, [servers]);

  // compute curved Bezier path between two center points
  const buildCurvePath = useCallback((p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const mx = p1.x + dx * 0.44;
    const my = p1.y + dy * 0.44;
    const cx1 = mx;
    const cy1 = p1.y;
    const cx2 = mx;
    const cy2 = p2.y;
    return `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
  }, []);

  // compute paths based on element centers (container relative)
  const computePaths = useCallback(() => {
    try {
      const cont = containerRef.current;
      const lb = lbRef.current;
      if(!cont || !lb) return;
      const crect = cont.getBoundingClientRect();
      const lbc = lb.getBoundingClientRect();
      const p1 = { x: lbc.left + lbc.width/2 - crect.left, y: lbc.top + lbc.height/2 - crect.top };
      const newPaths = servers.map((s, idx) => {
        const rowEl = serverRowRefs.current[idx];
        if(!rowEl) return null;
        const serverBox = rowEl.querySelector('.load-balancer-server');
        const srect = serverBox.getBoundingClientRect();
        const p2 = { x: srect.left + srect.width/2 - crect.left, y: srect.top + srect.height/2 - crect.top };
        const d = buildCurvePath(p1, p2);
        return { d, idx, p1, p2 };
      }).filter(Boolean);
      setPaths(newPaths);
      setSvgSize({ w: crect.width, h: crect.height });
    } catch (err) {
      console.error("Error computing paths:", err);
    }
  }, [servers.length, buildCurvePath]);

  // initial compute + observe resize changes
  useEffect(() => {
    computePaths();
    
    const resizeHandler = () => computePaths();
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [computePaths]);

  // auto mode
  useEffect(() => {
    if(!isActive) {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
      return;
    }
    
    const interval = Math.max(250, 1100 / speed);
    autoIntervalRef.current = setInterval(() => {
      if (autoRequestCount < 20) {
        createRequest();
        setAutoRequestCount(prev => prev + 1);
      } else {
        setIsActive(false);
      }
    }, interval);
    
    return () => {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
    };
  }, [isActive, speed, autoRequestCount]);

  // helper: center of an element relative to container
  const centerWithin = useCallback((el) => {
    try {
      const cont = containerRef.current;
      if (!cont) return { x: 0, y: 0 };
      const cRect = cont.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width/2 - cRect.left, y: r.top + r.height/2 - cRect.top };
    } catch (err) {
      console.error("Error calculating center:", err);
      return { x: 0, y: 0 };
    }
  }, []);

  // create DOM dot
  const createDotAt = useCallback((px, py) => {
    try {
      const dot = document.createElement('div');
      dot.className = 'load-balancer-moving-request';
      dot.style.left = px + 'px';
      dot.style.top  = py + 'px';
      if (containerRef.current) {
        containerRef.current.appendChild(dot);
      }
      movingDotsRef.current.push({ id: null, element: dot });
      return dot;
    } catch (err) {
      console.error("Error creating dot:", err);
      return null;
    }
  }, []);

  // animate using Web Animations API for straight segments
  const animateDotAlongPath = useCallback(async (dot, points, durations) => {
    if (!dot) return;
    
    for(let i=0;i<points.length-1;i++){
      const from = points[i], to = points[i+1], dur = durations[i]||800;
      await new Promise(resolve => {
        const anim = dot.animate([{ left: from.x + 'px', top: from.y + 'px' }, { left: to.x + 'px', top: to.y + 'px' }], { duration: dur, easing: 'cubic-bezier(.22,.61,.36,1)', fill:'forwards' });
        anim.onfinish = resolve;
        anim.onerror = () => resolve();
      });
    }
  }, []);

  // create request pipeline
  const createRequest = useCallback(() => {
    try {
      if(!containerRef.current || !clientRef.current || !internetRef.current || !lbRef.current) return;
      const id = requestIdRef.current++;
      setStats(s => ({ ...s, total: s.total + 1 }));

      const start = centerWithin(clientRef.current);
      const internet = centerWithin(internetRef.current);
      const lbCenter = centerWithin(lbRef.current);

      const dot = createDotAt(start.x, start.y);
      if (!dot) return;
      
      movingDotsRef.current[movingDotsRef.current.length-1].id = id;

      const t1 = Math.max(300, 1000 / speed);
      const t2 = Math.max(250, 800 / speed);
      const t3 = Math.max(400, 1000 / speed);

      (async () => {
        try {
          await animateDotAlongPath(dot, [start, internet, lbCenter], [t1, t2]);

          // choose server based on fresh serversRef
          const prev = serversRef.current;
          let targetIdx = 0;
          if(algorithm === 'roundRobin') {
            lastServerRef.current = (lastServerRef.current + 1) % prev.length;
            targetIdx = lastServerRef.current;
          } else {
            let min = Infinity;
            prev.forEach((s,i) => { if(s.queue.length < min){ min = s.queue.length; targetIdx = i; }});
          }

          // enqueue
          setServers(sv => sv.map((s,i) => i === targetIdx ? { ...s, queue: [...s.queue, id] } : s));
          setStats(s => ({ ...s, distributed: s.distributed + 1 }));

          // highlight path
          setActiveLine(targetIdx);
          setTimeout(()=> setActiveLine(null), Math.max(400, 700 / speed));

          // recompute paths to get latest server center
          computePaths();
          
          // find server center DOM
          const serverRow = serverRowRefs.current[targetIdx];
          if (!serverRow) return;
          
          const serverBox = serverRow.querySelector('.load-balancer-server');
          if (!serverBox) return;
          
          const serverCenter = centerWithin(serverBox);

          // animate to server center
          await animateDotAlongPath(dot, [lbCenter, serverCenter], [t3]);

          // remove dot
          try { 
            if (dot.parentNode) {
              dot.parentNode.removeChild(dot); 
            }
          } catch(e){}
          movingDotsRef.current = movingDotsRef.current.filter(d => d.element !== dot);

          // simulate processing then dequeue
          const processing = Math.max(700, (1700 + Math.random()*1400) / speed);
          setTimeout(()=> {
            setServers(prev => prev.map((s,i) => i === targetIdx ? { ...s, queue: s.queue.filter(q => q !== id) } : s));
            setStats(s => ({ ...s, completed: s.completed + 1 }));
          }, processing);
        } catch(e) {
          console.error("Error in request animation:", e);
          try { 
            if (dot.parentNode) {
              dot.parentNode.removeChild(dot); 
            }
          } catch(_){}
          movingDotsRef.current = movingDotsRef.current.filter(d => d.element !== dot);
        }
      })();
    } catch (err) {
      console.error("Error creating request:", err);
    }
  }, [algorithm, speed, centerWithin, createDotAt, animateDotAlongPath, computePaths]);

  // controls
  const handleManual = useCallback(() => { 
    createRequest(); 
  }, [createRequest]);
  
  const handleReset = useCallback(() => {
    try {
      setIsActive(false);
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
      // remove moving dots
      movingDotsRef.current.forEach(d => { 
        try { 
          if (d.element && d.element.parentNode) {
            d.element.parentNode.removeChild(d.element); 
          }
        } catch(e){} 
      });
      movingDotsRef.current = [];
      // reset servers and stats
      setServers(INITIAL_SERVERS.map(s => ({ ...s, queue: [] })));
      serversRef.current = INITIAL_SERVERS.map(s => ({ ...s, queue: [] }));
      requestIdRef.current = 0;
      lastServerRef.current = -1;
      setStats({ total:0, distributed:0, completed:0 });
      setActiveLine(null);
      setTooltip(null);
      setAutoRequestCount(0);
      computePaths();
    } catch (err) {
      console.error("Error resetting:", err);
    }
  }, [computePaths]);

  // tooltip helpers: show tooltip near server box
  const showTooltipForServer = useCallback((idx) => {
    try {
      const serverRow = serverRowRefs.current[idx];
      if(!serverRow || !containerRef.current) return;
      const box = serverRow.querySelector('.load-balancer-server');
      const crect = containerRef.current.getBoundingClientRect();
      const r = box.getBoundingClientRect();
      const x = r.left + r.width/2 - crect.left;
      const y = r.top - crect.top;
      const s = servers[idx];
      setTooltip({ x, y, text: `Queue: ${s.queue.length}` });
    } catch (err) {
      console.error("Error showing tooltip:", err);
    }
  }, [servers]);
  
  const hideTooltip = useCallback(() => { setTooltip(null); }, []);

  return (
    <div className="load-balancer-container">
      {/* Home Button */}
      <button className="load-balancer-home-button" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <header className="load-balancer-header">
        <h1>Fixed Load Balancer Visualization</h1>
        <p className="load-balancer-subtitle">
          Visual pipeline: <strong>Client</strong> → <strong>Internet</strong> → <strong>Load Balancer</strong> → <strong>Servers</strong>.
          Curved links with animated flow, call-stack style server queues, Round-Robin & Least-Connections.
        </p>
      </header>

      {/* Explanation Section */}
      <div className="load-balancer-explanation">
        <h2>What is a Load Balancer?</h2>
        <p>
          A load balancer is a device or software that distributes network traffic across multiple servers to ensure no single server becomes overwhelmed. This improves responsiveness, increases availability, and provides fault tolerance for applications.
        </p>
        
        <div className="load-balancer-key-points">
          <h3>Key Benefits:</h3>
          <ul>
            <li>✅ <strong>Improved Performance:</strong> Distributes requests efficiently across servers</li>
            <li>✅ <strong>High Availability:</strong> Automatically redirects traffic if a server fails</li>
            <li>✅ <strong>Scalability:</strong> Easily add more servers to handle increased traffic</li>
            <li>✅ <strong>Security:</strong> Provides an additional layer of protection against DDoS attacks</li>
          </ul>
        </div>

        <div className="load-balancer-algorithm-info">
          <h3>Load Balancing Algorithms:</h3>
          <div className="load-balancer-algorithm-cards">
            <div className="load-balancer-algorithm-card">
              <h4>Round Robin</h4>
              <p>Distributes requests sequentially to each server in rotation. Simple and effective for servers with similar capabilities.</p>
            </div>
            <div className="load-balancer-algorithm-card">
              <h4>Least Connections</h4>
              <p>Directs traffic to the server with the fewest active connections. Ideal when servers have varying processing power.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Section */}
      <div className="load-balancer-visualization-container">
        <div className="load-balancer-network-path" ref={containerRef}>

          {/* static wires (behind curves) */}
          <div className="load-balancer-connection-wire" style={{ left:'15%', width:'20%', top:'50%' }} />
          <div className="load-balancer-connection-wire" style={{ left:'35%', width:'20%', top:'50%' }} />

          {/* Client */}
          <div className="load-balancer-component load-balancer-client" ref={clientRef} style={{ left:'15%', top:'50%', transform:'translate(-50%,-50%)' }}>
            <div className="load-balancer-node">
              <div style={{fontSize:'1.9rem'}}>👤</div>
              <div className="load-balancer-node-label">Client</div>
            </div>
          </div>

          {/* Internet */}
          <div className="load-balancer-component load-balancer-internet" ref={internetRef} style={{ left:'35%', top:'50%', transform:'translate(-50%,-50%)' }}>
            <div className="load-balancer-node">
              <div style={{fontSize:'1.9rem'}}>🌐</div>
              <div className="load-balancer-node-label">Internet</div>
            </div>
          </div>

          {/* Load Balancer */}
          <div className="load-balancer-component load-balancer-load-balancer" ref={lbRef} style={{ left:'55%', top:'50%', transform:'translate(-50%,-50%)' }}>
            <div className="load-balancer-node">
              <div style={{fontSize:'2rem'}}>⚖️</div>
              <div className="load-balancer-node-label">Load Balancer</div>
              <div style={{fontSize:'.8rem', marginTop:6, color:'#d6d6ff'}}>{algorithm === 'roundRobin' ? 'Round Robin' : 'Least Connections'}</div>
            </div>
          </div>

          {/* SVG curves */}
          <svg className="load-balancer-links" width={svgSize.w} height={svgSize.h} xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a993fe" />
                <stop offset="100%" stopColor="#7e61e7" />
              </linearGradient>
              <marker id="arrowHead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="strokeWidth">
                <polygon points="0 0, 10 4, 0 8" className="load-balancer-arrow-fill"/>
              </marker>
            </defs>

            {paths.map(p => (
              <path
                key={p.idx}
                d={p.d}
                className={'load-balancer-curve ' + (activeLine === p.idx ? 'load-balancer-active' : 'load-balancer-flowing')}
                markerEnd="url(#arrowHead)"
              />
            ))}
          </svg>

          {/* Servers on right */}
          <div className="load-balancer-servers-container">
            {servers.map((s, idx) => (
              <div
                key={s.id}
                className="load-balancer-server-row"
                ref={el => serverRowRefs.current[idx] = el}
                onMouseEnter={() => showTooltipForServer(idx)}
                onMouseLeave={() => hideTooltip()}
              >
                <div className="load-balancer-server">
                  <div className="load-balancer-server-header">
                    <div className="load-balancer-server-label">{s.id.split('-')[1].toUpperCase()}</div>
                  </div>
                  <div className="load-balancer-server-queue">
                    {s.queue.length === 0
                      ? <div className="load-balancer-idle-note">Idle</div>
                      : s.queue.map(q => <div key={q} className="load-balancer-request-box">Req {q}</div>)
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div className="load-balancer-tooltip" style={{ left: tooltip.x + 'px', top: tooltip.y + 'px' }}>
              {tooltip.text}
            </div>
          )}

        </div>
      </div>

      {/* Stats */}
      <div className="load-balancer-stats">
        <div className="load-balancer-stat-item"><div className="load-balancer-stat-value">{stats.total}</div><div className="load-balancer-stat-label">Total</div></div>
        <div className="load-balancer-stat-item"><div className="load-balancer-stat-value">{stats.distributed}</div><div className="load-balancer-stat-label">Distributed</div></div>
        <div className="load-balancer-stat-item"><div className="load-balancer-stat-value">{stats.completed}</div><div className="load-balancer-stat-label">Completed</div></div>
        <div className="load-balancer-stat-item"><div className="load-balancer-stat-value">{servers.reduce((acc,s)=>acc+s.queue.length,0)}</div><div className="load-balancer-stat-label">Active (Queued)</div></div>
        <div className="load-balancer-stat-item"><div className="load-balancer-stat-value">{autoRequestCount}/20</div><div className="load-balancer-stat-label">Auto Requests</div></div>
      </div>

      {/* Controls */}
      <div className="load-balancer-controls-container">
        <div className="load-balancer-algorithm-selector">
          <button className={'load-balancer-algo-button ' + (algorithm==='roundRobin'?'load-balancer-active':'')} onClick={()=>setAlgorithm('roundRobin')}>Round Robin</button>
          <button className={'load-balancer-algo-button ' + (algorithm==='leastConnections'?'load-balancer-active':'')} onClick={()=>setAlgorithm('leastConnections')}>Least Connections</button>
        </div>

        <div className="load-balancer-controls">
          <button className="load-balancer-control-button" onClick={() => setIsActive(v => !v)} disabled={autoRequestCount >= 20 && !isActive}>
            <span className={`load-balancer-status-indicator ${isActive ? 'load-balancer-status-active' : 'load-balancer-status-inactive'}`}></span>
            {isActive ? 'Pause Auto' : 'Start Auto'}
          </button>
          <button className="load-balancer-control-button load-balancer-manual" onClick={handleManual}>Send Manual Request</button>
          <button className="load-balancer-control-button load-balancer-reset" onClick={handleReset}>Reset</button>

          <div className="load-balancer-speed-wrap">
            Speed
            <input type="range" min="0.6" max="2" step="0.1" value={speed} onChange={(e)=>setSpeed(parseFloat(e.target.value))}/>
            <span style={{minWidth:36, display:'inline-block', textAlign:'center'}}>{speed.toFixed(1)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadBalancer;