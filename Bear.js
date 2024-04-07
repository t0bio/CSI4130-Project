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
          this.model = model;
          model.scale.setScalar(0.01);
          this.scene.add(this.model);
    
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

    update(deltaTime) {
        if (this.mixer) { // Only update the mixer if it's not null
            this.mixer.update(deltaTime);
        }
    }
}

export default Bear;
