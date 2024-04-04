import * as THREE from "three";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class Bear {
    constructor(scene) {
        this.scene = scene;
        this.bear = new THREE.Group();
        this.loadModel();
    }

    loadModel() {
        return new Promise((resolve, reject) => {
            const loader = new FBXLoader();
            loader.load('models/Bear.fbx', (object) => {
                object.scale.set(0.01, 0.01, 0.01);
                this.bear.add(object); 
                this.scene.add(this.bear);
                resolve(); //resolve the promise
            }, undefined, function (error) {
                console.error(error);
                reject(error); //reject the promise
            });
        });
    }
    
    addToScene() {
        if (this.scene && this.bear) {
            this.scene.add(this.bear);
        }
    }
    
    setPosition(x, y, z) {
        this.bear.position.set(x, y, z);
    }

    rotate(x, y, z) {
        this.bear.rotation.x += x;
        this.bear.rotation.y += y;
        this.bear.rotation.z += z;
    }
}

export default Bear;