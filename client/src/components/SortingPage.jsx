import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/sorting.module.css';

const SortingPage = () => {
  const [array, setArray] = useState([45, 23, 67, 12, 89, 34, 78, 91, 56, 29]);
  const [arraySize, setArraySize] = useState(10);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [valueInput, setValueInput] = useState('');
  const [indexInput, setIndexInput] = useState('');
  const [currentOperation, setCurrentOperation] = useState('Select an operation to begin visualization');

  const [stats, setStats] = useState({
    comparisons: 0,
    swaps: 0,
    access: 0
  });

  const animationRef = useRef();
  const [highlightedElements, setHighlightedElements] = useState({
    comparing: [],
    selected: [],
    sorted: [],
    pivot: [],
    min: []
  });


  // Generate random array
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
      comparing: [],
      selected: [],
      sorted: [],
      pivot: [],
      min: []
    });
    setStats({ comparisons: 0, swaps: 0, access: 0 });
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };


  // Array operations
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


  const searchElement = async () => {
    const value = parseInt(valueInput);

    if (isNaN(value)) {
      setCurrentOperation('Please enter a valid value to search');
      return;
    }

    setCurrentOperation(`Searching for ${value}...`);
    resetAnimation();

    for (let i = 0; i < array.length; i++) {
      setHighlightedElements((prev) => ({
        ...prev,
        comparing: [i],
        selected: [],
        sorted: []
      }));

      setStats((prev) => ({ ...prev, comparisons: prev.comparisons + 1, access: prev.access + 1 }));

      await sleep(animationSpeed);

      if (array[i] === value) {
        setHighlightedElements((prev) => ({
          ...prev,
          comparing: [],
          selected: [i]
        }));
        setCurrentOperation(`Found ${value} at index ${i}`);
        await sleep(animationSpeed * 2);
        resetAnimation();
        return;
      }
    }

    setCurrentOperation(`${value} not found in array`);
    resetAnimation();
  };


  // Sorting Algorithms
  const bubbleSort = () => {
    const arr = [...array];
    const steps = [];
    const n = arr.length;
    let totalComparisons = 0;
    let totalSwaps = 0;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          array: [...arr],
          comparing: [j, j + 1],
          selected: [],
          sorted: Array.from({ length: i }, (_, idx) => n - 1 - idx),
          pivot: [],
          min: [],
          message: `Comparing ${arr[j]} and ${arr[j + 1]}`,
          stats: { comparisons: totalComparisons + 1, swaps: totalSwaps, access: totalComparisons + 1 }
        });
        totalComparisons++;

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          totalSwaps++;

          steps.push({
            array: [...arr],
            comparing: [],
            selected: [j, j + 1],
            sorted: Array.from({ length: i }, (_, idx) => n - 1 - idx),
            pivot: [],
            min: [],
            message: `Swapped ${arr[j]} and ${arr[j + 1]}`,
            stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
          });
        }
      }

      steps.push({
        array: [...arr],
        comparing: [],
        selected: [],
        sorted: Array.from({ length: i + 1 }, (_, idx) => n - 1 - idx),
        pivot: [],
        min: [],
        message: `Element ${arr[n - 1 - i]} is in its final position`,
        stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
      });
    }

    // Final step - all sorted
    steps.push({
      array: [...arr],
      comparing: [],
      selected: [],
      sorted: Array.from({ length: n }, (_, idx) => idx),
      pivot: [],
      min: [],
      message: 'Bubble Sort completed!',
      stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
    });

    return steps;
  };


  const selectionSort = () => {
    const arr = [...array];
    const steps = [];
    const n = arr.length;
    let totalComparisons = 0;
    let totalSwaps = 0;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      steps.push({
        array: [...arr],
        comparing: [],
        selected: [i],
        sorted: Array.from({ length: i }, (_, idx) => idx),
        pivot: [],
        min: [minIdx],
        message: `Finding minimum element from position ${i}`,
        stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
      });

      for (let j = i + 1; j < n; j++) {
        steps.push({
          array: [...arr],
          comparing: [minIdx, j],
          selected: [i],
          sorted: Array.from({ length: i }, (_, idx) => idx),
          pivot: [],
          min: [minIdx],
          message: `Comparing minimum ${arr[minIdx]} with ${arr[j]}`,
          stats: { comparisons: totalComparisons + 1, swaps: totalSwaps, access: totalComparisons + 1 }
        });
        totalComparisons++;

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({
            array: [...arr],
            comparing: [],
            selected: [i],
            sorted: Array.from({ length: i }, (_, idx) => idx),
            pivot: [],
            min: [minIdx],
            message: `New minimum found: ${arr[minIdx]}`,
            stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
          });
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        totalSwaps++;

        steps.push({
          array: [...arr],
          comparing: [],
          selected: [i, minIdx],
          sorted: Array.from({ length: i }, (_, idx) => idx),
          pivot: [],
          min: [],
          message: `Swapped ${arr[minIdx]} with ${arr[i]}`,
            stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
          });
        }

        steps.push({
          array: [...arr],
          comparing: [],
          selected: [],
          sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
          pivot: [],
          min: [],
          message: `Position ${i} is now sorted`,
          stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
        });
      }

      // Final step
      steps.push({
        array: [...arr],
        comparing: [],
        selected: [],
        sorted: Array.from({ length: n }, (_, idx) => idx),
        pivot: [],
        min: [],
        message: 'Selection Sort completed!',
        stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
      });

      return steps;
    };


    const insertionSort = () => {
      const arr = [...array];
      const steps = [];
      const n = arr.length;
      let totalComparisons = 0;
      let totalSwaps = 0;

      steps.push({
        array: [...arr],
        comparing: [],
        selected: [],
        sorted: [0],
        pivot: [],
        min: [],
        message: 'First element is considered sorted',
        stats: { comparisons: 0, swaps: 0, access: 0 }
      });

      for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;

        steps.push({
          array: [...arr],
          comparing: [],
          selected: [i],
          sorted: Array.from({ length: i }, (_, idx) => idx),
          pivot: [],
          min: [],
          message: `Inserting ${key} into sorted portion`,
          stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
        });

        while (j >= 0 && arr[j] > key) {
          steps.push({
            array: [...arr],
            comparing: [j, j + 1],
            selected: [],
            sorted: Array.from({ length: i }, (_, idx) => idx),
            pivot: [],
            min: [],
            message: `Moving ${arr[j]} to the right`,
            stats: { comparisons: totalComparisons + 1, swaps: totalSwaps, access: totalComparisons + 1 }
          });
          totalComparisons++;

          arr[j + 1] = arr[j];
          totalSwaps++;
          j--;
        }

        arr[j + 1] = key;

        steps.push({
          array: [...arr],
          comparing: [],
          selected: [],
          sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
          pivot: [],
          min: [],
          message: `${key} inserted at position ${j + 1}`,
          stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
        });
      }

      steps.push({
        array: [...arr],
        comparing: [],
        selected: [],
        sorted: Array.from({ length: n }, (_, idx) => idx),
        pivot: [],
        min: [],
        message: 'Insertion Sort completed!',
        stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
      });

      return steps;
    };


    const quickSort = () => {
      const arr = [...array];
      const steps = [];
      let totalComparisons = 0;
      let totalSwaps = 0;

      const quickSortHelper = (low, high) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSortHelper(low, pi - 1);
          quickSortHelper(pi + 1, high);
        }
      };

      const partition = (low, high) => {
        const pivot = arr[high];

        steps.push({
          array: [...arr],
          comparing: [],
          selected: [],
          sorted: [],
          pivot: [high],
          min: [],
          message: `Pivot selected: ${pivot}`,
          stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
        });

        let i = low - 1;

        for (let j = low; j <= high - 1; j++) {
          steps.push({
            array: [...arr],
            comparing: [j, high],
            selected: [],
            sorted: [],
            pivot: [high],
            min: [],
            message: `Comparing ${arr[j]} with pivot ${pivot}`,
            stats: { comparisons: totalComparisons + 1, swaps: totalSwaps, access: totalComparisons + 1 }
          });
          totalComparisons++;

          if (arr[j] < pivot) {
            i++;
            if (i !== j) {
              [arr[i], arr[j]] = [arr[j], arr[i]];
              totalSwaps++;

              steps.push({
                array: [...arr],
                comparing: [],
                selected: [i, j],
                sorted: [],
                pivot: [high],
                min: [],
                message: `Swapped ${arr[j]} and ${arr[i]}`,
                stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
              });
            }
          }
        }

        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        totalSwaps++;

        steps.push({
          array: [...arr],
          comparing: [],
          selected: [i + 1],
          sorted: [],
          pivot: [],
          min: [],
          message: `Pivot ${pivot} placed at correct position`,
          stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
        });

        return i + 1;
      };

      quickSortHelper(0, arr.length - 1);

      // Final step
      steps.push({
        array: [...arr],
        comparing: [],
        selected: [],
        sorted: Array.from({ length: arr.length }, (_, idx) => idx),
        pivot: [],
        min: [],
        message: 'Quick Sort completed!',
        stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
      });

      return steps;
    };


    const mergeSort = () => {
      const arr = [...array];
      const steps = [];
      let totalComparisons = 0;
      let totalSwaps = 0;

      const mergeSortHelper = (left, right) => {
        if (left < right) {
          const middle = Math.floor((left + right) / 2);

          steps.push({
            array: [...arr],
            comparing: Array.from({ length: right - left + 1 }, (_, i) => left + i),
            selected: [],
            sorted: [],
            pivot: [],
            min: [],
            message: `Dividing array from ${left} to ${right}`,
            stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
          });

          mergeSortHelper(left, middle);
          mergeSortHelper(middle + 1, right);
          merge(left, middle, right);
        }
      };

      const merge = (left, middle, right) => {
        const leftArr = arr.slice(left, middle + 1);
        const rightArr = arr.slice(middle + 1, right + 1);

        steps.push({
          array: [...arr],
          comparing: [],
          selected: Array.from({ length: right - left + 1 }, (_, i) => left + i),
          sorted: [],
          pivot: [],
          min: [],
          message: `Merging subarrays [${left}..${middle}] and [${middle + 1}..${right}]`,
          stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
        });

        let i = 0,
          j = 0,
          k = left;

        while (i < leftArr.length && j < rightArr.length) {
          totalComparisons++;

          if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
          } else {
            arr[k] = rightArr[j];
            j++;
          }
          k++;
        }

        while (i < leftArr.length) {
          arr[k] = leftArr[i];
          i++;
          k++;
        }

        while (j < rightArr.length) {
          arr[k] = rightArr[j];
          j++;
          k++;
        }

        steps.push({
          array: [...arr],
          comparing: [],
          selected: [],
          sorted: Array.from({ length: right - left + 1 }, (_, i) => left + i),
          pivot: [],
          min: [],
          message: `Merged subarrays successfully`,
          stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
        });
      };

      mergeSortHelper(0, arr.length - 1);

      // Final step
      steps.push({
        array: [...arr],
        comparing: [],
        selected: [],
        sorted: Array.from({ length: arr.length }, (_, idx) => idx),
        pivot: [],
        min: [],
        message: 'Merge Sort completed!',
        stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
      });

      return steps;
    };


    const heapSort = () => {
      const arr = [...array];
      const steps = [];
      const n = arr.length;
      let totalComparisons = 0;
      let totalSwaps = 0;

      const heapify = (n, i) => {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;

        if (left < n && arr[left] > arr[largest]) {
          largest = left;
        }

        if (right < n && arr[right] > arr[largest]) {
          largest = right;
        }

        if (largest !== i) {
          steps.push({
            array: [...arr],
            comparing: [i, largest],
            selected: [],
            sorted: [],
            pivot: [],
            min: [],
            message: `Heapifying: comparing ${arr[i]} and ${arr[largest]}`,
            stats: { comparisons: totalComparisons + 1, swaps: totalSwaps, access: totalComparisons + 1 }
          });
          totalComparisons++;


          [arr[i], arr[largest]] = [arr[largest], arr[i]];
          totalSwaps++;

          steps.push({
            array: [...arr],
            comparing: [],
            selected: [i, largest],
            sorted: [],
            pivot: [],
            min: [],
            message: `Swapped ${arr[largest]} and ${arr[i]}`,
            stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
          });

          heapify(n, largest);
        }
      };

      // Build max heap
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
      }

      // Extract elements from heap one by one
      for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        totalSwaps++;

        steps.push({
          array: [...arr],
          comparing: [],
          selected: [0, i],
          sorted: Array.from({ length: n - i }, (_, idx) => n - 1 - idx),
          pivot: [],
          min: [],
          message: `Moved largest element ${arr[i]} to position ${i}`,
          stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
        });

        heapify(i, 0);
      }

      steps.push({
        array: [...arr],
        comparing: [],
        selected: [],
        sorted: Array.from({ length: n }, (_, idx) => idx),
        pivot: [],
        min: [],
        message: 'Heap Sort completed!',
        stats: { comparisons: totalComparisons, swaps: totalSwaps, access: totalComparisons }
      });

      return steps;
    };

    // Get algorithm steps
    const getAlgorithmSteps = () => {
      switch (selectedAlgorithm) {
        case 'bubbleSort':
          return bubbleSort();
        case 'selectionSort':
          return selectionSort();
        case 'insertionSort':
          return insertionSort();
        case 'quickSort':
          return quickSort();
        case 'mergeSort':
          return mergeSort();
        case 'heapSort':
          return heapSort();
        default:
          return bubbleSort();
      }
    };


    // Start sorting animation
    const startSorting = () => {
      if (isPaused) {
        setIsPaused(false);
        setIsPlaying(true);
        return;
      }

      const algorithmSteps = getAlgorithmSteps();
      setSteps(algorithmSteps);
      setCurrentStep(0);
      setIsPlaying(true);
      setCurrentOperation(`Starting ${selectedAlgorithm}...`);
    };

    // Animate sorting steps in useEffect
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
        comparing: step.comparing || [],
        selected: step.selected || [],
        sorted: step.sorted || [],
        pivot: step.pivot || [],
        min: step.min || []
      });
      setStats(step.stats || { comparisons: 0, swaps: 0, access: 0 });
      setCurrentOperation(step.message || '');

      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, animationSpeed);

      return () => clearTimeout(animationRef.current);
    }, [currentStep, isPlaying, steps, animationSpeed]);


    // Pause sorting
    const pauseSorting = () => {
      setIsPlaying(false);
      setIsPaused(true);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };


    // Stop sorting
    const stopSorting = () => {
      resetAnimation();
      setCurrentOperation('Animation stopped');
    };


    // Step forward one animation frame
    const stepForward = () => {
      if (currentStep < steps.length - 1) {
        const step = steps[currentStep + 1];
        setArray([...step.array]);
        setHighlightedElements({
          comparing: step.comparing || [],
          selected: step.selected || [],
          sorted: step.sorted || [],
          pivot: step.pivot || [],
          min: step.min || []
        });
        setStats(step.stats || { comparisons: 0, swaps: 0, access: 0 });
        setCurrentOperation(step.message || '');
        setCurrentStep((prev) => prev + 1);
      }
    };


    // Utility sleep
    const sleep = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };


    // Clear all array data
    const clearAll = () => {
      setArray([]);
      resetAnimation();
      setCurrentOperation('Array cleared');
    };


    // Reset to default
    const reset = () => {
      setArray([45, 23, 67, 12, 89, 34, 78, 91, 56, 29]);
      resetAnimation();
      setCurrentOperation('Array reset to default values');
    };


    // Classes for bars in visualization
    const getElementClasses = (index) => {
      let classes = styles.sortArrayElement;

      if (highlightedElements.comparing.includes(index)) classes += ` ${styles.sortComparing}`;
      if (highlightedElements.selected.includes(index)) classes += ` ${styles.sortSelected}`;
      if (highlightedElements.sorted.includes(index)) classes += ` ${styles.sortSorted}`;
      if (highlightedElements.pivot.includes(index)) classes += ` ${styles.sortPivot}`;
      if (highlightedElements.min.includes(index)) classes += ` ${styles.sortMin}`;

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

    // Initialize array on mount
    useEffect(() => {
      generateRandomArray();
    }, []);


    // Clear timer on unmount
    useEffect(() => {
      return () => {
        if (animationRef.current) clearTimeout(animationRef.current);
      };
    }, []);


    return (
      <div className={styles.sortAppContainer}>
        {/* Header */}
        <header className={styles.sortMainHeader}>
          <div className={styles.sortHeaderContent}>
            <div className={styles.sortLogoSection}>
              <i className={`fas fa-sort ${styles.sortLogoIcon}`}></i>
              <div className={styles.sortTitleGroup}>
                <h1>Sorting Algorithm Visualizer</h1>
                <p>Interactive Sorting Algorithms Learning Platform</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.sortMainContent}>
          {/* Control Panel */}
          <section className={styles.sortControlPanel}>
            <div className={styles.sortControlSection}>
              <div className={styles.sortInputGroup}>
                <label htmlFor="valueInput">Value</label>
                <input
                  type="number"
                  id="valueInput"
                  placeholder="Enter value"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                />
              </div>
              <div className={styles.sortInputGroup}>
                <label htmlFor="indexInput">Index</label>
                <input
                  type="number"
                  id="indexInput"
                  placeholder="Index"
                  value={indexInput}
                  onChange={(e) => setIndexInput(e.target.value)}
                />
              </div>
              <div className={styles.sortInputGroup}>
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

            <div className={styles.sortControlSection}>
              <div className={styles.sortOperationGroup}>
                <button className={styles.sortOperationBtn} onClick={insertElement} disabled={isPlaying}>
                  <i className="fas fa-plus"></i> Insert
                </button>
                <button className={styles.sortOperationBtn} onClick={deleteElement} disabled={isPlaying}>
                  <i className="fas fa-minus"></i> Delete
                </button>
                <button className={styles.sortOperationBtn} onClick={searchElement} disabled={isPlaying}>
                  <i className="fas fa-search"></i> Search
                </button>

                <button
                  className={`${styles.sortOperationBtn} ${styles.sortSorting} ${selectedAlgorithm === 'bubbleSort' ? styles.sortActive : ''}`}
                  onClick={() => !isPlaying && setSelectedAlgorithm('bubbleSort')}
                  disabled={isPlaying}
                >
                  <i className="fas fa-sort"></i> Bubble Sort
                </button>
                <button
                  className={`${styles.sortOperationBtn} ${styles.sortSorting} ${selectedAlgorithm === 'selectionSort' ? styles.sortActive : ''}`}
                  onClick={() => !isPlaying && setSelectedAlgorithm('selectionSort')}
                  disabled={isPlaying}
                >
                  <i className="fas fa-sort-amount-up"></i> Selection Sort
                </button>
                <button
                  className={`${styles.sortOperationBtn} ${styles.sortSorting} ${selectedAlgorithm === 'insertionSort' ? styles.sortActive : ''}`}
                  onClick={() => !isPlaying && setSelectedAlgorithm('insertionSort')}
                  disabled={isPlaying}
                >
                  <i className="fas fa-sort-amount-down"></i> Insertion Sort
                </button>
                <button
                  className={`${styles.sortOperationBtn} ${styles.sortSorting} ${selectedAlgorithm === 'quickSort' ? styles.sortActive : ''}`}
                  onClick={() => !isPlaying && setSelectedAlgorithm('quickSort')}
                  disabled={isPlaying}
                >
                  <i className="fas fa-bolt"></i> Quick Sort
                </button>
                <button
                  className={`${styles.sortOperationBtn} ${styles.sortSorting} ${selectedAlgorithm === 'mergeSort' ? styles.sortActive : ''}`}
                  onClick={() => !isPlaying && setSelectedAlgorithm('mergeSort')}
                  disabled={isPlaying}
                >
                  <i className="fas fa-code-branch"></i> Merge Sort
                </button>
                <button
                  className={`${styles.sortOperationBtn} ${styles.sortSorting} ${selectedAlgorithm === 'heapSort' ? styles.sortActive : ''}`}
                  onClick={() => !isPlaying && setSelectedAlgorithm('heapSort')}
                  disabled={isPlaying}
                >
                  <i className="fas fa-layer-group"></i> Heap Sort
                </button>
              </div>
            </div>

            <div className={styles.sortControlSection}>
              <div className={styles.sortSettingGroup}>
                <label htmlFor="animationSpeed">Animation Speed</label>
                <div className={styles.sortSpeedControl}>
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
              <div className={styles.sortUtilityButtons}>
                <button className={styles.sortUtilityBtn} onClick={generateRandomArray} disabled={isPlaying}>
                  <i className="fas fa-random"></i>
                  Generate Random
                </button>
                <button className={styles.sortUtilityBtn} onClick={clearAll} disabled={isPlaying}>
                  <i className="fas fa-trash"></i>
                  Clear All
                </button>
                <button className={styles.sortUtilityBtn} onClick={reset} disabled={isPlaying}>
                  <i className="fas fa-redo"></i>
                  Reset
                </button>
              </div>
            </div>
          </section>

          {/* Visualization Container */}
          <section className={styles.sortVisualizationContainer}>
            <div className={styles.sortVizHeader}>
              <div className={styles.sortVizTitle}>
                <h2>Array Visualization - {selectedAlgorithm}</h2>
                <div className={styles.sortComplexityInfo}>
                  <span className={`${styles.sortComplexityBadge} ${styles.sortTime}`}>Time: O(n²)</span>
                  <span className={`${styles.sortComplexityBadge} ${styles.sortSpace}`}>Space: O(1)</span>
                </div>
              </div>
              <div className={styles.sortVizControls}>
                <button
                  className={styles.sortControlBtn}
                  onClick={stepForward}
                  disabled={!steps.length || currentStep >= steps.length - 1 || isPlaying}
                >
                  <i className="fas fa-step-forward"></i> Step
                </button>
                {!isPlaying ? (
                  <button className={styles.sortControlBtn} onClick={startSorting} disabled={!array.length}>
                    <i className="fas fa-play"></i> {isPaused ? 'Resume' : 'Play'}
                  </button>
                ) : (
                  <button className={styles.sortControlBtn} onClick={pauseSorting}>
                    <i className="fas fa-pause"></i> Pause
                  </button>
                )}
                <button className={styles.sortControlBtn} onClick={stopSorting}>
                  <i className="fas fa-stop"></i> Stop
                </button>
              </div>
            </div>

            <div className={styles.sortVisualizationArea}>
              {array.length === 0 ? (
                <div className={styles.sortEmptyState}>
                  <i className="fas fa-th"></i>
                  <h3>Empty Array</h3>
                  <p>Use "Generate Random" to create an array or insert elements manually</p>
                </div>
              ) : (
                <div className={styles.sortArrayContainer}>
                  {array.map((value, index) => (
                    <div key={index} className={getElementClasses(index)}>
                      <div className={styles.sortArrayBar} style={{ height: `${getBarHeight(value)}px` }}>
                        {value}
                      </div>
                      <div className={styles.sortValueLabel}>{value}</div>
                      <div className={styles.sortIndex}>{index}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.sortOperationInfo}>
              <div className={styles.sortInfoHeader}>
                <i className="fas fa-info-circle"></i>
                <span>Current Operation</span>
              </div>
              <div className={styles.sortInfoContent}>{currentOperation}</div>
            </div>
          </section>

          {/* Statistics and Legend */}
          <section className={styles.sortStatsPanel}>
            <div className={styles.sortStatsGroup}>
              <div className={styles.sortStatItem}>
                <span className={styles.sortStatValue}>{stats.comparisons}</span>
                <span className={styles.sortStatLabel}>Comparisons</span>
              </div>
              <div className={styles.sortStatItem}>
                <span className={styles.sortStatValue}>{stats.swaps}</span>
                <span className={styles.sortStatLabel}>Swaps</span>
              </div>
              <div className={styles.sortStatItem}>
                <span className={styles.sortStatValue}>{stats.access}</span>
                <span className={styles.sortStatLabel}>Array Access</span>
              </div>
            </div>

            <div className={styles.sortLegend}>
              <h4>Legend</h4>
              <div className={styles.sortLegendItems}>
                <div className={styles.sortLegendItem}>
                  <div className={styles.sortLegendColor} style={{ background: 'var(--sort-viz-comparing)' }}></div>
                  <span className={styles.sortLegendLabel}>Comparing</span>
                </div>
                <div className={styles.sortLegendItem}>
                  <div className={styles.sortLegendColor} style={{ background: 'var(--sort-viz-selected)' }}></div>
                  <span className={styles.sortLegendLabel}>Selected/Found</span>
                </div>
                <div className={styles.sortLegendItem}>
                  <div className={styles.sortLegendColor} style={{ background: 'var(--sort-viz-sorted)' }}></div>
                  <span className={styles.sortLegendLabel}>Sorted</span>
                </div>
                <div className={styles.sortLegendItem}>
                  <div className={styles.sortLegendColor} style={{ background: 'var(--sort-viz-pivot)' }}></div>
                  <span className={styles.sortLegendLabel}>Pivot</span>
                </div>
                <div className={styles.sortLegendItem}>
                  <div className={styles.sortLegendColor} style={{ background: 'var(--sort-viz-min)' }}></div>
                  <span className={styles.sortLegendLabel}>Minimum</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  };

  export default SortingPage;