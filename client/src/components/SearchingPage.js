import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/searching.module.css';

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
    let classes = styles.searchArrayElement;

    if (highlightedElements.current.includes(index)) classes += ` ${styles.searchCurrent}`;
    if (highlightedElements.left.includes(index)) classes += ` ${styles.searchLeftPointer}`;
    if (highlightedElements.right.includes(index)) classes += ` ${styles.searchRightPointer}`;
    if (highlightedElements.mid.includes(index)) classes += ` ${styles.searchMidPointer}`;
    if (highlightedElements.found.includes(index)) classes += ` ${styles.searchFound}`;
    if (highlightedElements.range.includes(index)) classes += ` ${styles.searchInRange}`;

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
      <div className={styles.searchPointerLabels}>
        {leftIndex !== undefined && (
          <div 
            className={`${styles.searchPointerLabel} ${styles.searchLeftPointerLabel}`}
            style={{ left: `${(leftIndex / array.length) * 100}%` }}
          >
            <div className={styles.searchPointerArrow}></div>
            <span>Left: {leftIndex}</span>
          </div>
        )}
        {rightIndex !== undefined && (
          <div 
            className={`${styles.searchPointerLabel} ${styles.searchRightPointerLabel}`}
            style={{ left: `${(rightIndex / array.length) * 100}%` }}
          >
            <div className={styles.searchPointerArrow}></div>
            <span>Right: {rightIndex}</span>
          </div>
        )}
        {midIndex !== undefined && (
          <div 
            className={`${styles.searchPointerLabel} ${styles.searchMidPointerLabel}`}
            style={{ left: `${(midIndex / array.length) * 100}%` }}
          >
            <div className={styles.searchPointerArrow}></div>
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
    <div className={styles.searchAppContainer}>
      {/* Header */}
      <header className={styles.searchMainHeader}>
        <div className={styles.searchHeaderContent}>
          <div className={styles.searchLogoSection}>
            <i className={`fas fa-search ${styles.searchLogoIcon}`}></i>
            <div className={styles.searchTitleGroup}>
              <h1>Searching Algorithm Visualizer</h1>
              <p>Interactive Search Algorithms Learning Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.searchMainContent}>
        {/* Control Panel */}
        <section className={styles.searchControlPanel}>
          <div className={styles.searchControlSection}>
            <div className={styles.searchInputGroup}>
              <label htmlFor="targetValue">Target</label>
              <input
                type="number"
                id="targetValue"
                placeholder="Search value"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>
            <div className={styles.searchInputGroup}>
              <label htmlFor="valueInput">Value</label>
              <input
                type="number"
                id="valueInput"
                placeholder="Enter value"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
              />
            </div>
            <div className={styles.searchInputGroup}>
              <label htmlFor="indexInput">Index</label>
              <input
                type="number"
                id="indexInput"
                placeholder="Index"
                value={indexInput}
                onChange={(e) => setIndexInput(e.target.value)}
              />
            </div>
            <div className={styles.searchInputGroup}>
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

          <div className={styles.searchControlSection}>
            <div className={styles.searchOperationGroup}>
              <button className={styles.searchOperationBtn} onClick={insertElement} disabled={isPlaying}>
                <i className="fas fa-plus"></i> Insert
              </button>
              <button className={styles.searchOperationBtn} onClick={deleteElement} disabled={isPlaying}>
                <i className="fas fa-minus"></i> Delete
              </button>


              <button
                className={`${styles.searchOperationBtn} ${styles.searchAlgo} ${selectedAlgorithm === 'linearSearch' ? styles.searchActive : ''}`}
                onClick={() => !isPlaying && setSelectedAlgorithm('linearSearch')}
                disabled={isPlaying}
              >
                <i className="fas fa-arrow-right"></i> Linear Search
              </button>
              <button
                className={`${styles.searchOperationBtn} ${styles.searchAlgo} ${selectedAlgorithm === 'binarySearch' ? styles.searchActive : ''}`}
                onClick={() => !isPlaying && setSelectedAlgorithm('binarySearch')}
                disabled={isPlaying}
              >
                <i className="fas fa-code-branch"></i> Binary Search
              </button>
            </div>
          </div>

          <div className={styles.searchControlSection}>
            <div className={styles.searchSettingGroup}>
              <label htmlFor="animationSpeed">Animation Speed</label>
              <div className={styles.searchSpeedControl}>
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
            <div className={styles.searchUtilityButtons}>
              <button className={styles.searchUtilityBtn} onClick={selectedAlgorithm === 'binarySearch' ? generateSortedArray : generateRandomArray} disabled={isPlaying}>
                <i className="fas fa-random"></i>
                Generate {selectedAlgorithm === 'binarySearch' ? 'Sorted' : 'Random'}
              </button>
              <button className={styles.searchUtilityBtn} onClick={clearAll} disabled={isPlaying}>
                <i className="fas fa-trash"></i>
                Clear All
              </button>
              <button className={styles.searchUtilityBtn} onClick={reset} disabled={isPlaying}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Visualization Container */}
        <section className={styles.searchVisualizationContainer}>
          <div className={styles.searchVizHeader}>
            <div className={styles.searchVizTitle}>
              <h2>Search Visualization - {SEARCH_ALGORITHMS[selectedAlgorithm].name}</h2>
              <div className={styles.searchComplexityInfo}>
                <span className={`${styles.searchComplexityBadge} ${styles.searchTime}`}>Time: {SEARCH_ALGORITHMS[selectedAlgorithm].timeComplexity}</span>
                <span className={`${styles.searchComplexityBadge} ${styles.searchSpace}`}>Space: {SEARCH_ALGORITHMS[selectedAlgorithm].spaceComplexity}</span>
              </div>
            </div>
            <div className={styles.searchVizControls}>
              <button
                className={styles.searchControlBtn}
                onClick={stepForward}
                disabled={!steps.length || currentStep >= steps.length - 1 || isPlaying}
              >
                <i className="fas fa-step-forward"></i>
                Step
              </button>
              {!isPlaying ? (
                <button className={styles.searchControlBtn} onClick={startSearch} disabled={!array.length || !targetValue}>
                  <i className="fas fa-play"></i>
                  {isPaused ? 'Resume' : 'Start Search'}
                </button>
              ) : (
                <button className={styles.searchControlBtn} onClick={pauseSearch}>
                  <i className="fas fa-pause"></i>
                  Pause
                </button>
              )}
              <button className={styles.searchControlBtn} onClick={stopSearch}>
                <i className="fas fa-stop"></i>
                Stop
              </button>
              <button className={styles.searchControlBtn} onClick={() => setShowCode(!showCode)}>
                <i className="fas fa-code"></i>
                {showCode ? 'Hide' : 'Show'} Code
              </button>
            </div>
          </div>

          <div className={styles.searchVisualizationArea}>
            {array.length === 0 ? (
              <div className={styles.searchEmptyState}>
                <i className="fas fa-search"></i>
                <h3>Empty Array</h3>
                <p>Generate an array to start searching</p>
              </div>
            ) : (
              <div className={styles.searchArrayVisualization}>
                <div className={styles.searchArrayContainer}>
                  {array.map((value, index) => (
                    <div key={index} className={getElementClasses(index)}>
                      <div
                        className={styles.searchArrayBar}
                        style={{ height: `${getBarHeight(value)}px` }}
                      >
                        {value}
                      </div>
                      <div className={styles.searchIndex}>{index}</div>
                    </div>
                  ))}
                </div>
                {renderPointerLabels()}
              </div>
            )}

            {searchResult.found !== null && (
              <div className={styles.searchSearchResult}>
                {searchResult.found ? (
                  <div className={styles.searchResultFound}>
                    <i className="fas fa-check-circle"></i>
                    Target {targetValue} found at index {searchResult.index}!
                  </div>
                ) : (
                  <div className={styles.searchResultNotFound}>
                    <i className="fas fa-times-circle"></i>
                    Target {targetValue} not found in array
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.searchOperationInfo}>
            <div className={styles.searchInfoHeader}>
              <i className="fas fa-info-circle"></i>
              <span>Current Operation</span>
            </div>
            <div className={styles.searchInfoContent}>{currentOperation}</div>
          </div>
        </section>

        {/* Statistics and Legend */}
        <section className={styles.searchStatsPanel}>
          <div className={styles.searchStatsGroup}>
            <div className={styles.searchStatItem}>
              <span className={styles.searchStatValue}>{stats.comparisons}</span>
              <span className={styles.searchStatLabel}>Comparisons</span>
            </div>
            <div className={styles.searchStatItem}>
              <span className={styles.searchStatValue}>{stats.access}</span>
              <span className={styles.searchStatLabel}>Array Access</span>
            </div>
            <div className={styles.searchStatItem}>
              <span className={styles.searchStatValue}>{stats.iterations}</span>
              <span className={styles.searchStatLabel}>Iterations</span>
            </div>
          </div>

          <div className={styles.searchLegend}>
            <h4>Legend</h4>
            <div className={styles.searchLegendItems}>
              <div className={styles.searchLegendItem}>
                <div className={styles.searchLegendColor} style={{ background: 'var(--search-viz-current)' }}></div>
                <span className={styles.searchLegendLabel}>Current Element</span>
              </div>
              <div className={styles.searchLegendItem}>
                <div className={styles.searchLegendColor} style={{ background: 'var(--search-viz-left)' }}></div>
                <span className={styles.searchLegendLabel}>Left Pointer</span>
              </div>
              <div className={styles.searchLegendItem}>
                <div className={styles.searchLegendColor} style={{ background: 'var(--search-viz-right)' }}></div>
                <span className={styles.searchLegendLabel}>Right Pointer</span>
              </div>
              <div className={styles.searchLegendItem}>
                <div className={styles.searchLegendColor} style={{ background: 'var(--search-viz-mid)' }}></div>
                <span className={styles.searchLegendLabel}>Mid Pointer</span>
              </div>
              <div className={styles.searchLegendItem}>
                <div className={styles.searchLegendColor} style={{ background: 'var(--search-viz-found)' }}></div>
                <span className={styles.searchLegendLabel}>Found</span>
              </div>
              <div className={styles.searchLegendItem}>
                <div className={styles.searchLegendColor} style={{ background: 'var(--search-viz-range)' }}></div>
                <span className={styles.searchLegendLabel}>Search Range</span>
              </div>
            </div>
          </div>
        </section>

        {/* Code Section */}
        {showCode && (
          <section className={styles.searchCodeSection}>
            <div className={styles.searchAlgorithmInfo}>
              <h2>{SEARCH_ALGORITHMS[selectedAlgorithm].name}</h2>
              <p className={styles.searchAlgorithmDefinition}>
                {SEARCH_ALGORITHMS[selectedAlgorithm].definition}
              </p>
              <div className={styles.searchComplexityDetails}>
                <div><strong>Time Complexity:</strong> {SEARCH_ALGORITHMS[selectedAlgorithm].timeComplexity}</div>
                <div><strong>Space Complexity:</strong> {SEARCH_ALGORITHMS[selectedAlgorithm].spaceComplexity}</div>
              </div>
              <pre className={styles.searchCodeBlock}>
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