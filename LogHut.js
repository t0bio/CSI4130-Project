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
                this.loghut.add(object); 
                this.scene.add(this.loghut);
                resolve(); //resolve the promise
            }, undefined, function (error) {
                console.error(error);
                reject(error); //reject the promise
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

    rotate(x, y, z) {
        this.loghut.rotation.x += x;
        this.loghut.rotation.y += y;
        this.loghut.rotation.z += z;
    }
}

export default LogHut;
