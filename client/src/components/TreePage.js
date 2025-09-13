import React, { useState, useEffect, useRef } from 'react';
import '../styles/tree.css';

const TREE_TYPES = {
  binaryTree: {
    name: 'Binary Tree',
    definition: 'A hierarchical data structure where each node has at most two children (left and right).',
    operations: ['Insert', 'Delete', 'Search', 'Inorder', 'Preorder', 'Postorder', 'BFS', 'DFS'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)'
  },
  bst: {
    name: 'Binary Search Tree',
    definition: 'A binary tree where left child < parent < right child for all nodes.',
    operations: ['Insert', 'Delete', 'Search', 'Find Min', 'Find Max', 'Inorder', 'Preorder', 'Postorder', 'BFS', 'DFS'],
    timeComplexity: 'O(log n) avg, O(n) worst',
    spaceComplexity: 'O(h)'
  },
  completeBinaryTree: {
    name: 'Complete Binary Tree',
    definition: 'A binary tree where all levels are filled except possibly the last level, which is filled left to right.',
    operations: ['Insert', 'Delete', 'Search', 'Inorder', 'Preorder', 'Postorder', 'BFS', 'DFS'],
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)'
  }
};

const TRAVERSAL_CODES = {
  inorder: `// Inorder Traversal (Left, Root, Right)
function inorderTraversal(root) {
  if (root === null) return;
  
  inorderTraversal(root.left);   // Visit left subtree
  console.log(root.data);        // Process current node
  inorderTraversal(root.right);  // Visit right subtree
}`,
  
  preorder: `// Preorder Traversal (Root, Left, Right)
function preorderTraversal(root) {
  if (root === null) return;
  
  console.log(root.data);        // Process current node
  preorderTraversal(root.left);  // Visit left subtree
  preorderTraversal(root.right); // Visit right subtree
}`,
  
  postorder: `// Postorder Traversal (Left, Right, Root)
function postorderTraversal(root) {
  if (root === null) return;
  
  postorderTraversal(root.left);  // Visit left subtree
  postorderTraversal(root.right); // Visit right subtree
  console.log(root.data);         // Process current node
}`,
  
  bfs: `// Breadth-First Search (Level Order)
function bfs(root) {
  if (root === null) return;
  
  const queue = [root];
  
  while (queue.length > 0) {
    const node = queue.shift();
    console.log(node.data);       // Process current node
    
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}`,
  
  dfs: `// Depth-First Search
function dfs(root) {
  if (root === null) return;
  
  const stack = [root];
  
  while (stack.length > 0) {
    const node = stack.pop();
    console.log(node.data);       // Process current node
    
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
}`
};

