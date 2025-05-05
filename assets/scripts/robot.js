class Robot {
    constructor(scene) {
        this.scene = scene;
        this.model = null;
        this.mixer = null;
        this.animations = {};
        this.clock = new THREE.Clock();
        this.isMoving = false;
    }
    
    loadModel() {
        const loader = new THREE.GLTFLoader();
        
        // Load the robot model (using the Three.js example robot)
        loader.load(
            'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF/CesiumMan.gltf',
            (gltf) => {
                this.model = gltf.scene;
                this.model.scale.set(0.5, 0.5, 0.5); // Scale down the model
                this.scene.add(this.model);
                
                // Set up animations
                this.mixer = new THREE.AnimationMixer(this.model);
                gltf.animations.forEach((clip) => {
                    this.animations[clip.name] = this.mixer.clipAction(clip);
                });
                
                // Play idle animation by default
                if (this.animations['Idle']) {
                    this.animations['Idle'].play();
                }
                
                // Position the robot at origin initially
                this.setPosition(0, 1, 0);
                
                console.log('Robot model loaded successfully');
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading robot model:', error);
            }
        );
    }
    
    setPosition(x, y, z) {
        if (this.model) {
            this.model.position.set(x, y, z);
        }
    }
    
    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
    
    playAnimation(name) {
        if (this.animations[name]) {
            // Fade out current animations
            for (const anim in this.animations) {
                if (this.animations[anim].isRunning()) {
                    this.animations[anim].fadeOut(0.5);
                }
            }
            
            // Fade in new animation
            this.animations[name].reset().fadeIn(0.5).play();
        }
    }
    
    animateAlongPath(path) {
        if (!this.model || path.length === 0) return;
        
        this.isMoving = true;
        let currentIndex = 0;
        
        this.playAnimation('Walking');
        
        const animateStep = () => {
            if (currentIndex >= path.length) {
                this.isMoving = false;
                this.playAnimation('Dance');
                return;
            }
            
            const nextPos = path[currentIndex];
            const targetX = nextPos.x;
            const targetZ = nextPos.z;
            
            if (currentIndex > 0) {
                const prevPos = path[currentIndex - 1];
                const dx = targetX - prevPos.x;
                const dz = targetZ - prevPos.z;
                
                if (dx !== 0 || dz !== 0) {
                    const angle = Math.atan2(dz, dx);
                    this.model.rotation.y = angle - Math.PI / 2; // 🔥 Ajuste para girar correctamente
                }
            }
            
            this.setPosition(targetX, 0, targetZ);
            currentIndex++;
            
            setTimeout(animateStep, 500);
        };
        
        animateStep();
    }
    
}