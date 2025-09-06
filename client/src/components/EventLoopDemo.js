// EventLoop.js
import React, { useState, useEffect, useRef } from 'react';
import '../styles/EventLoopDemo.css';

const EventLoop = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(5);
    const [callStack, setCallStack] = useState(['main()']);
    const [webApis, setWebApis] = useState([]);
    const [callbackQueue, setCallbackQueue] = useState([]);
    const [threadPool, setThreadPool] = useState([]);
    const [explanation, setExplanation] = useState("Click 'Start' to begin the visualization. The Event Loop is JavaScript's mechanism for handling asynchronous operations.");
    const [taskId, setTaskId] = useState(1);
    const animationRef = useRef(null);

    // Path definitions for animation
    const paths = {
        toWebAPI: "M250,150 L500,150",
        toThreadPool: "M500,150 L750,150",
        toCallbackQueue: "M750,150 L750,350",
        toCallStack: "M750,350 L250,350 L250,150"
    };

    // Draw animation paths
    const drawPaths = () => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "animation-path");
        svg.setAttribute("viewBox", "0 0 1000 600");
        
        for (const [key, path] of Object.entries(paths)) {
            const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathElement.setAttribute("d", path);
            pathElement.classList.add("path");
            svg.appendChild(pathElement);
        }
        
        return svg;
    };

    // Add a task to call stack
    const addTaskToCallStack = (name, type = 'js') => {
        setCallStack(prev => [name, ...prev]);
        setExplanation(`<span class="highlight">${name}</span> is added to the Call Stack. ${type === 'js' ? 'This is a synchronous operation that will execute immediately.' : 'This callback is being processed after being dequeued from the Callback Queue.'}`);
        return taskId;
    };

    // Remove a task from call stack
    const removeTaskFromCallStack = () => {
        setCallStack(prev => {
            if (prev.length > 1) {
                const removedTask = prev[0];
                setExplanation(`<span class="highlight">${removedTask}</span> has been executed and removed from the Call Stack.`);
                return prev.slice(1);
            }
            return ['main()'];
        });
    };

    // Add a task to Web APIs
    const addTaskToWebAPI = (name, type, duration, isBlocking = false) => {
        const id = taskId;
        const newTask = { id, name, type, duration, progress: 0, isBlocking };
        setWebApis(prev => [...prev, newTask]);
        setTaskId(prev => prev + 1);

        setExplanation(`<span class="highlight">${name}</span> is sent to Web APIs. ${isBlocking ? 'This is a potentially blocking operation.' : 'This is a non-blocking operation.'}`);

        // Simulate Web API processing
        const interval = setInterval(() => {
            setWebApis(prev => 
                prev.map(task => 
                    task.id === id 
                        ? { ...task, progress: Math.min(task.progress + (100 / (duration / 100)), 100) } 
                        : task
                )
            );
        }, 100);

        // After duration, move to thread pool (for blocking ops) or callback queue
        setTimeout(() => {
            clearInterval(interval);
            setWebApis(prev => prev.filter(task => task.id !== id));
            
            if (isBlocking) {
                addTaskToThreadPool(name, type, duration);
            } else {
                addTaskToCallbackQueue(name, type);
            }
        }, duration / (animationSpeed / 5));

        return id;
    };

    // Add a task to thread pool
    const addTaskToThreadPool = (name, type, duration) => {
        const id = taskId;
        const newTask = { id, name, type, duration, progress: 0 };
        setThreadPool(prev => [...prev, newTask]);
        setTaskId(prev => prev + 1);

        setExplanation(`<span class="highlight">${name}</span> is a potentially blocking operation, so it's sent to the Thread Pool to avoid blocking the main thread.`);

        // Simulate Thread Pool processing
        const interval = setInterval(() => {
            setThreadPool(prev => 
                prev.map(task => 
                    task.id === id 
                        ? { ...task, progress: Math.min(task.progress + (100 / (duration / 100)), 100) } 
                        : task
                )
            );
        }, 100);

        // After duration, move to callback queue
        setTimeout(() => {
            clearInterval(interval);
            setThreadPool(prev => prev.filter(task => task.id !== id));
            addTaskToCallbackQueue(name, type);
        }, duration / (animationSpeed / 5));

        return id;
    };

    // Add a task to callback queue
    const addTaskToCallbackQueue = (name, type) => {
        setCallbackQueue(prev => [...prev, { name, type }]);
        setExplanation(`<span class="highlight">${name}</span> has completed and its callback has been added to the Callback Queue. It will wait here until the Call Stack is empty.`);
    };

    // Process callback queue
    const processCallbackQueue = () => {
        if (callStack.length === 1 && callbackQueue.length > 0) {
            const task = callbackQueue[0];
            setCallbackQueue(prev => prev.slice(1));
            addTaskToCallStack(task.name, task.type);
            
            // Remove after a short time
            setTimeout(() => {
                removeTaskFromCallStack();
            }, 1000 / animationSpeed);
        }
    };

    // Handle start button click
    const handleStart = () => {
        setIsRunning(true);
        setExplanation("Visualization started! The Event Loop is now running. Add tasks to see how they flow through the system.");
    };

    // Handle pause button click
    const handlePause = () => {
        setIsRunning(false);
        setExplanation("Visualization paused. Click 'Start' to resume.");
    };

    // Handle reset button click
    const handleReset = () => {
        setIsRunning(false);
        setCallStack(['main()']);
        setWebApis([]);
        setCallbackQueue([]);
        setThreadPool([]);
        setTaskId(1);
        setExplanation("Visualization reset. Click 'Start' to begin again.");
    };

    // Handle adding timeout task
    const handleAddTimeout = () => {
        if (!isRunning) return;
        const duration = Math.floor(Math.random() * 3000) + 1000;
        addTaskToWebAPI(`setTimeout`, 'timeout', duration, false);
    };

    // Handle adding DOM task
    const handleAddDom = () => {
        if (!isRunning) return;
        addTaskToWebAPI(`DOM Event`, 'dom', 2000, false);
    };

    // Handle adding AJAX task
    const handleAddAjax = () => {
        if (!isRunning) return;
        const duration = Math.floor(Math.random() * 4000) + 1000;
        addTaskToWebAPI(`AJAX Call`, 'ajax', duration, false);
    };

    // Handle adding blocking task
    const handleAddBlocking = () => {
        if (!isRunning) return;
        const duration = Math.floor(Math.random() * 5000) + 2000;
        addTaskToWebAPI(`File Read`, 'fs', duration, true);
    };

    // Handle speed change
    const handleSpeedChange = (e) => {
        setAnimationSpeed(parseInt(e.target.value));
    };

    // Animation loop
    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                processCallbackQueue();
            }, 1000 / animationSpeed);
            
            return () => clearInterval(interval);
        }
    }, [isRunning, animationSpeed, callStack, callbackQueue]);

    // Initial setup
    useEffect(() => {
        const visualizationContainer = document.querySelector('.visualization-container');
        if (visualizationContainer) {
            visualizationContainer.appendChild(drawPaths());
        }
    }, []);

    return (
        <div className="container">
            <header>
                <h1>React Event Loop Visualizer</h1>
                <p className="subtitle">Explore how JavaScript's concurrency model works with a detailed visualization of the event loop, call stack, callback queue, and Web APIs.</p>
            </header>

            <section className="info-section">
                <h2>Understanding the Event Loop</h2>
                
                <div className="definition">
                    <p>The JavaScript Event Loop is a fundamental concept that enables JavaScript's asynchronous, non-blocking behavior despite being single-threaded. It's the mechanism that allows JavaScript to handle multiple operations concurrently by offloading time-consuming tasks to the system kernel (when possible) and processing callbacks when the main thread is free.</p>
                </div>
                
                <div className="key-points">
                    <h3>Key Points:</h3>
                    <ul>
                        <li><span className="highlight">Single Threaded:</span> JavaScript has one call stack and one memory heap, executing code in order.</li>
                        <li><span className="highlight">Non-Blocking I/O:</span> JavaScript uses an event-driven model where operations don't block the thread while waiting for results.</li>
                        <li><span className="highlight">Concurrency Model:</span> Based on an "event loop" that executes code, processes events, and executes queued sub-tasks.</li>
                        <li><span className="highlight">Call Stack:</span> A data structure that records function calls, with each function pushed onto the stack and popped off when completed.</li>
                        <li><span className="highlight">Web APIs:</span> Browser-provided APIs (like DOM, AJAX, setTimeout) that operate separately from the JavaScript engine.</li>
                        <li><span className="highlight">Callback Queue:</span> Holds callback functions from completed Web API operations, waiting to be executed.</li>
                        <li><span className="highlight">Thread Pool:</span> Handles potentially blocking operations without blocking the main execution thread.</li>
                        <li><span className="highlight">Event Loop:</span> Continuously checks the call stack and callback queue, moving callbacks to the stack when it's empty.</li>
                    </ul>
                </div>
            </section>

            <section className="visualization-section">
                <h2>Event Loop Visualization</h2>
                <div className="controls">
                    <button className="control-btn" onClick={handleStart} disabled={isRunning}>
                        Start
                    </button>
                    <button className="control-btn" onClick={handlePause} disabled={!isRunning}>
                        Pause
                    </button>
                    <button className="control-btn" onClick={handleReset}>
                        Reset
                    </button>
                    <button className="control-btn" onClick={handleAddTimeout} disabled={!isRunning}>
                        Add Timeout
                    </button>
                    <button className="control-btn" onClick={handleAddDom} disabled={!isRunning}>
                        Add DOM Event
                    </button>
                    <button className="control-btn" onClick={handleAddAjax} disabled={!isRunning}>
                        Add AJAX Call
                    </button>
                    <button className="control-btn" onClick={handleAddBlocking} disabled={!isRunning}>
                        Add Blocking Task
                    </button>
                    <div className="speed-control">
                        <span>Speed:</span>
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={animationSpeed} 
                            className="speed-slider" 
                            onChange={handleSpeedChange}
                        />
                    </div>
                </div>
                
                <div className="visualization-container">
                    <div className="call-stack">
                        <div className="component-title">Call Stack</div>
                        <div className="component-content">
                            {callStack.map((task, index) => (
                                <div key={index} className={`task ${task.includes('setTimeout') ? 'task-timeout' : 
                                    task.includes('DOM') ? 'task-dom' : 
                                    task.includes('AJAX') ? 'task-ajax' : 
                                    task.includes('File') ? 'task-fs' : 'task-js'}`}>
                                    {task}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="web-apis">
                        <div className="component-title">Web APIs</div>
                        <div className="component-content">
                            {webApis.map(task => (
                                <div key={task.id} className={`task task-${task.type}`}>
                                    {task.name} ({task.duration}ms)
                                    <div style={{
                                        width: `${task.progress}%`,
                                        height: '4px',
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        borderRadius: '2px',
                                        marginTop: '5px'
                                    }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="thread-pool">
                        <div className="component-title">Thread Pool</div>
                        <div className="component-content">
                            {threadPool.map(task => (
                                <div key={task.id} className={`task task-${task.type}`}>
                                    {task.name} ({task.duration}ms)
                                    <div style={{
                                        width: `${task.progress}%`,
                                        height: '4px',
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        borderRadius: '2px',
                                        marginTop: '5px'
                                    }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="callback-queue">
                        <div className="component-title">Callback Queue</div>
                        <div className="component-content">
                            <div className="queue-content">
                                {callbackQueue.map((task, index) => (
                                    <div key={index} className={`task task-${task.type}`}>
                                        {task.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="event-loop">
                        <div className="component-title">Event Loop</div>
                    </div>
                    
                    <div className="explanation">
                        <div className="component-title">Explanation</div>
                        <div className="explanation-content" dangerouslySetInnerHTML={{ __html: explanation }}></div>
                    </div>
                </div>
            </section>
            
            <footer>
                <p>React Event Loop Visualization | Created with React.js</p>
            </footer>
        </div>
    );
};

export default EventLoop;