class TreeNode {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

const TreePage = () => {
  const [treeType, setTreeType] = useState('binaryTree');
  const [root, setRoot] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [selectedOperation, setSelectedOperation] = useState('insert');
  const [inputValue, setInputValue] = useState('');
  const [currentOperation, setCurrentOperation] = useState('Select an operation to begin visualization');
  const [showCode, setShowCode] = useState(false);
  const [selectedTraversal, setSelectedTraversal] = useState('inorder');
  const [traversalResult, setTraversalResult] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  
  const [stats, setStats] = useState({
    nodes: 0,
    height: 0,
    operations: 0
  });

  const animationRef = useRef();
  const svgRef = useRef();
  const [highlightedNodes, setHighlightedNodes] = useState({
    current: [],
    visited: [],
    found: [],
    comparing: [],
    path: []
  });

  const [treePositions, setTreePositions] = useState(new Map());

  // Reset tree and animation state
  const resetTree = () => {
    setRoot(null);
    resetAnimation();
    setStats({ nodes: 0, height: 0, operations: 0 });
    setTraversalResult([]);
    setSearchResult(null);
    setCurrentOperation('Tree cleared');
    setTreePositions(new Map());
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    setSteps([]);
    setHighlightedNodes({
      current: [],
      visited: [],
      found: [],
      comparing: [],
      path: []
    });
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  // Calculate tree height
  const calculateHeight = (node) => {
    if (!node) return 0;
    return 1 + Math.max(calculateHeight(node.left), calculateHeight(node.right));
  };

  // Count nodes in tree
  const countNodes = (node) => {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  };

  // Update tree statistics
  const updateStats = (newRoot) => {
    setStats({
      nodes: countNodes(newRoot),
      height: calculateHeight(newRoot),
      operations: stats.operations + 1
    });
  };

  // Calculate positions for tree visualization
  const calculatePositions = (node, x = 400, y = 50, level = 0, positions = new Map()) => {
    if (!node) return positions;
    
    const horizontalSpacing = Math.max(200 / (level + 1), 50);
    
    positions.set(node.id, { x, y, level });
    node.x = x;
    node.y = y;
    
    if (node.left) {
      calculatePositions(node.left, x - horizontalSpacing, y + 80, level + 1, positions);
    }
    if (node.right) {
      calculatePositions(node.right, x + horizontalSpacing, y + 80, level + 1, positions);
    }
    
    return positions;
  };

  // Insert node based on tree type
  const insertNode = (value) => {
    const val = parseInt(value);
    if (isNaN(val)) {
      setCurrentOperation('Please enter a valid number');
      return;
    }

    let newRoot;
    const steps = [];

    if (treeType === 'bst') {
      newRoot = insertBST(root, val, steps);
    } else if (treeType === 'completeBinaryTree') {
      newRoot = insertComplete(root, val, steps);
    } else {
      newRoot = insertBinary(root, val, steps);
    }

    setSteps(steps);
    setRoot(newRoot);
    updateStats(newRoot);
    setCurrentOperation(`Inserted ${val} into ${TREE_TYPES[treeType].name}`);
    setInputValue('');
  };

  // BST Insert with animation steps
  const insertBST = (node, value, steps, path = []) => {
    if (!node) {
      const newNode = new TreeNode(value);
      steps.push({
        type: 'insert',
        node: newNode,
        path: [...path],
        message: `Creating new node with value ${value}`,
        highlightedNodes: { current: [newNode.id], visited: [], found: [], comparing: [], path: [...path] }
      });
      return newNode;
    }

    steps.push({
      type: 'compare',
      node: node,
      value: value,
      message: `Comparing ${value} with ${node.data}`,
      highlightedNodes: { current: [node.id], visited: [], found: [], comparing: [node.id], path: [...path, node.id] }
    });

    if (value < node.data) {
      steps.push({
        type: 'move',
        direction: 'left',
        message: `${value} < ${node.data}, moving to left child`,
        highlightedNodes: { current: [node.id], visited: [node.id], found: [], comparing: [], path: [...path, node.id] }
      });
      node.left = insertBST(node.left, value, steps, [...path, node.id]);
    } else if (value > node.data) {
      steps.push({
        type: 'move',
        direction: 'right',
        message: `${value} > ${node.data}, moving to right child`,
        highlightedNodes: { current: [node.id], visited: [node.id], found: [], comparing: [], path: [...path, node.id] }
      });
      node.right = insertBST(node.right, value, steps, [...path, node.id]);
    } else {
      steps.push({
        type: 'duplicate',
        message: `Value ${value} already exists in BST`,
        highlightedNodes: { current: [node.id], visited: [], found: [node.id], comparing: [], path: [...path, node.id] }
      });
    }

    return node;
  };

  // Complete Binary Tree Insert
  const insertComplete = (root, value, steps) => {
    const newNode = new TreeNode(value);
    
    if (!root) {
      steps.push({
        type: 'insert',
        node: newNode,
        message: `Creating root node with value ${value}`,
        highlightedNodes: { current: [newNode.id], visited: [], found: [], comparing: [], path: [] }
      });
      return newNode;
    }

    const queue = [root];
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      steps.push({
        type: 'traverse',
        node: current,
        message: `Checking node ${current.data} for available position`,
        highlightedNodes: { current: [current.id], visited: [], found: [], comparing: [current.id], path: [] }
      });

      if (!current.left) {
        current.left = newNode;
        steps.push({
          type: 'insert',
          node: newNode,
          parent: current,
          position: 'left',
          message: `Inserted ${value} as left child of ${current.data}`,
          highlightedNodes: { current: [newNode.id], visited: [current.id], found: [], comparing: [], path: [current.id] }
        });
        return root;
      } else if (!current.right) {
        current.right = newNode;
        steps.push({
          type: 'insert',
          node: newNode,
          parent: current,
          position: 'right',
          message: `Inserted ${value} as right child of ${current.data}`,
          highlightedNodes: { current: [newNode.id], visited: [current.id], found: [], comparing: [], path: [current.id] }
        });
        return root;
      } else {
        queue.push(current.left);
        queue.push(current.right);
      }
    }
    
    return root;
  };

  // Generic Binary Tree Insert (left-first)
  const insertBinary = (node, value, steps, path = []) => {
    if (!node) {
      const newNode = new TreeNode(value);
      steps.push({
        type: 'insert',
        node: newNode,
        message: `Creating new node with value ${value}`,
        highlightedNodes: { current: [newNode.id], visited: [], found: [], comparing: [], path: [...path] }
      });
      return newNode;
    }

    steps.push({
      type: 'traverse',
      node: node,
      message: `Visiting node ${node.data}`,
      highlightedNodes: { current: [node.id], visited: [], found: [], comparing: [node.id], path: [...path, node.id] }
    });

    if (!node.left) {
      const newNode = new TreeNode(value);
      node.left = newNode;
      steps.push({
        type: 'insert',
        node: newNode,
        parent: node,
        position: 'left',
        message: `Inserted ${value} as left child of ${node.data}`,
        highlightedNodes: { current: [newNode.id], visited: [node.id], found: [], comparing: [], path: [...path, node.id] }
      });
    } else if (!node.right) {
      const newNode = new TreeNode(value);
      node.right = newNode;
      steps.push({
        type: 'insert',
        node: newNode,
        parent: node,
        position: 'right',
        message: `Inserted ${value} as right child of ${node.data}`,
        highlightedNodes: { current: [newNode.id], visited: [node.id], found: [], comparing: [], path: [...path, node.id] }
      });
    } else {
      // Recursively try left subtree first
      node.left = insertBinary(node.left, value, steps, [...path, node.id]);
    }

    return node;
  };

  // Search operation
  const searchNode = (value) => {
    const val = parseInt(value);
    if (isNaN(val)) {
      setCurrentOperation('Please enter a valid number to search');
      return;
    }

    const steps = [];
    const found = performSearch(root, val, steps);
    
    setSteps(steps);
    setSearchResult(found);
    setCurrentOperation(found ? `Found ${val} in tree` : `${val} not found in tree`);
    setInputValue('');
  };

  const performSearch = (node, value, steps, path = []) => {
    if (!node) {
      steps.push({
        type: 'notfound',
        message: `Reached null node - ${value} not found`,
        highlightedNodes: { current: [], visited: [...path], found: [], comparing: [], path: [...path] }
      });
      return false;
    }

    steps.push({
      type: 'compare',
      node: node,
      value: value,
      message: `Comparing ${value} with ${node.data}`,
      highlightedNodes: { current: [node.id], visited: [...path], found: [], comparing: [node.id], path: [...path, node.id] }
    });

    if (node.data === value) {
      steps.push({
        type: 'found',
        node: node,
        message: `Found ${value}!`,
        highlightedNodes: { current: [], visited: [...path], found: [node.id], comparing: [], path: [...path, node.id] }
      });
      return true;
    }

    if (treeType === 'bst') {
      if (value < node.data) {
        steps.push({
          type: 'move',
          direction: 'left',
          message: `${value} < ${node.data}, searching left subtree`,
          highlightedNodes: { current: [], visited: [...path, node.id], found: [], comparing: [], path: [...path, node.id] }
        });
        return performSearch(node.left, value, steps, [...path, node.id]);
      } else {
        steps.push({
          type: 'move',
          direction: 'right',
          message: `${value} > ${node.data}, searching right subtree`,
          highlightedNodes: { current: [], visited: [...path, node.id], found: [], comparing: [], path: [...path, node.id] }
        });
        return performSearch(node.right, value, steps, [...path, node.id]);
      }
    } else {
      // For non-BST, search both subtrees
      const leftResult = performSearch(node.left, value, steps, [...path, node.id]);
      if (leftResult) return true;
      return performSearch(node.right, value, steps, [...path, node.id]);
    }
  };

  // Traversal operations
  const performTraversal = (type) => {
    if (!root) {
      setCurrentOperation('Tree is empty');
      return;
    }

    const steps = [];
    const result = [];

    switch (type) {
      case 'inorder':
        inorderTraversal(root, steps, result);
        break;
      case 'preorder':
        preorderTraversal(root, steps, result);
        break;
      case 'postorder':
        postorderTraversal(root, steps, result);
        break;
      case 'bfs':
        bfsTraversal(root, steps, result);
        break;
      case 'dfs':
        dfsTraversal(root, steps, result);
        break;
    }

    setSteps(steps);
    setTraversalResult(result);
    setSelectedTraversal(type);
    setCurrentOperation(`${type.toUpperCase()} traversal: ${result.join(' → ')}`);
  };

  const inorderTraversal = (node, steps, result, path = []) => {
    if (!node) return;

    steps.push({
      type: 'visit',
      node: node,
      message: `Visiting ${node.data} - going to left subtree`,
      highlightedNodes: { current: [node.id], visited: [...path], found: [], comparing: [], path: [...path, node.id] }
    });

    inorderTraversal(node.left, steps, result, [...path, node.id]);

    steps.push({
      type: 'process',
      node: node,
      message: `Processing ${node.data}`,
      highlightedNodes: { current: [], visited: [...path, node.id], found: [node.id], comparing: [], path: [...path, node.id] }
    });
    result.push(node.data);

    inorderTraversal(node.right, steps, result, [...path, node.id]);
  };

  const preorderTraversal = (node, steps, result, path = []) => {
    if (!node) return;

    steps.push({
      type: 'process',
      node: node,
      message: `Processing ${node.data}`,
      highlightedNodes: { current: [], visited: [...path], found: [node.id], comparing: [], path: [...path, node.id] }
    });
    result.push(node.data);

    if (node.left) {
      steps.push({
        type: 'visit',
        node: node.left,
        message: `Moving to left child of ${node.data}`,
        highlightedNodes: { current: [node.left.id], visited: [...path, node.id], found: [], comparing: [], path: [...path, node.id] }
      });
      preorderTraversal(node.left, steps, result, [...path, node.id]);
    }

    if (node.right) {
      steps.push({
        type: 'visit',
        node: node.right,
        message: `Moving to right child of ${node.data}`,
        highlightedNodes: { current: [node.right.id], visited: [...path, node.id], found: [], comparing: [], path: [...path, node.id] }
      });
      preorderTraversal(node.right, steps, result, [...path, node.id]);
    }
  };

  const postorderTraversal = (node, steps, result, path = []) => {
    if (!node) return;

    steps.push({
      type: 'visit',
      node: node,
      message: `Visiting ${node.data} - processing children first`,
      highlightedNodes: { current: [node.id], visited: [...path], found: [], comparing: [], path: [...path, node.id] }
    });

    postorderTraversal(node.left, steps, result, [...path, node.id]);
    postorderTraversal(node.right, steps, result, [...path, node.id]);

    steps.push({
      type: 'process',
      node: node,
      message: `Processing ${node.data}`,
      highlightedNodes: { current: [], visited: [...path, node.id], found: [node.id], comparing: [], path: [...path, node.id] }
    });
    result.push(node.data);
  };

  const bfsTraversal = (root, steps, result) => {
    const queue = [root];
    const visited = [];

    while (queue.length > 0) {
      const node = queue.shift();
      
      steps.push({
        type: 'process',
        node: node,
        message: `Processing ${node.data} (BFS level-order)`,
        highlightedNodes: { current: [], visited: [...visited], found: [node.id], comparing: [], path: [] }
      });
      
      result.push(node.data);
      visited.push(node.id);

      if (node.left) {
        queue.push(node.left);
        steps.push({
          type: 'enqueue',
          node: node.left,
          message: `Adding left child ${node.left.data} to queue`,
          highlightedNodes: { current: [node.left.id], visited: [...visited], found: [], comparing: [], path: [] }
        });
      }

      if (node.right) {
        queue.push(node.right);
        steps.push({
          type: 'enqueue',
          node: node.right,
          message: `Adding right child ${node.right.data} to queue`,
          highlightedNodes: { current: [node.right.id], visited: [...visited], found: [], comparing: [], path: [] }
        });
      }
    }
  };

  const dfsTraversal = (root, steps, result) => {
    const stack = [root];
    const visited = [];

    while (stack.length > 0) {
      const node = stack.pop();
      
      steps.push({
        type: 'process',
        node: node,
        message: `Processing ${node.data} (DFS)`,
        highlightedNodes: { current: [], visited: [...visited], found: [node.id], comparing: [], path: [] }
      });
      
      result.push(node.data);
      visited.push(node.id);

      if (node.right) {
        stack.push(node.right);
        steps.push({
          type: 'push',
          node: node.right,
          message: `Pushing right child ${node.right.data} to stack`,
          highlightedNodes: { current: [node.right.id], visited: [...visited], found: [], comparing: [], path: [] }
        });
      }

      if (node.left) {
        stack.push(node.left);
        steps.push({
          type: 'push',
          node: node.left,
          message: `Pushing left child ${node.left.data} to stack`,
          highlightedNodes: { current: [node.left.id], visited: [...visited], found: [], comparing: [], path: [] }
        });
      }
    }
  };

  // Delete operation
  const deleteNode = (value) => {
    const val = parseInt(value);
    if (isNaN(val)) {
      setCurrentOperation('Please enter a valid number to delete');
      return;
    }

    const steps = [];
    const newRoot = performDelete(root, val, steps);
    
    setSteps(steps);
    setRoot(newRoot);
    updateStats(newRoot);
    setCurrentOperation(`Attempted to delete ${val} from tree`);
    setInputValue('');
  };

  const performDelete = (node, value, steps, path = []) => {
    if (!node) {
      steps.push({
        type: 'notfound',
        message: `Value ${value} not found for deletion`,
        highlightedNodes: { current: [], visited: [...path], found: [], comparing: [], path: [...path] }
      });
      return null;
    }

    steps.push({
      type: 'compare',
      node: node,
      value: value,
      message: `Comparing ${value} with ${node.data}`,
      highlightedNodes: { current: [node.id], visited: [...path], found: [], comparing: [node.id], path: [...path, node.id] }
    });

    if (value < node.data && treeType === 'bst') {
      node.left = performDelete(node.left, value, steps, [...path, node.id]);
    } else if (value > node.data && treeType === 'bst') {
      node.right = performDelete(node.right, value, steps, [...path, node.id]);
    } else if (value === node.data) {
      steps.push({
        type: 'found',
        node: node,
        message: `Found ${value} - proceeding with deletion`,
        highlightedNodes: { current: [], visited: [...path], found: [node.id], comparing: [], path: [...path, node.id] }
      });

      // Node with only right child or no child
      if (!node.left) {
        steps.push({
          type: 'delete',
          node: node,
          replacement: node.right,
          message: `Deleting ${value} - replacing with right child`,
          highlightedNodes: { current: [], visited: [...path, node.id], found: [], comparing: [], path: [...path] }
        });
        return node.right;
      }
      // Node with only left child
      else if (!node.right) {
        steps.push({
          type: 'delete',
          node: node,
          replacement: node.left,
          message: `Deleting ${value} - replacing with left child`,
          highlightedNodes: { current: [], visited: [...path, node.id], found: [], comparing: [], path: [...path] }
        });
        return node.left;
      }
      // Node with two children
      else {
        const minNode = findMin(node.right);
        steps.push({
          type: 'replace',
          node: node,
          replacement: minNode,
          message: `Replacing ${value} with inorder successor ${minNode.data}`,
          highlightedNodes: { current: [minNode.id], visited: [...path, node.id], found: [], comparing: [], path: [...path, node.id] }
        });
        
        node.data = minNode.data;
        node.right = performDelete(node.right, minNode.data, steps, [...path, node.id]);
      }
    } else if (treeType !== 'bst') {
      // For non-BST, search both subtrees
      const leftResult = performDelete(node.left, value, steps, [...path, node.id]);
      if (leftResult !== node.left) {
        node.left = leftResult;
      } else {
        node.right = performDelete(node.right, value, steps, [...path, node.id]);
      }
    }

    return node;
  };

  const findMin = (node) => {
    while (node.left) {
      node = node.left;
    }
    return node;
  };

  // Animation control
  const startAnimation = () => {
    if (steps.length === 0) {
      setCurrentOperation('No animation steps available');
      return;
    }

    if (isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    setCurrentStep(0);
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
    setIsPaused(true);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  const stopAnimation = () => {
    resetAnimation();
    setCurrentOperation('Animation stopped');
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      const step = steps[currentStep + 1];
      setHighlightedNodes(step.highlightedNodes || {
        current: [],
        visited: [],
        found: [],
        comparing: [],
        path: []
      });
      setCurrentOperation(step.message || '');
      setCurrentStep(currentStep + 1);
    }
  };

  // Animation effect
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[currentStep];
    setHighlightedNodes(step.highlightedNodes || {
      current: [],
      visited: [],
      found: [],
      comparing: [],
      path: []
    });
    setCurrentOperation(step.message || '');

    animationRef.current = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, animationSpeed);

    return () => clearTimeout(animationRef.current);
  }, [currentStep, isPlaying, steps, animationSpeed]);

  // Update tree positions when root changes
  useEffect(() => {
    if (root) {
      const positions = calculatePositions(root);
      setTreePositions(positions);
    }
  }, [root]);

  // Generate sample tree
  const generateSampleTree = () => {
    resetTree();
    const values = treeType === 'bst' ? [50, 30, 70, 20, 40, 60, 80] : [1, 2, 3, 4, 5, 6, 7];
    
    let newRoot = null;
    values.forEach(val => {
      if (treeType === 'bst') {
        newRoot = insertBST(newRoot, val, []);
      } else if (treeType === 'completeBinaryTree') {
        newRoot = insertComplete(newRoot, val, []);
      } else {
        newRoot = insertBinary(newRoot, val, []);
      }
    });
    
    setRoot(newRoot);
    updateStats(newRoot);
    setCurrentOperation(`Generated sample ${TREE_TYPES[treeType].name}`);
  };

  // Render tree nodes and edges
  const renderTree = () => {
    if (!root) return null;

    const nodes = [];
    const edges = [];

    const traverse = (node) => {
      if (!node) return;

      // Determine node class based on highlights
      let nodeClass = 'tree-node';
      if (highlightedNodes.current.includes(node.id)) nodeClass += ' tree-node-current';
      if (highlightedNodes.visited.includes(node.id)) nodeClass += ' tree-node-visited';
      if (highlightedNodes.found.includes(node.id)) nodeClass += ' tree-node-found';
      if (highlightedNodes.comparing.includes(node.id)) nodeClass += ' tree-node-comparing';

      nodes.push(
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r="20"
            className={nodeClass}
          />
          <text
            x={node.x}
            y={node.y + 5}
            textAnchor="middle"
            className="tree-node-text"
          >
            {node.data}
          </text>
          <text
            x={node.x}
            y={node.y + 40}
            textAnchor="middle"
            className="tree-node-index"
            fontSize="10"
          >
            ID: {node.id.substring(0, 4)}
          </text>
        </g>
      );

      if (node.left) {
        edges.push(
          <line
            key={`edge-${node.id}-left`}
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            className="tree-edge"
          />
        );
        traverse(node.left);
      }

      if (node.right) {
        edges.push(
          <line
            key={`edge-${node.id}-right`}
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            className="tree-edge"
          />
        );
        traverse(node.right);
      }
    };

    traverse(root);

    return (
      <svg ref={svgRef} width="800" height="500" className="tree-svg">
        {edges}
        {nodes}
      </svg>
    );
  };

  return (
    <div className="tree-app-container">
      {/* Header */}
      <header className="tree-main-header">
        <div className="tree-header-content">
          <div className="tree-logo-section">
            <i className="fas fa-sitemap tree-logo-icon"></i>
            <div className="tree-title-group">
              <h1>Tree Algorithm Visualizer</h1>
              <p>Interactive Binary Trees, BST & Complete Binary Trees</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="tree-main-content">
        {/* Control Panel */}
        <section className="tree-control-panel">
          <div className="tree-control-section tree-input-section">
            <div className="tree-input-group">
              <label htmlFor="treeTypeSelect">Tree Type</label>
              <select
                id="treeTypeSelect"
                value={treeType}
                onChange={(e) => {
                  setTreeType(e.target.value);
                  resetTree();
                }}
                disabled={isPlaying}
              >
                {Object.entries(TREE_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="tree-input-group">
              <label htmlFor="valueInput">Value</label>
              <input
                type="number"
                id="valueInput"
                placeholder="Enter value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isPlaying}
              />
            </div>

            <div className="tree-input-group">
              <label htmlFor="operationSelect">Operation</label>
              <select
                id="operationSelect"
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
                disabled={isPlaying}
              >
                <option value="insert">Insert</option>
                <option value="delete">Delete</option>
                <option value="search">Search</option>
              </select>
            </div>

            <div className="tree-input-group">
              <label htmlFor="animationSpeed">Speed</label>
              <input
                type="range"
                id="animationSpeed"
                min="200"
                max="2000"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                disabled={isPlaying}
              />
              <span>{animationSpeed}ms</span>
            </div>
          </div>

          <div className="tree-control-section tree-operation-section">
            <div className="tree-operation-group">
              <button
                className="tree-operation-btn"
                onClick={() => {
                  if (selectedOperation === 'insert') insertNode(inputValue);
                  else if (selectedOperation === 'delete') deleteNode(inputValue);
                  else if (selectedOperation === 'search') searchNode(inputValue);
                }}
                disabled={isPlaying || !inputValue}
              >
                <i className="fas fa-play"></i>
                Execute {selectedOperation}
              </button>

              <button
                className="tree-operation-btn"
                onClick={generateSampleTree}
                disabled={isPlaying}
              >
                <i className="fas fa-random"></i>
                Generate Sample
              </button>

              <button
                className="tree-operation-btn tree-danger"
                onClick={resetTree}
                disabled={isPlaying}
              >
                <i className="fas fa-trash"></i>
                Clear Tree
              </button>
            </div>

            <div className="tree-traversal-group">
              <label>Traversals:</label>
              {['inorder', 'preorder', 'postorder', 'bfs', 'dfs'].map(traversal => (
                <button
                  key={traversal}
                  className={`tree-traversal-btn ${selectedTraversal === traversal ? 'tree-active' : ''}`}
                  onClick={() => performTraversal(traversal)}
                  disabled={isPlaying || !root}
                >
                  {traversal.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="tree-control-section tree-animation-section">
            <div className="tree-animation-controls">
              {!isPlaying ? (
                <button
                  className="tree-control-btn"
                  onClick={startAnimation}
                  disabled={steps.length === 0}
                >
                  <i className="fas fa-play"></i>
                  {isPaused ? 'Resume' : 'Play'}
                </button>
              ) : (
                <button className="tree-control-btn" onClick={pauseAnimation}>
                  <i className="fas fa-pause"></i>
                  Pause
                </button>
              )}
              
              <button
                className="tree-control-btn"
                onClick={stepForward}
                disabled={isPlaying || currentStep >= steps.length - 1}
              >
                <i className="fas fa-step-forward"></i>
                Step
              </button>
              
              <button className="tree-control-btn" onClick={stopAnimation}>
                <i className="fas fa-stop"></i>
                Stop
              </button>

              <button
                className="tree-control-btn"
                onClick={() => setShowCode(!showCode)}
              >
                <i className="fas fa-code"></i>
                {showCode ? 'Hide' : 'Show'} Code
              </button>
            </div>
          </div>
        </section>

        {/* Visualization Container */}
        <section className="tree-visualization-container">
          <div className="tree-viz-header">
            <div className="tree-viz-title">
              <h2>{TREE_TYPES[treeType].name} Visualization</h2>
              <div className="tree-complexity-info">
                <span className="tree-complexity-badge tree-time">
                  Time: {TREE_TYPES[treeType].timeComplexity}
                </span>
                <span className="tree-complexity-badge tree-space">
                  Space: {TREE_TYPES[treeType].spaceComplexity}
                </span>
              </div>
            </div>
          </div>

          <div className="tree-visualization-area">
            {!root ? (
              <div className="tree-empty-state">
                <i className="fas fa-sitemap"></i>
                <h3>Empty Tree</h3>
                <p>Insert nodes or generate a sample tree to begin</p>
              </div>
            ) : (
              renderTree()
            )}
          </div>

          <div className="tree-operation-info">
            <div className="tree-info-header">
              <i className="fas fa-info-circle"></i>
              <span>Current Operation</span>
            </div>
            <div className="tree-info-content">{currentOperation}</div>
          </div>

          {traversalResult.length > 0 && (
            <div className="tree-traversal-result">
              <div className="tree-result-header">
                <i className="fas fa-route"></i>
                <span>{selectedTraversal.toUpperCase()} Traversal Result</span>
              </div>
              <div className="tree-result-content">
                {traversalResult.join(' → ')}
              </div>
            </div>
          )}
        </section>

        {/* Statistics Panel */}
        <section className="tree-stats-panel">
          <div className="tree-stats-group">
            <div className="tree-stat-item">
              <span className="tree-stat-value">{stats.nodes}</span>
              <span className="tree-stat-label">Nodes</span>
            </div>
            <div className="tree-stat-item">
              <span className="tree-stat-value">{stats.height}</span>
              <span className="tree-stat-label">Height</span>
            </div>
            <div className="tree-stat-item">
              <span className="tree-stat-value">{stats.operations}</span>
              <span className="tree-stat-label">Operations</span>
            </div>
          </div>

          <div className="tree-legend">
            <h4>Legend</h4>
            <div className="tree-legend-items">
              <div className="tree-legend-item">
                <div className="tree-legend-color tree-current"></div>
                <span className="tree-legend-label">Current</span>
              </div>
              <div className="tree-legend-item">
                <div className="tree-legend-color tree-visited"></div>
                <span className="tree-legend-label">Visited</span>
              </div>
              <div className="tree-legend-item">
                <div className="tree-legend-color tree-found"></div>
                <span className="tree-legend-label">Found</span>
              </div>
              <div className="tree-legend-item">
                <div className="tree-legend-color tree-comparing"></div>
                <span className="tree-legend-label">Comparing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Code Section */}
        {showCode && (
          <section className="tree-code-section">
            <div className="tree-algorithm-info">
              <h2>{TREE_TYPES[treeType].name}</h2>
              <p className="tree-algorithm-definition">
                {TREE_TYPES[treeType].definition}
              </p>
              
              <div className="tree-code-tabs">
                {Object.entries(TRAVERSAL_CODES).map(([key, code]) => (
                  <div key={key} className="tree-code-tab">
                    <h3>{key.toUpperCase()} Traversal</h3>
                    <pre className="tree-code-block">
                      <code>{code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default TreePage;
