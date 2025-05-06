// Main application controller
class MazeBot {
    constructor() {
        this.maze = null;
        this.robot = null;
        this.renderer = null;
        this.algorithm = 'bfs';
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        
       
    
       
        // FORMA DE CARGAR EL ARCHIVO
        document.getElementById('cargar').addEventListener('click', () => {
            Swal.fire({
              title: 'Subir archivo',
              html: `
                <input type="file" id="maze-file" accept=".json">
              `,
              confirmButtonText: 'Enviar',
              preConfirm: () => {
                const file = document.getElementById('maze-file').files[0];
                if (!file) {
                  Swal.showValidationMessage('¡Debes seleccionar un archivo!');
                }
                return file;
              }
            }).then((result) => {
              if (result.isConfirmed) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const mazeData = JSON.parse(event.target.result);
                    this.loadMaze(mazeData); // Asegúrate que 'this' aquí sea correcto (quizá necesitas una arrow function arriba)
                  } catch (error) {
                    alert('Error al cargar el archivo del laberinto: ' + error.message);
                  }
                };
                reader.readAsText(result.value); // 👈 aquí el cambio correcto
              }
            });
          });
          

        // LOS BOTONES DE INICO
        document.getElementById('dfs').addEventListener('click', () => {
            this.algorithm = 'dfs';
            if (this.maze) {
                this.solveMaze();
            } else {
                alert('Please load a maze first');
            }
        });

        document.getElementById('bfs').addEventListener('click', () => {
            this.algorithm = 'bfs';
            if (this.maze) {
                this.solveMaze();
            } else {
                alert('Please load a maze first');
            }
        });


        document.getElementById('a').addEventListener('click', () => {
            this.algorithm = 'astar';
            if (this.maze) {
                this.solveMaze();
            } else {
                alert('Please load a maze first');
            }
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            if (this.maze) {
                this.resetMaze();
            }
        });
    }
    
    loadMaze(mazeData) {
        this.maze = new MazeLoader(mazeData);
        
        // Initialize the 3D renderer if not already done
        if (!this.renderer) {
            this.renderer = new Renderer(document.getElementById('canvas-container'));
        }
        
        // Initialize the robot if not already done
        if (!this.robot) {
            this.robot = new Robot(this.renderer.scene);
            this.robot.loadModel();
        }
        
        // Render the maze
        this.renderer.renderMaze(this.maze);
        
        // Position the robot at the start
        const startPos = this.maze.getStartPosition();
        this.robot.setPosition(startPos.x, 0, startPos.z);
    }
    
    async solveMaze() {
        if (!this.maze || !this.robot) return;
        
        let algorithm;
        switch (this.algorithm) {
            case 'bfs':
                algorithm = new BFS(this.maze, this.renderer);
                break;
            case 'dfs':
                algorithm = new DFS(this.maze, this.renderer);
                break;
            case 'astar':
                algorithm = new AStar(this.maze, this.renderer);
                break;
            default:
                algorithm = new BFS(this.maze, this.renderer);
        }
        
        const startTime = performance.now();
        const resultado = await algorithm.solve();
        const endTime = performance.now();
        
        if (resultado.path) {
           
            Swal.fire({
                icon: 'success',
                title: '¡Laberinto completado!',
                html: `
                  <p><strong>Tiempo:</strong> ${(endTime - startTime).toFixed(2)} segundos</p>
                  <p><strong>Pasos recorridos:</strong> ${resultado.path.length}</p>
                  <p><strong>Nodos explorados:</strong> ${resultado.nodesExplored}</p>
                `,
                confirmButtonText: '¡Genial!',
                backdrop: true
            }).then((result) => {
                if (result.isConfirmed) {
                   // Animate the robot along the path
                     this.robot.animateAlongPath(resultado.path);
                }
            });
            
              
           

        } else {
            Swal.fire({
                icon: 'error',
                title: '¡No se encontró una solución!',
                text: 'Parece que no hay camino posible para llegar al destino.',
                confirmButtonText: 'Entendido',
                backdrop: true
              });
        }
    }
    
    resetMaze() {
        if (!this.maze || !this.robot) return;
        
        // Reset robot to start position
        const startPos = this.maze.getStartPosition();
        this.robot.setPosition(startPos.x, 0, startPos.z);
        this.renderer.renderMaze(this.maze);
        
        
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mazeBot = new MazeBot();
});


class MazeLoader {
    constructor(mazeData) {
        this.width = mazeData.ancho;
        this.height = mazeData.alto;
        this.start = mazeData.inicio;
        this.end = mazeData.fin;
        this.walls = mazeData.paredes;
        
        // Create a 2D grid representation of the maze
        this.grid = this.createGrid();
    }
    
    createGrid() {
        // Initialize grid with all cells as paths (0)
        const grid = Array(this.height).fill().map(() => Array(this.width).fill(0));
        
        // Mark walls (1)
        this.walls.forEach(wall => {
            grid[wall[1]][wall[0]] = 1;
        });
        
        return grid;
    }
    
    getStartPosition() {
        return {
            x: this.start[0],
            z: this.start[1]
        };
    }
    
    getEndPosition() {
        return {
            x: this.end[0],
            z: this.end[1]
        };
    }
    
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return true; // Out of bounds is considered a wall
        }
        return this.grid[y][x] === 1;
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height && !this.isWall(x, y);
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { dx: 1, dy: 0 },  // Right
            { dx: -1, dy: 0 }, // Left
            { dx: 0, dy: 1 },  // Down
            { dx: 0, dy: -1 }  // Up
        ];
        
        directions.forEach(dir => {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            if (this.isValidPosition(newX, newY)) {
                neighbors.push({ x: newX, y: newY });
            }
        });
        
        return neighbors;
    }
}


