class DFS {
    constructor(maze) {
        this.maze = maze;
    }
    
    solve() {
        const startX = this.maze.start[0];
        const startY = this.maze.start[1];
        const endX = this.maze.end[0];
        const endY = this.maze.end[1];
        
        // Stack for DFS
        const stack = [{ x: startX, y: startY, path: [] }];
        
        // Set to keep track of visited cells
        const visited = new Set();
        visited.add(`${startX},${startY}`);
        
        let nodesExplored = 0;
        
        while (stack.length > 0) {
            const current = stack.pop();
            nodesExplored++;
            
            // Check if we've reached the goal
            if (current.x === endX && current.y === endY) {
                // Return the path and stats
                return {
                    path: [...current.path, { x: current.x, z: current.y }],
                    nodesExplored: nodesExplored
                };
            }
            
            // Get neighbors
            const neighbors = this.maze.getNeighbors(current.x, current.y);
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                
                if (!visited.has(key)) {
                    visited.add(key);
                    
                    // Add to stack with updated path
                    stack.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        path: [...current.path, { x: current.x, z: current.y }]
                    });
                }
            }
        }
        
        // No path found
        return { path: null, nodesExplored: nodesExplored };
    }
}


class BFS {
    constructor(maze) {
        this.maze = maze;
    }
    
    solve() {
        const startX = this.maze.start[0];
        const startY = this.maze.start[1];
        const endX = this.maze.end[0];
        const endY = this.maze.end[1];
        
        // Queue for BFS
        const queue = [{ x: startX, y: startY, path: [] }];
        
        // Set to keep track of visited cells
        const visited = new Set();
        visited.add(`${startX},${startY}`);
        
        let nodesExplored = 0;
        
        while (queue.length > 0) {
            const current = queue.shift();
            nodesExplored++;
            
            // Check if we've reached the goal
            if (current.x === endX && current.y === endY) {
                // Return the path and stats
                return {
                    path: [...current.path, { x: current.x, z: current.y }],
                    nodesExplored: nodesExplored
                };
            }
            
            // Get neighbors
            const neighbors = this.maze.getNeighbors(current.x, current.y);
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                
                if (!visited.has(key)) {
                    visited.add(key);
                    
                    // Add to queue with updated path
                    queue.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        path: [...current.path, { x: current.x, z: current.y }]
                    });
                }
            }
        }
        
        // No path found
        return { path: null, nodesExplored: nodesExplored };
    }
}

class AStar {
    constructor(maze) {
        this.maze = maze;
    }
    
    // Heuristic function (Manhattan distance)
    heuristic(x, y, endX, endY) {
        return Math.abs(x - endX) + Math.abs(y - endY);
    }
    
    solve() {
        const startX = this.maze.start[0];
        const startY = this.maze.start[1];
        const endX = this.maze.end[0];
        const endY = this.maze.end[1];
        
        // Priority queue for A*
        const openSet = [{ 
            x: startX, 
            y: startY, 
            path: [],
            g: 0,
            f: this.heuristic(startX, startY, endX, endY)
        }];
        
        // Set to keep track of visited cells
        const visited = new Set();
        
        let nodesExplored = 0;
        
        while (openSet.length > 0) {
            // Sort by f value (lowest first)
            openSet.sort((a, b) => a.f - b.f);
            
            const current = openSet.shift();
            nodesExplored++;
            
            // Check if we've reached the goal
            if (current.x === endX && current.y === endY) {
                // Return the path and stats
                return {
                    path: [...current.path, { x: current.x, z: current.y }],
                    nodesExplored: nodesExplored
                };
            }
            
            // Mark as visited
            const key = `${current.x},${current.y}`;
            visited.add(key);
            
            // Get neighbors
            const neighbors = this.maze.getNeighbors(current.x, current.y);
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                if (!visited.has(neighborKey)) {
                    // Calculate g and f values
                    const g = current.g + 1;
                    const h = this.heuristic(neighbor.x, neighbor.y, endX, endY);
                    const f = g + h;
                    
                    // Check if this node is already in openSet with a better path
                    const existingNode = openSet.find(node => 
                        node.x === neighbor.x && node.y === neighbor.y
                    );
                    
                    if (!existingNode || g < existingNode.g) {
                        // Add to openSet with updated values
                        if (existingNode) {
                            existingNode.g = g;
                            existingNode.f = f;
                            existingNode.path = [...current.path, { x: current.x, z: current.y }];
                        } else {
                            openSet.push({
                                x: neighbor.x,
                                y: neighbor.y,
                                path: [...current.path, { x: current.x, z: current.y }],
                                g: g,
                                f: f
                            });
                        }
                    }
                }
            }
        }
        
        // No path found
        return { path: null, nodesExplored: nodesExplored };
    }
}