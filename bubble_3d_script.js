/**
 * Bubble3D - Sistema de visualização 3D para dados financeiros
 */

class Bubble3D {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        this.options = {
            autoRotate: true,
            autoRotateSpeed: 0.5,
            enableControls: true,
            enablePhysics: true,
            backgroundColor: 0x0a0a0a,
            cameraDistance: 200,
            ...options
        };
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.bubbles = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.isInitialized = false;
        this.selectedBubble = null;
        this.hoveredBubble = null;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('Container não encontrado:', this.containerId);
            return;
        }
        
        this.setupScene();
        this.setupLighting();
        this.setupControls();
        this.setupEventListeners();
        
        this.isInitialized = true;
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = this.options.cameraDistance;
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(this.options.backgroundColor, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x4080ff, 0.3, 300);
        pointLight.position.set(-50, 50, 100);
        this.scene.add(pointLight);
    }
    
    setupControls() {
        if (!this.options.enableControls) return;
        
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.autoRotate = this.options.autoRotate;
        this.controls.autoRotateSpeed = this.options.autoRotateSpeed;
        this.controls.maxDistance = 500;
        this.controls.minDistance = 50;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));
    }
    
    createBubble(data) {
        const radius = this.calculateBubbleSize(data);
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = this.createBubbleMaterial(data);
        const mesh = new THREE.Mesh(geometry, material);
        
        const position = this.calculateBubblePosition(data, this.bubbles.length);
        mesh.position.copy(position);
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.1
        );
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        const label = this.createBubbleLabel(data, radius);
        
        const bubble = {
            mesh,
            label,
            data,
            velocity,
            originalPosition: position.clone(),
            radius,
            id: data.symbol || `bubble_${this.bubbles.length}`
        };
        
        this.bubbles.push(bubble);
        this.scene.add(mesh);
        
        return bubble;
    }
    
    calculateBubbleSize(data) {
        const baseSize = 15;
        const maxSize = 50;
        const minSize = 8;
        
        let size = baseSize;
        if (data.marketCap) {
            size = Math.log(data.marketCap) * 1.5;
        }
        
        return Math.max(minSize, Math.min(maxSize, size));
    }
    
    createBubbleMaterial(data) {
        const isPositive = (data.change || 0) >= 0;
        const intensity = Math.min(Math.abs(data.change || 0) / 5, 1);
        
        let color;
        if (isPositive) {
            color = new THREE.Color().setHSL(0.33, 0.8, 0.3 + intensity * 0.4);
        } else {
            color = new THREE.Color().setHSL(0, 0.8, 0.3 + intensity * 0.4);
        }
        
        return new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100,
            specular: 0x222222,
            transparent: true,
            opacity: 0.9
        });
    }
    
    calculateBubblePosition(data, index) {
        const angle = (index / Math.max(1, this.bubbles.length)) * Math.PI * 2;
        const distance = 60 + Math.random() * 80;
        
        return new THREE.Vector3(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            (Math.random() - 0.5) * 100
        );
    }
    
    createBubbleLabel(data, radius) {
        const label = document.createElement('div');
        label.className = 'bubble-label';
        
        const fontSize = Math.max(10, radius / 3);
        const changeClass = (data.change || 0) >= 0 ? 'positive' : 'negative';
        
        label.innerHTML = `
            <div class="symbol" style="font-size: ${fontSize}px;">
                ${data.symbol || data.name || 'N/A'}
            </div>
            <div class="change ${changeClass}" style="font-size: ${fontSize * 0.8}px;">
                ${data.change >= 0 ? '+' : ''}${(data.change || 0).toFixed(2)}%
            </div>
        `;
        
        this.container.appendChild(label);
        return label;
    }
    
    updateBubbles() {
        this.bubbles.forEach(bubble => {
            if (this.options.enablePhysics) {
                this.updateBubblePhysics(bubble);
            }
            this.updateBubbleRotation(bubble);
            this.updateBubbleLabel(bubble);
        });
    }
    
    updateBubblePhysics(bubble) {
        bubble.mesh.position.add(bubble.velocity);
        
        const bounds = 150;
        if (Math.abs(bubble.mesh.position.x) > bounds) bubble.velocity.x *= -0.8;
        if (Math.abs(bubble.mesh.position.y) > bounds) bubble.velocity.y *= -0.8;
        if (Math.abs(bubble.mesh.position.z) > 80) bubble.velocity.z *= -0.8;
        
        const centerForce = bubble.mesh.position.clone().multiplyScalar(-0.001);
        bubble.velocity.add(centerForce);
        bubble.velocity.multiplyScalar(0.99);
        
        this.bubbles.forEach(otherBubble => {
            if (bubble !== otherBubble) {
                const distance = bubble.mesh.position.distanceTo(otherBubble.mesh.position);
                const minDistance = bubble.radius + otherBubble.radius + 5;
                
                if (distance < minDistance) {
                    const repulsion = bubble.mesh.position.clone()
                        .sub(otherBubble.mesh.position)
                        .normalize()
                        .multiplyScalar(0.1);
                    bubble.velocity.add(repulsion);
                }
            }
        });
    }
    
    updateBubbleRotation(bubble) {
        bubble.mesh.rotation.x += 0.005;
        bubble.mesh.rotation.y += 0.01;
    }
    
    updateBubbleLabel(bubble) {
        const vector = bubble.mesh.position.clone();
        vector.project(this.camera);
        
        const x = (vector.x * 0.5 + 0.5) * this.container.clientWidth;
        const y = (vector.y * -0.5 + 0.5) * this.container.clientHeight;
        
        bubble.label.style.left = (x - 30) + 'px';
        bubble.label.style.top = (y - 15) + 'px';
        
        const isVisible = vector.z < 1 && vector.z > -1;
        bubble.label.style.display = isVisible ? 'block' : 'none';
        bubble.label.style.opacity = isVisible ? (1 - Math.abs(vector.z)) : 0;
    }
    
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.bubbles.map(b => b.mesh));
        
        if (intersects.length > 0) {
            const bubble = this.bubbles.find(b => b.mesh === intersects[0].object);
            if (bubble && this.options.onBubbleSelect) {
                this.options.onBubbleSelect(bubble.data);
            }
        }
    }
    
    onWindowResize() {
        if (!this.isInitialized) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    animate() {
        if (!this.isInitialized) return;
        requestAnimationFrame(() => this.animate());
        if (this.controls) this.controls.update();
        this.updateBubbles();
        this.renderer.render(this.scene, this.camera);
    }
    
    addBubble(data) {
        return this.createBubble(data);
    }
    
    clearBubbles() {
        this.bubbles.forEach(bubble => {
            this.scene.remove(bubble.mesh);
            bubble.label.remove();
        });
        this.bubbles = [];
    }
}

window.Bubble3D = Bubble3D;