class Renderer {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.maze = null;
        this.clock = new THREE.Clock(); // Correcto
        this.flags = []; 

        this.init();
        this.animate();
    }
    
    init() {
    this.scene = new THREE.Scene();
    // 🌌 Crear cielo nocturno más claro
    const skyGeo = new THREE.SphereGeometry(500, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vWorldPosition;

            void main() {
                float h = normalize(vWorldPosition).y;
                vec3 topColor = vec3(0.2, 0.2, 0.5);   // Azul violeta claro
                vec3 bottomColor = vec3(0.1, 0.1, 0.2); // Gris azulado
                gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
            }
        `,
        uniforms: {}
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);

    
    this.camera = new THREE.PerspectiveCamera(
        75, 
        this.container.clientWidth / this.container.clientHeight, 
        0.1, 
        1000
    );
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
    
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);

    // 🔥 Cargar textura para el suelo de fondo
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('https://st4.depositphotos.com/13349494/24139/i/600/depositphotos_241395960-stock-photo-top-view-field-green-grass.jpg'); // Pasto
    backgroundTexture.wrapS = THREE.RepeatWrapping;
    backgroundTexture.wrapT = THREE.RepeatWrapping;
    backgroundTexture.repeat.set(2, 2); // Repetir muchas veces para que no se vea estirado

    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        map: backgroundTexture,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    this.scene.add(ground);

    window.addEventListener('resize', () => this.onWindowResize());
}

    
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }


    highlightCell(x, y, color) {
        const tileGeometry = new THREE.PlaneGeometry(1, 1);
        const tileMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
    
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(x, -0.49, y); // Justo encima del ground
        tile.userData = { isMazeElement: true }; // Para limpiar si quieres luego
        this.scene.add(tile);
    }
    
    
    renderNow() {
        this.renderer.render(this.scene, this.camera);
    }
    
    
    // 🔵 Nueva función para crear una bandera ondeante
    crearBanderaOndeante(x, y, color) {
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 16);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(x, 0.5, y);
        pole.userData = { isMazeElement: true };
        this.scene.add(pole);

        const flagGeometry = new THREE.PlaneGeometry(0.5, 0.3, 20, 10);

        const flagMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float time;
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    pos.x += 0.03 * sin(5.0 * pos.y + time * 5.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform vec3 color;

                void main() {
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(color) }
            },
            side: THREE.DoubleSide
        });

        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(x + 0.25, 1.0, y);
        flag.rotation.y = Math.PI / 2;
        flag.userData = { isMazeElement: true };
        this.scene.add(flag);

        // Guardamos la bandera para animarla luego
        this.flags.push(flag);
    }
    
    renderMaze(maze) {
        this.maze = maze;
        this.flags = []; // 🔵 Resetear banderas cada vez que se carga un nuevo laberinto

        // Borrar elementos anteriores
        this.scene.children = this.scene.children.filter(child => 
            !(child.userData && child.userData.isMazeElement)
        );
    
        const textureLoader = new THREE.TextureLoader();
        const wallTexture = textureLoader.load('https://st4.depositphotos.com/2000583/38977/i/450/depositphotos_389772856-stock-photo-tropical-leaves-background-copy-space.jpg');
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(1, 1);
    
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.2
        });
    
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            map: wallTexture,
            roughness: 0.7,
            metalness: 0.2
        });
    
        const groundGeometry = new THREE.PlaneGeometry(maze.width, maze.height);
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.position.x = (maze.width - 1) / 2;
        ground.position.z = (maze.height - 1) / 2;
        ground.userData = { isMazeElement: true };
        this.scene.add(ground);
    
        const wallGeometry = new THREE.BoxGeometry(1, 1, 1);

        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                if (maze.isWall(x, y)) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 0, y);
                    wall.userData = { isMazeElement: true };
                    this.scene.add(wall);
                }
            }
        }
    
        for (let x = -1; x <= maze.width; x++) {
            for (let z = -1; z <= maze.height; z++) {
                const enBorde = (x === -1 || x === maze.width || z === -1 || z === maze.height);
                if (enBorde) {
                    const borderWall = new THREE.Mesh(wallGeometry, wallMaterial);
                    borderWall.position.set(x, 0, z);
                    borderWall.userData = { isMazeElement: true };
                    this.scene.add(borderWall);
                }
            }
        }

        // 🔥 Aquí usamos nuestras banderas ondeantes
        this.crearBanderaOndeante(maze.start[0], maze.start[1], 0x00FF00); // Inicio verde
        this.crearBanderaOndeante(maze.end[0], maze.end[1], 0xFF0000); // Final rojo
    
        const maxDim = Math.max(maze.width, maze.height);
        this.camera.position.set(
            maze.width / 2, 
            maxDim * 1.2, 
            maze.height + maxDim * 0.8
        );
        this.camera.lookAt(maze.width / 2, 0, maze.height / 2);
        this.controls.target.set(maze.width / 2, 0, maze.height / 2);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();

        // 🔵 Actualizar tiempo de las banderas
        const elapsedTime = this.clock.getElapsedTime();
        for (const flag of this.flags) {
            flag.material.uniforms.time.value = elapsedTime;
        }

        if (window.mazeBot && window.mazeBot.robot) {
            window.mazeBot.robot.update(this.clock.getDelta());
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}
