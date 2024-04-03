import * as THREE from "three";

class PineTree {
    constructor(scene) {
        this.scene = scene;
        this.tree = new THREE.Group();
        this.initialize();
    }
    
    initialize() {
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.01, 0.5, 5, 12);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunkMesh.position.y = 1; // Raise the trunk above ground

        //create multiple foliage layers
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x35682d });
        const numLayers = 5;
        const height = 4;
        const maxRadius = 2;
        
        for (let i = 0; i < numLayers; i++) {
            const radius = maxRadius - (i * maxRadius / numLayers);
            const layerHeight = height / numLayers;
            const foliageGeometry = new THREE.ConeGeometry(radius, layerHeight, 32);
            const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);

            foliageMesh.position.y = (layerHeight / 2) + (i * layerHeight);
            
            //offset each layer to create a more natural look
            foliageMesh.position.x = (Math.random() - 0.5) * 0.2;
            foliageMesh.position.z = (Math.random() - 0.5) * 0.2;

            //rotate each layer slightly to give organic variation
            foliageMesh.rotation.y = Math.random() * Math.PI;

            this.tree.add(foliageMesh);
        }

        // Add the trunk last so it's layered below the foliage
        this.tree.add(trunkMesh);

        this.setPosition(0, 0, 0); // Initialize position at the origin
        this.addToScene();
    }
    
    addToScene() {
        if (this.scene) {
            this.scene.add(this.tree);
        }
    }
    
    setPosition(x, y, z) {
        this.tree.position.set(x, y, z);
    }
}

export default PineTree;
