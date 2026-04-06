const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Simple graph traversal for Module 4 requirement (JSON Graph Store)
router.get('/path/:source/:target', (req, res) => {
    const { source, target } = req.params;
    
    // Read the "NoSQL" JSON file
    const edgesPath = path.join(__dirname, 'edges.json');
    let edges = [];
    try {
        edges = JSON.parse(fs.readFileSync(edgesPath, 'utf8'));
    } catch (err) {
        return res.status(500).json({ error: 'Failed to read graph data' });
    }

    // Building adjacency list
    const graph = {};
    edges.forEach(edge => {
        if (!graph[edge.Source]) graph[edge.Source] = [];
        graph[edge.Source].push({ node: edge.Target, typeofEdge: edge.Type });
        
        // Treat as undirected for full network traversal
        if (!graph[edge.Target]) graph[edge.Target] = [];
        graph[edge.Target].push({ node: edge.Source, typeofEdge: edge.Type });
    });

    // BFS to find shortest path
    const queue = [[{ node: source, typeofEdge: 'Self' }]];
    const visited = new Set([source]);

    while (queue.length > 0) {
        const pathArr = queue.shift();
        const currentObj = pathArr[pathArr.length - 1];
        const currentNode = currentObj.node;

        if (currentNode === target) {
            return res.json({ success: true, path: pathArr });
        }

        if (graph[currentNode]) {
            for (const neighborObj of graph[currentNode]) {
                if (!visited.has(neighborObj.node)) {
                    visited.add(neighborObj.node);
                    queue.push([...pathArr, neighborObj]);
                }
            }
        }
    }

    res.json({ success: false, message: 'No connection found between these users.' });
});

module.exports = router;
