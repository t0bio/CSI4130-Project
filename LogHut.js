import * as THREE from "three";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class LogHut {
    constructor(scene) {
        this.scene = scene;
        this.loghut = new THREE.Group();
        this.scene.add(this.loghut);
        this.loadModel();
    }

    loadModel() {
        const loader = new FBXLoader();
        loader.load('models/LogHut.fbx', (object) => {
            this.loghut = object;
            this.loghut.scale.set(0.005, 0.005, 0.005);
            this.scene.add(this.loghut);
        }, undefined, function (error) {
            console.error(error);
        });
        this.setPosition(0, 0, 0); // Initialize position at the origin
        this.addToScene();
    }
    
    addToScene() {
        if (this.scene) {
            this.scene.add(this.tree);
        }
    }
    
    setPosition(x, y, z) {
        this.loghut.position.set(x, y, z);
    }
}

export default LogHut;
