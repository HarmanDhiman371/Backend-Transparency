import React, { useState, useEffect, useRef } from 'react';
import '../styles/searching.css';

const SEARCH_ALGORITHMS = {
  linearSearch: {
    name: 'Linear Search',
    definition: 'A sequential search algorithm that checks each element one by one until the target is found or all elements are checked.',
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found at index i
    }
  }
  return -1; // Not found
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  binarySearch: {
    name: 'Binary Search',
    definition: 'An efficient search algorithm that works on sorted arrays by repeatedly dividing the search interval in half.',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found at index mid
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1; // Not found
}`,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)'
  }
};

const SearchingPage = () => {
  const [array, setArray] = useState([12, 23, 34, 45, 56, 67, 78, 89, 91, 100]);
  const [arraySize, setArraySize] = useState(10);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('linearSearch');
  const [targetValue, setTargetValue] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [indexInput, setIndexInput] = useState('');
  const [currentOperation, setCurrentOperation] = useState('Select a search algorithm to begin visualization');
  const [showCode, setShowCode] = useState(false);
  const [searchResult, setSearchResult] = useState({ found: false, index: -1 });

  const [stats, setStats] = useState({
    comparisons: 0,
    access: 0,
    iterations: 0
  });

  const animationRef = useRef();
  const [highlightedElements, setHighlightedElements] = useState({
    current: [],
    left: [],
    right: [],
    mid: [],
    found: [],
    range: []
  });

  // Generate sorted array for binary search
  const generateSortedArray = () => {
    const size = Math.min(Math.max(arraySize, 5), 20);
    const newArray = Array.from({ length: size }, (_, i) => (i + 1) * Math.floor(Math.random() * 10 + 1))
      .sort((a, b) => a - b);
    setArray(newArray);
    resetAnimation();
    setCurrentOperation(`Generated sorted array of size ${size} for searching`);
  };

  // Generate random array for linear search
  const generateRandomArray = () => {
    const size = Math.min(Math.max(arraySize, 5), 20);
    const newArray = Array.from({ length: size }, () => 
      Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);
    resetAnimation();
    setCurrentOperation(`Generated random array of size ${size}`);
  };

  // Reset animation state
  const resetAnimation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    setSteps([]);
    setHighlightedElements({
      current: [],
      left: [],
      right: [],
      mid: [],
      found: [],
      range: []
    });
    setStats({ comparisons: 0, access: 0, iterations: 0 });
    setSearchResult({ found: false, index: -1 });
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  // Insert element
  const insertElement = () => {
    const value = parseInt(valueInput);
    const index = parseInt(indexInput);

    if (isNaN(value)) {
      setCurrentOperation('Please enter a valid value');
      return;
    }

    if (isNaN(index) || index < 0 || index > array.length) {
      setCurrentOperation(`Index must be between 0 and ${array.length}`);
      return;
    }

    const newArray = [...array];
    newArray.splice(index, 0, value);
    setArray(newArray);
    setCurrentOperation(`Inserted ${value} at index ${index}`);
    setValueInput('');
    setIndexInput('');
  };

  // Delete element
  const deleteElement = () => {
    const index = parseInt(indexInput);

    if (isNaN(index) || index < 0 || index >= array.length) {
      setCurrentOperation('Please enter a valid index');
      return;
    }

    const deleted = array[index];
    const newArray = [...array];
    newArray.splice(index, 1);
    setArray(newArray);
    setCurrentOperation(`Deleted element ${deleted} from index ${index}`);
    setIndexInput('');
  };

  // Linear Search Algorithm
  const linearSearch = () => {
    const target = parseInt(targetValue);
    if (isNaN(target)) {
      setCurrentOperation('Please enter a valid target value');
      return [];
    }

    const steps = [];
    let comparisons = 0;
    let access = 0;

    for (let i = 0; i < array.length; i++) {
      steps.push({
        array: [...array],
        current: [i],
        left: [],
        right: [],
        mid: [],
        found: [],
        range: [],
        message: `Checking element at index ${i}: ${array[i]}`,
        stats: { comparisons: comparisons + 1, access: access + 1, iterations: i + 1 },
        target: target
      });

      comparisons++;
      access++;

      if (array[i] === target) {
        steps.push({
          array: [...array],
          current: [],
          left: [],
          right: [],
          mid: [],
          found: [i],
          range: [],
          message: `Found ${target} at index ${i}! Linear search completed.`,
          stats: { comparisons, access, iterations: i + 1 },
          target: target,
          result: { found: true, index: i }
        });
        return steps;
      }
    }

    steps.push({
      array: [...array],
      current: [],
      left: [],
      right: [],
      mid: [],
      found: [],
      range: [],
      message: `${target} not found in array. Linear search completed.`,
      stats: { comparisons, access, iterations: array.length },
      target: target,
      result: { found: false, index: -1 }
    });

    return steps;
  };

  // Binary Search Algorithm
  const binarySearch = () => {
    const target = parseInt(targetValue);
    if (isNaN(target)) {
      setCurrentOperation('Please enter a valid target value');
      return [];
    }

    const steps = [];
    let left = 0;
    let right = array.length - 1;
    let comparisons = 0;
    let access = 0;
    let iterations = 0;

    // Initial step showing the entire array as search range
    steps.push({
      array: [...array],
      current: [],
      left: [left],
      right: [right],
      mid: [],
      found: [],
      range: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      message: `Binary search initialized. Target: ${target}, Search range: ${left} to ${right}`,
      stats: { comparisons, access, iterations },
      target: target
    });

    while (left <= right) {
      iterations++;
      const mid = Math.floor((left + right) / 2);
      
      steps.push({
        array: [...array],
        current: [],
        left: [left],
        right: [right],
        mid: [mid],
        found: [],
        range: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        message: `Iteration ${iterations}: Checking middle element at index ${mid}: ${array[mid]}`,
        stats: { comparisons: comparisons + 1, access: access + 1, iterations },
        target: target
      });

      comparisons++;
      access++;

      if (array[mid] === target) {
        steps.push({
          array: [...array],
          current: [],
          left: [],
          right: [],
          mid: [],
          found: [mid],
          range: [],
          message: `Found ${target} at index ${mid}! Binary search completed in ${iterations} iterations.`,
          stats: { comparisons, access, iterations },
          target: target,
          result: { found: true, index: mid }
        });
        return steps;
      } else if (array[mid] < target) {
        left = mid + 1;
        steps.push({
          array: [...array],
          current: [],
          left: [left],
          right: [right],
          mid: [mid],
          found: [],
          range: left <= right ? Array.from({ length: right - left + 1 }, (_, i) => left + i) : [],
          message: `${array[mid]} < ${target}, searching right half. New range: ${left} to ${right}`,
          stats: { comparisons, access, iterations },
          target: target
        });
      } else {
        right = mid - 1;
        steps.push({
          array: [...array],
          current: [],
          left: [left],
          right: [right],
          mid: [mid],
          found: [],
          range: left <= right ? Array.from({ length: right - left + 1 }, (_, i) => left + i) : [],
          message: `${array[mid]} > ${target}, searching left half. New range: ${left} to ${right}`,
          stats: { comparisons, access, iterations },
          target: target
        });
      }
    }

    steps.push({
      array: [...array],
      current: [],
      left: [],
      right: [],
      mid: [],
      found: [],
      range: [],
      message: `${target} not found in array. Binary search completed in ${iterations} iterations.`,
      stats: { comparisons, access, iterations },
      target: target,
      result: { found: false, index: -1 }
    });

    return steps;
  };

  // Get algorithm steps
  const getAlgorithmSteps = () => {
    if (selectedAlgorithm === 'linearSearch') {
      return linearSearch();
    } else if (selectedAlgorithm === 'binarySearch') {
      return binarySearch();
    }
    return [];
  };

  // Start search animation
  const startSearch = () => {
    if (isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    const algorithmSteps = getAlgorithmSteps();
    if (algorithmSteps.length === 0) return;
    
    setSteps(algorithmSteps);
    setCurrentStep(0);
    setIsPlaying(true);
    setCurrentOperation(`Starting ${SEARCH_ALGORITHMS[selectedAlgorithm].name}...`);
  };

  // Animate search steps
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[currentStep];
    if (!step) {
      setIsPlaying(false);
      return;
    }

    setArray([...step.array]);
    setHighlightedElements({
      current: step.current || [],
      left: step.left || [],
      right: step.right || [],
      mid: step.mid || [],
      found: step.found || [],
      range: step.range || []
    });
    setStats(step.stats || { comparisons: 0, access: 0, iterations: 0 });
    setCurrentOperation(step.message || '');
    
    if (step.result) {
      setSearchResult(step.result);
    }

    animationRef.current = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, animationSpeed);

    return () => clearTimeout(animationRef.current);
  }, [currentStep, isPlaying, steps, animationSpeed]);

  // Pause search
  const pauseSearch = () => {
    setIsPlaying(false);
    setIsPaused(true);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  // Stop search
  const stopSearch = () => {
    resetAnimation();
    setCurrentOperation('Search stopped');
  };

  // Step forward
  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      const step = steps[currentStep + 1];
      setArray([...step.array]);
      setHighlightedElements({
        current: step.current || [],
        left: step.left || [],
        right: step.right || [],
        mid: step.mid || [],
        found: step.found || [],
        range: step.range || []
      });
      setStats(step.stats || { comparisons: 0, access: 0, iterations: 0 });
      setCurrentOperation(step.message || '');
      if (step.result) {
        setSearchResult(step.result);
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  // Clear all
  const clearAll = () => {
    setArray([]);
    resetAnimation();
    setCurrentOperation('Array cleared');
  };

  // Reset array
  const reset = () => {
    if (selectedAlgorithm === 'binarySearch') {
      setArray([12, 23, 34, 45, 56, 67, 78, 89, 91, 100]);
    } else {
      setArray([45, 23, 67, 12, 89, 34, 78, 91, 56, 29]);
    }
    resetAnimation();
    setCurrentOperation('Array reset to default values');
  };

  // Classes for array elements to highlight states
  const getElementClasses = (index) => {
    let classes = 'array-element';

    if (highlightedElements.current.includes(index)) classes += ' current';
    if (highlightedElements.left.includes(index)) classes += ' left-pointer';
    if (highlightedElements.right.includes(index)) classes += ' right-pointer';
    if (highlightedElements.mid.includes(index)) classes += ' mid-pointer';
    if (highlightedElements.found.includes(index)) classes += ' found';
    if (highlightedElements.range.includes(index)) classes += ' in-range';

    return classes;
  };

  // Bar height calculation
  const getBarHeight = (value) => {
    if (array.length === 0) return 30;
    const maxValue = Math.max(...array);
    const minHeight = 30;
    const maxHeight = 300;
    return minHeight + (value / maxValue) * (maxHeight - minHeight);
  };

  // Render pointer labels for binary search
  const renderPointerLabels = () => {
    if (selectedAlgorithm !== 'binarySearch' || array.length === 0) return null;

    const leftIndex = highlightedElements.left[0];
    const rightIndex = highlightedElements.right[0];
    const midIndex = highlightedElements.mid[0];

    return (
      <div className="pointer-labels">
        {leftIndex !== undefined && (
          <div 
            className="pointer-label left-pointer-label"
            style={{ left: `${(leftIndex / array.length) * 100}%` }}
          >
            <div className="pointer-arrow"></div>
            <span>Left: {leftIndex}</span>
          </div>
        )}
        {rightIndex !== undefined && (
          <div 
            className="pointer-label right-pointer-label"
            style={{ left: `${(rightIndex / array.length) * 100}%` }}
          >
            <div className="pointer-arrow"></div>
            <span>Right: {rightIndex}</span>
          </div>
        )}
        {midIndex !== undefined && (
          <div 
            className="pointer-label mid-pointer-label"
            style={{ left: `${(midIndex / array.length) * 100}%` }}
          >
            <div className="pointer-arrow"></div>
            <span>Mid: {midIndex}</span>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (selectedAlgorithm === 'binarySearch') {
      generateSortedArray();
    } else {
      generateRandomArray();
    }
  }, []);

  useEffect(() => {
    resetAnimation();
    if (selectedAlgorithm === 'binarySearch') {
      generateSortedArray();
    }
  }, [selectedAlgorithm]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <i className="fas fa-search logo-icon"></i>
            <div className="title-group">
              <h1>Searching Algorithm Visualizer</h1>
              <p>Interactive Search Algorithms Learning Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Control Panel */}
        <section className="control-panel">
          <div className="control-section input-section">
            <div className="input-group">
              <label htmlFor="targetValue">Target</label>
              <input
                type="number"
                id="targetValue"
                placeholder="Search value"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="valueInput">Value</label>
              <input
                type="number"
                id="valueInput"
                placeholder="Enter value"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="indexInput">Index</label>
              <input
                type="number"
                id="indexInput"
                placeholder="Index"
                value={indexInput}
                onChange={(e) => setIndexInput(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="arraySizeInput">Array Size</label>
              <input
                type="number"
                id="arraySizeInput"
                placeholder="Size"
                min="5"
                max="20"
                value={arraySize}
                onChange={(e) => setArraySize(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>

          <div className="control-section operation-section">
            <div className="operation-group">
              <button className="operation-btn" onClick={insertElement} disabled={isPlaying}>
                <i className="fas fa-plus"></i> Insert
              </button>
              <button className="operation-btn" onClick={deleteElement} disabled={isPlaying}>
                <i className="fas fa-minus"></i> Delete
              </button>


              <button
                className={`operation-btn search-algo ${selectedAlgorithm === 'linearSearch' ? 'active' : ''}`}
                onClick={() => !isPlaying && setSelectedAlgorithm('linearSearch')}
                disabled={isPlaying}
              >
                <i className="fas fa-arrow-right"></i> Linear Search
              </button>
              <button
                className={`operation-btn search-algo ${selectedAlgorithm === 'binarySearch' ? 'active' : ''}`}
                onClick={() => !isPlaying && setSelectedAlgorithm('binarySearch')}
                disabled={isPlaying}
              >
                <i className="fas fa-code-branch"></i> Binary Search
              </button>
            </div>
          </div>

          <div className="control-section settings-section">
            <div className="setting-group">
              <label htmlFor="animationSpeed">Animation Speed</label>
              <div className="speed-control">
                <input
                  type="range"
                  id="animationSpeed"
                  min="100"
                  max="2000"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                />
                <span id="speedValue">{animationSpeed}ms</span>
              </div>
            </div>
            <div className="utility-buttons">
              <button className="utility-btn" onClick={selectedAlgorithm === 'binarySearch' ? generateSortedArray : generateRandomArray} disabled={isPlaying}>
                <i className="fas fa-random"></i>
                Generate {selectedAlgorithm === 'binarySearch' ? 'Sorted' : 'Random'}
              </button>
              <button className="utility-btn" onClick={clearAll} disabled={isPlaying}>
                <i className="fas fa-trash"></i>
                Clear All
              </button>
              <button className="utility-btn" onClick={reset} disabled={isPlaying}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Visualization Container */}
        <section className="visualization-container">
          <div className="viz-header">
            <div className="viz-title">
              <h2>Search Visualization - {SEARCH_ALGORITHMS[selectedAlgorithm].name}</h2>
              <div className="complexity-info">
                <span className="complexity-badge time">Time: {SEARCH_ALGORITHMS[selectedAlgorithm].timeComplexity}</span>
                <span className="complexity-badge space">Space: {SEARCH_ALGORITHMS[selectedAlgorithm].spaceComplexity}</span>
              </div>
            </div>
            <div className="viz-controls">
              <button
                className="control-btn"
                onClick={stepForward}
                disabled={!steps.length || currentStep >= steps.length - 1 || isPlaying}
              >
                <i className="fas fa-step-forward"></i>
                Step
              </button>
              {!isPlaying ? (
                <button className="control-btn" onClick={startSearch} disabled={!array.length || !targetValue}>
                  <i className="fas fa-play"></i>
                  {isPaused ? 'Resume' : 'Start Search'}
                </button>
              ) : (
                <button className="control-btn" onClick={pauseSearch}>
                  <i className="fas fa-pause"></i>
                  Pause
                </button>
              )}
              <button className="control-btn" onClick={stopSearch}>
                <i className="fas fa-stop"></i>
                Stop
              </button>
              <button className="control-btn" onClick={() => setShowCode(!showCode)}>
                <i className="fas fa-code"></i>
                {showCode ? 'Hide' : 'Show'} Code
              </button>
            </div>
          </div>

          <div className="visualization-area">
            {array.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-search"></i>
                <h3>Empty Array</h3>
                <p>Generate an array to start searching</p>
              </div>
            ) : (
              <div className="array-visualization">
                <div className="array-container">
                  {array.map((value, index) => (
                    <div key={index} className={getElementClasses(index)}>
                      <div
                        className="array-bar"
                        style={{ height: `${getBarHeight(value)}px` }}
                      >
                        {value}
                      </div>
                      <div className="index">{index}</div>
                    </div>
                  ))}
                </div>
                {renderPointerLabels()}
              </div>
            )}

            {searchResult.found !== null && (
              <div className="search-result">
                {searchResult.found ? (
                  <div className="result-found">
                    <i className="fas fa-check-circle"></i>
                    Target {targetValue} found at index {searchResult.index}!
                  </div>
                ) : (
                  <div className="result-not-found">
                    <i className="fas fa-times-circle"></i>
                    Target {targetValue} not found in array
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="operation-info">
            <div className="info-header">
              <i className="fas fa-info-circle"></i>
              <span>Current Operation</span>
            </div>
            <div className="info-content">{currentOperation}</div>
          </div>
        </section>

        {/* Statistics and Legend */}
        <section className="stats-panel">
          <div className="stats-group">
            <div className="stat-item">
              <span className="stat-value">{stats.comparisons}</span>
              <span className="stat-label">Comparisons</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.access}</span>
              <span className="stat-label">Array Access</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.iterations}</span>
              <span className="stat-label">Iterations</span>
            </div>
          </div>

          <div className="legend">
            <h4>Legend</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'var(--viz-current)' }}></div>
                <span className="legend-label">Current Element</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'var(--viz-left)' }}></div>
                <span className="legend-label">Left Pointer</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'var(--viz-right)' }}></div>
                <span className="legend-label">Right Pointer</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'var(--viz-mid)' }}></div>
                <span className="legend-label">Mid Pointer</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'var(--viz-found)' }}></div>
                <span className="legend-label">Found</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'var(--viz-range)' }}></div>
                <span className="legend-label">Search Range</span>
              </div>
            </div>
          </div>
        </section>

        {/* Code Section */}
        {showCode && (
          <section className="code-section">
            <div className="algorithm-info">
              <h2>{SEARCH_ALGORITHMS[selectedAlgorithm].name}</h2>
              <p className="algorithm-definition">
                {SEARCH_ALGORITHMS[selectedAlgorithm].definition}
              </p>
              <div className="complexity-details">
                <div><strong>Time Complexity:</strong> {SEARCH_ALGORITHMS[selectedAlgorithm].timeComplexity}</div>
                <div><strong>Space Complexity:</strong> {SEARCH_ALGORITHMS[selectedAlgorithm].spaceComplexity}</div>
              </div>
              <pre className="code-block">
                <code>{SEARCH_ALGORITHMS[selectedAlgorithm].code}</code>
              </pre>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SearchingPage;