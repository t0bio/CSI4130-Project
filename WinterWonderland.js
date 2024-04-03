import * as THREE from "three";
import dat from "dat.gui";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import PineTree from './PineTree.js';
import LogHut from './LogHut.js';

const scene = new THREE.Scene();

// background being a light blue color
scene.background = new THREE.Color(0x9EC9F5);

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

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(50, 50, 50);
scene.add(sunLight);

const pineTree1 = new PineTree(scene);
pineTree1.setPosition(1, 1, 0);
pineTree1.addToScene();

const pineTree2 = new PineTree(scene);
pineTree2.setPosition(5, 1, 0);
pineTree2.addToScene();

const logHut1 = new  LogHut(scene);
logHut1.setPosition(20, 0, 10);

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
