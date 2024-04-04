import * as THREE from 'three';

class PineTree {
    constructor(scene, minHeight = 6, maxHeight = 14) {
        this.scene = scene;
        this.tree = new THREE.Group();
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
        this.initialize();
    }
    
    initialize() {
        // Randomize height within the given range
        const height = THREE.MathUtils.randFloat(this.minHeight, this.maxHeight);

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.01, 0.5, height, 12);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunkMesh.position.y = (height / 2)-1; // Center the trunk at ground level

        // Create multiple foliage layers based on the height of the tree
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x35682d });
        const numLayers = Math.floor(height); // Adjust number of layers based on height
        const maxRadius = 2;
        
        for (let i = 0; i < numLayers; i++) {
            const radius = maxRadius - (i * maxRadius / numLayers);
            const layerHeight = height / numLayers;
            const foliageGeometry = new THREE.ConeGeometry(radius, layerHeight, 32);
            const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);

            foliageMesh.position.y = i * layerHeight;
            
            // Offset each layer to create a more natural look
            foliageMesh.position.x = (Math.random() - 0.5) * 0.1 * radius;
            foliageMesh.position.z = (Math.random() - 0.5) * 0.1 * radius;

            // Rotate each layer slightly to give organic variation
            foliageMesh.rotation.y = Math.random() * Math.PI;

            this.tree.add(foliageMesh);
        }

        // Add the trunk last so it's layered below the foliage
        this.tree.add(trunkMesh);

        this.setPosition(0, 0, 0); // Initialize position at the origin
        this.addToScene();
    }
    
    addToScene() {
        if (this.scene && this.tree) {
            this.scene.add(this.tree);
        }
    }
    
    setPosition(x, y, z) {
        this.tree.position.set(x, y, z);
    }

    setScale(x, y, z) {
        this.tree.scale.set(x, y, z);
    }
}

export default PineTree;
