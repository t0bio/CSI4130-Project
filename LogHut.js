import * as THREE from "three";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class LogHut {
    constructor(scene) {
        this.scene = scene;
        this.loghut = new THREE.Group();
        this.loadModel();
    }

    loadModel() {
        return new Promise((resolve, reject) => {
            const loader = new FBXLoader();
            loader.load('models/MyLogHut.fbx', (object) => {
                object.scale.set(0.005, 0.005, 0.005);
                this.loghut.add(object); // Assuming this.loghut is a THREE.Group
                this.scene.add(this.loghut);
                resolve(); // Resolve the promise
            }, undefined, function (error) {
                console.error(error);
                reject(error); // Reject the promise
            });
        });
    }
    
    addToScene() {
        if (this.scene && this.loghut) {
            this.scene.add(this.loghut);
        }
    }
    
    setPosition(x, y, z) {
        this.loghut.position.set(x, y, z);
    }
}

export default LogHut;
