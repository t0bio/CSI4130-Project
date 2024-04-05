import * as THREE from 'three';

class PineTree {
    constructor(scene, minHeight = 6, maxHeight = 14) {
        this.scene = scene;
        this.tree = new THREE.Group();
        this.tree.pineTreeReference = this; //reference back to PineTree from the group
        this.isPineTree = true; //custom property to check type
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
        const snowMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF, // Snow is white!
            shininess: 30, // Adjust for the desired amount of shininess
            specular: 0xAAAAAA, // Light grey specular highlights
        });
        const numLayers = Math.floor(height); // Adjust number of layers based on height
        const maxRadius = 2;
        
        for (let i = 0; i < numLayers; i++) {
            const radius = maxRadius - (i * maxRadius / numLayers);
            const layerHeight = height / numLayers;

            const foliageGeometry = new THREE.ConeGeometry(radius, layerHeight, 32);
            const snowGeometry = new THREE.ConeGeometry(radius - 0.01, layerHeight, 32);
            const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
            const snowMesh = new THREE.Mesh(snowGeometry, snowMaterial);

            foliageMesh.position.y = i * layerHeight;
            snowMesh.position.y = i * layerHeight + 0.1;
            
            // Offset each layer to create a more natural look
            var x = (Math.random() - 0.5) * 0.1 * radius;
            var z = (Math.random() - 0.5) * 0.1 * radius;
            foliageMesh.position.x = x;
            foliageMesh.position.z = z;
            snowMesh.position.x = x;
            snowMesh.position.z = z;

            // Rotate each layer slightly to give organic variation
            var y = Math.random() * Math.PI;
            foliageMesh.rotation.y = y;


            this.tree.add(foliageMesh);
            this.tree.add(snowMesh);
        }

        // Add the trunk last so it's layered below the foliage
        this.tree.add(trunkMesh);

        this.setPosition(0, 1, 0); // Initialize position at the origin
        this.addToScene();
        // console.log(this.scene.children);
        //console.log(this.tree instanceof PineTree);
        //console.log(this.tree instanceof THREE.Group);
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
