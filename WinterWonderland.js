import * as THREE from "three";
import dat from "dat.gui";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ammo from './ammo.js';

import PineTree from './PineTree.js';
import LogHut from './LogHut.js';
import CampFire from './CampFire.js';

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
var snowMaterial = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF, // Snow is white!
    shininess: 30, // Adjust for the desired amount of shininess
    specular: 0xAAAAAA, // Light grey specular highlights
});
var circlePlane = new THREE.Mesh(circle, snowMaterial);
circlePlane.rotation.x = -Math.PI / 2;
scene.add(circlePlane);

let cosTheta = (50 - 30) / 50;
let theta = Math.acos(cosTheta);
const hemisphere = new THREE.SphereGeometry( 50, 64, 32, 0, Math.PI*2, 0, theta);
const hemisphereSurface = new THREE.Mesh(hemisphere, snowMaterial);
hemisphereSurface.rotation.x = Math.PI;
hemisphereSurface.position.set(0, 20, 0);
scene.add(hemisphereSurface);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(50, 50, 50);
scene.add(sunLight);

const moonLight = new THREE.DirectionalLight(0x7788AA, 0.5); // Bluish, dimmer light for moonlight
moonLight.position.set(-50, 30, -50);
scene.add(moonLight);
moonLight.visible = false; // Start with moonlight off

// Function to get a random point within a circle
function getRandomPositionInCircle(radius, exclusionRadius) {
    let position;
    do {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * radius;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        position = { x, z };
    } while (Math.sqrt(position.x * position.x + position.z * position.z) < exclusionRadius);
    return position;
}

function generatePineTrees(numberOfTrees) {
    const exclusionRadius = 13; // Define the radius of the area to avoid
    for (let i = 0; i < numberOfTrees; i++) {
        // Generate positions while avoiding a circular area defined by exclusionRadius
        const position = getRandomPositionInCircle(planeRadius - 5, exclusionRadius);
        const pineTree = new PineTree(scene);
        
        // Set the position of the pine tree
        pineTree.setPosition(position.x, 1, position.z);
        
        // Randomize the scale of trees for variety
        const scale = THREE.MathUtils.randFloat(0.8, 1.2);
        pineTree.setScale(scale, scale, scale);
    }
}

let treeControl = {
    numberOfTrees: 30  // Default number or you can start with 0
};
generatePineTrees(treeControl.numberOfTrees);

function clearPineTrees() {
    // Remove all pine trees from the scene
    // Note: This assumes that all pine trees are direct children of the scene
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
pineTree1.setPosition(6, 1, 6);
pineTree1.addToScene();

const logHut1 = new LogHut(scene);
logHut1.loadModel().then(() => {
    logHut1.setPosition(-5, 0, 5);
    logHut1.rotate(0, THREE.MathUtils.degToRad(135), 0);
});


const campFire = new CampFire(scene);
campFire.loadModel().then(() => {
    campFire.setPosition(0, 0, 0); 
    campFire.rotate(0, THREE.MathUtils.degToRad(-45), 0);
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
const lightOptions = {
    Light: 'Sunlight' // Default to sunlight
};

const gui = new dat.GUI();
//using the spherical properties to define multiple controls for the camera
gui.add(spherical, 'radius', 1, 200).onChange(updateCameraPosition);//distance from the origin
gui.add(spherical, 'theta', 0, Math.PI * 2).onChange(updateCameraPosition);//horizontal rotation
gui.add(spherical, 'phi', 0, Math.PI).onChange(updateCameraPosition);//verical rotation
gui.add(treeControl, 'numberOfTrees', 0, 50).step(1).onChange(generateAndUpdatePineTrees);
gui.add(lightOptions, 'Light', ['Sunlight', 'Moonlight']).onChange(function(val) {
    if (val === 'Sunlight') {
        sunLight.visible = true;
        moonLight.visible = false;
        scene.background = new THREE.Color(0x9EC9F5); // Light blue for day
    } else if (val === 'Moonlight') {
        sunLight.visible = false;
        moonLight.visible = true;
        scene.background = new THREE.Color(0x01010f); // Navy blue for night
    }
});

// Initial tree generation
generateAndUpdatePineTrees();
console.log(scene.children); 

//function to updat the positon of the camera when the slider changes values
function updateCameraPosition() {
    camera.position.setFromSphericalCoords(spherical.radius, spherical.phi, spherical.theta);//changes the value of the radius, 
    camera.lookAt(0, 0, 0);//the camera revolves around the origin
}

function animate() {
    requestAnimationFrame(animate);

    campFire.animate(); // Animate the campfire

    renderer.render(scene, camera);
    gui.updateDisplay();
}

animate();