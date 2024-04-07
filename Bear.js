import * as THREE from "three";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class Bear {
    constructor(scene) {
        this.scene = scene;
        this.bear = new THREE.Group();
        this.mixer = null;
        this.loadModel();
    }   

    loadModel() {
        // Use FBXLoader for FBX files
        const loader = new FBXLoader();
        loader.load('models/BearArmor_Animation_Run.fbx', (model) => {
          this.bear.add(model);
          this.scene.add(this.bear);
          this.bear.scale.set(0.01, 0.01, 0.01);
          this.model = model;
          // Animation setup
          this.mixer = new THREE.AnimationMixer(this.model);
    
          // Play all animations if there are more, or a specific one
          this.model.animations.forEach((clip) => {
            this.mixer.clipAction(clip).play();
          });
    
          // Adjust scale, position, etc., as needed
        }, undefined, (error) => {
          console.error('An error happened while loading the model', error);
        });
    }
    

    addToScene() {
        this.scene.add(this.bear);
    }
    
    setPosition(x, y, z) {
        this.bear.position.set(x, y, z);
    }

    rotate(x, y, z) {
        this.bear.rotation.x += x;
        this.bear.rotation.y += y;
        this.bear.rotation.z += z;
    }

    lookAt(x, y, z) {
        this.bear.lookAt(new THREE.Vector3(x, y, z));
    }

    update(deltaTime) {
        if (this.mixer) { // Only update the mixer if it's not null
            this.mixer.update(deltaTime);
        }
    }
}

export default Bear;
