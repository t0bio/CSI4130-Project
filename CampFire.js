import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';

class CampFire {
    constructor(scene) {
        this.scene = scene;
        this.fireBase = new THREE.Group(); //initialize as an empty Group
        this.flameLight = new THREE.PointLight(0xffa500, 1, 10); //initialize the light
        this.flameLight.position.set(0, 1, 0);
        this.fireBase.add(this.flameLight); //adding the flame light to the group
        this.smokeParticles = [];
        this.scene.add(this.fireBase); //adding the fireBase group to the scene

        //loading the model and add smoke particles after
        this.loadModel().then(() => {
            this.addSmokeParticles();
        });
    }

    loadModel() {
        return new Promise((resolve, reject) => {
            const loader = new FBXLoader();
            loader.load('models/Campfire.fbx', (object) => {

                // Load the texture
                const textureLoader = new TextureLoader();
                textureLoader.load('models/textures/CampfireTexture.png', (texture) => {
                    object.traverse((child) => {
                        if (child.isMesh) {
                            //apply the texture to the material
                            child.material.map = texture;
                            child.material.needsUpdate = true;
                        }
                    });
                    
                    this.fireBase.add(object); //adding the loaded model to the group
                    resolve(); //resolve the promise after texture is applied
                }, undefined, (error) => {
                    console.error('An error happened while loading the texture.', error);
                    reject(error); //reject the promise on error
                });
                object.scale.set(0.01, 0.01, 0.01);

            }, undefined, (error) => {
                console.error('An error happened while loading the model.', error);
                reject(error); //reject the promise on error
            });
        });
    }

    addSmokeParticles() {
        const smokeMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
        for (let i = 0; i < 20; i++) {
            const smokeParticle = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), smokeMaterial);
            smokeParticle.position.set(
                (Math.random() - 0.5) * 2,
                1 + Math.random(), //adjust Y position based on your model
                (Math.random() - 0.5) * 2
            );
            this.fireBase.add(smokeParticle);
            this.smokeParticles.push(smokeParticle);
        }
    }

    animate() {
        //animate the flames
        this.flameLight.intensity = 1.5 + Math.sin(Date.now() * 0.005) * 0.5;

        //animate the smoke particles
        this.smokeParticles.forEach(particle => {
            particle.position.y += 0.02;
            if (particle.position.y > 2) {
                particle.position.y = 0;
            }
        });
    }

    setPosition(x, y, z) {
        //set the position of the entire campfire
        this.fireBase.position.set(x, y, z);
        //the flameLight and smokeParticles will follow since they are children of fireBase
    }

    rotate(x, y, z) {
        this.fireBase.rotation.x += x;
        this.fireBase.rotation.y += y;
        this.fireBase.rotation.z += z;
    }
}

export default CampFire;
