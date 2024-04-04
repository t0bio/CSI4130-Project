import * as THREE from "three";
import dat from "dat.gui";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ammo from './ammo.js';

import PineTree from './PineTree.js';
import LogHut from './LogHut.js';

const scene = new THREE.Scene();
// light blue background
scene.background = new THREE.Color(0x9EC9F5);

// Ammojs initialization
// startAmmo();

let physicsWorld;
const Ammo = await ammo.bind(window)();

// function startAmmo() {
//     Ammo().then((Ammo) => {
//         Ammo = Ammo;
//         this.ammoClone = Ammo;
//         this.createAmmo(Ammo);
//         console.log("Ammo initialized");
//     });
// }


const snowGlobeShape = new THREE.SphereGeometry(50, 64, 32);
const snowGlobeMaterial = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF, // white color
    transparent: true,
    opacity: 0.2, // adjust for desired transparency
    shininess: 100, // make it shiny
    specular: 0x9EC9F5, // light blue tint for specularity
});
const snowGlobe = new THREE.Mesh(snowGlobeShape, snowGlobeMaterial);
scene.add(snowGlobe);
snowGlobe.position.set(0, 20, 0);

let planeRadius = Math.sqrt(50**2 - 20**2);
var circle = new THREE.CircleGeometry(planeRadius, 32);
var material = new THREE.MeshBasicMaterial({ color: 0x999999 }); // Yellow for visibility
var circlePlane = new THREE.Mesh(circle, material);
circlePlane.rotation.x = -Math.PI / 2;
scene.add(circlePlane);

let cosTheta = (50 - 30) / 50;
let theta = Math.acos(cosTheta);
const hemisphere = new THREE.SphereGeometry( 50, 64, 32, 0, Math.PI*2, 0, theta);
const hemisphereSurface = new THREE.Mesh(hemisphere, material);
hemisphereSurface.rotation.x = Math.PI;
hemisphereSurface.position.set(0, 20, 0);
scene.add(hemisphereSurface);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(50, 50, 50);
scene.add(sunLight);

// Function to get a random point within a circle
function getRandomPositionInCircle(radius) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * radius; // Square root for uniform distribution
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    return { x, z };
}

function generatePineTrees(numberOfTrees) {
    for (let i = 0; i < numberOfTrees; i++) {
        const position = getRandomPositionInCircle(planeRadius - 5);
        const pineTree = new PineTree(scene);
        
        // Assuming the ground plane is at y = 0
        pineTree.setPosition(position.x, 0, position.z);
        
        // Optionally randomize the scale of trees for variety
        const scale = THREE.MathUtils.randFloat(0.8, 1.2); // Scale factor between 0.8 and 1.2
        pineTree.setScale(scale, scale, scale);
    }

}

// Generate a random number of Pine Trees between 10 and 20
let treeControl = {
    numberOfTrees: 15  // Default number or you can start with 0
};
generatePineTrees(treeControl.numberOfTrees);

function clearPineTrees() {
    // Remove all pine trees from the scene
    // Note: This assumes that all pine trees are direct children of the scene
    // Adjust as necessary depending on your scene graph structure
    let toRemove = [];
    scene.traverse((child) => {
        if (child instanceof PineTree) {  // This check depends on your PineTree implementation
            toRemove.push(child);
        }
    });

    toRemove.forEach((child) => {
        scene.remove(child);
        if (child.geometry) child.geometry.dispose(); // Optional: Dispose geometry
        if (child.material) child.material.dispose(); // Optional: Dispose material
    });
}

function generateAndUpdatePineTrees() {
    clearPineTrees(); // Clear existing trees before generating new ones
    generatePineTrees(treeControl.numberOfTrees);
}

const pineTree1 = new PineTree(scene);
pineTree1.setPosition(1, 1, 0);
pineTree1.addToScene();

const pineTree2 = new PineTree(scene);
pineTree2.setPosition(5, 1, 0);
pineTree2.addToScene();

const logHut1 = new LogHut(scene);
logHut1.loadModel().then(() => {
    // After the model has loaded, set its position
    logHut1.setPosition(-5, 0, 5);
});

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

var light1 = new THREE.PointLight(0xFFFFFF, 1, 200);
light1.position.set(200, 200, 200);
scene.add(light1);


//setting up a spherical variable for the camera's position
let spherical = {
    radius: 100,
    theta: 4.7,//Math.PI,
    phi: 1.39//Math.PI/2
};

//Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.add(camera);//adding the camera to the scene

//Renderer
//will render the scene seen from the camera's point of view (will take a picture of your scene and provide you that picture on the canvas)
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

//Axes Helper
//to help me visualize coordinates
//https://threejs.org/docs/#api/en/helpers/AxesHelper
const axesHelper = new THREE.AxesHelper(20); //axes of length 5 units
scene.add(axesHelper);//adding the axes helper to the scene

//setting up the position of the camera using the spherical varible
camera.position.setFromSphericalCoords(spherical.radius, spherical.phi, spherical.theta);
camera.lookAt(0, 0, 0);//the camera revolves around the origin

//GUI
const gui = new dat.GUI();
//using the spherical properties to define multiple controls for the camera
gui.add(spherical, 'radius', 1, 200).onChange(updateCameraPosition);//distance from the origin
gui.add(spherical, 'theta', 0, Math.PI * 2).onChange(updateCameraPosition);//horizontal rotation
gui.add(spherical, 'phi', 0, Math.PI).onChange(updateCameraPosition);//verical rotation
gui.add(treeControl, 'numberOfTrees', 0, 50).step(1).onChange(generateAndUpdatePineTrees);

// Initial tree generation
generateAndUpdatePineTrees();
console.log(scene.children); // Inspect this in your browser console to see all direct children of the scene.

//function to updat the positon of the camera when the slider changes values
function updateCameraPosition() {
    camera.position.setFromSphericalCoords(spherical.radius, spherical.phi, spherical.theta);//changes the value of the radius, 
    camera.lookAt(0, 0, 0);//the camera revolves around the origin
}

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();