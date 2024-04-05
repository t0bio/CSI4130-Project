import * as THREE from "three";
import dat from "dat.gui";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import ammo from './ammo.js';

import PineTree from './PineTree.js';
import LogHut from './LogHut.js';
import CampFire from './CampFire.js';
import Bear from './Bear.js';

const scene = new THREE.Scene();
// light blue background
scene.background = new THREE.Color(0x9EC9F5);

// Ammojs initialization
const Ammo = await ammo.bind(window)();

let physicsWorld;;
let cillisionconfig = new Ammo.btDefaultCollisionConfiguration();
let dispatcher = new Ammo.btCollisionDispatcher(cillisionconfig);
let solver = new Ammo.btSequentialImpulseConstraintSolver();
let overlappingPairCache = new Ammo.btDbvtBroadphase();
physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, cillisionconfig);
physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));


// function startAmmo() {
//     Ammo().then((Ammo) => {
//         Ammo = Ammo;
//         this.ammoClone = Ammo;
//         this.createAmmo(Ammo);
//         console.log("Ammo initialized");
//     });
// }

// class for the snowflake shape
class Snowflake {
    constructor(scene, physicsWorld){
        this.geometry = new THREE.SphereGeometry(0.2, 8, 8);
        // need a material that can reflect light
        this.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        scene.add(this.mesh);

        //physocs
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(Math.random() * 50 -25, Math.random() * 50 + 25, Math.random() * 50 - 25));
        this.velocity = new Ammo.btVector3();

        let motions = new Ammo.btDefaultMotionState(this.transform);
        let mass = 1;
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let collisionShape = new Ammo.btSphereShape(0.2);

        collisionShape.calculateLocalInertia(mass, localInertia); // nonzero numbers make mass dynamic
        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motions, collisionShape, localInertia); 
        let body = new Ammo.btRigidBody(rbInfo);

        physicsWorld.addRigidBody(body);

        this.body = body;
    }

    update(){
        this.body.getMotionState().getWorldTransform(this.transform);
        let origin = this.transform.getOrigin();
        this.mesh.position.set(origin.x(), origin.y(), origin.z());
        let rotation = this.transform.getRotation();
        this.mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());

        if(this.mesh.position.y < -50){
            this.body.getLinearVelocity(this.velocity);
            this.velocity.setX(Math.random() * 2 - 1);
            this.velocity.setY(-this.velocity.y());
            this.body.setLinearVelocity(this.velocity);
        }
    }
}

// snowflakes
let snowflakes = [];
for(let i = 0; i < 1000; i++){
    snowflakes.push(new Snowflake(scene, physicsWorld));
}

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

// so the snowflakes interact with the globe,
let snowGlobeTransform = new Ammo.btTransform();
snowGlobeTransform.setIdentity();
snowGlobeTransform.setOrigin(new Ammo.btVector3(0, 20, 0));

let snowGlobeMotion = new Ammo.btDefaultMotionState(snowGlobeTransform);
let snowGlobeMass = 0;
let snowGlobeLocalInertia = new Ammo.btVector3(0, 0, 0);
let snowGlobeCollisionShape = new Ammo.btSphereShape(50);

let snowGlobeRbInfo = new Ammo.btRigidBodyConstructionInfo(snowGlobeMass, snowGlobeMotion, snowGlobeCollisionShape, snowGlobeLocalInertia);
let snowGlobeBody = new Ammo.btRigidBody(snowGlobeRbInfo);

physicsWorld.addRigidBody(snowGlobeBody);

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

const bearModel = new Bear(scene);
bearModel.loadModel().then(() => {
    bearModel.setPosition(5, 0, -5);
    bearModel.rotate(0, THREE.MathUtils.degToRad(180), 0);
});

function updateBearPosition() {
    const speed = 0.05; // Adjust the speed as necessary

    if (keyStates['KeyW']) {
        bearModel.bear.position.z -= speed;
    }
    if (keyStates['KeyS']) {
        bearModel.bear.position.z += speed;
    }
    if (keyStates['KeyA']) {
        bearModel.bear.position.x -= speed;
    }
    if (keyStates['KeyD']) {
        bearModel.bear.position.x += speed;
    }
}


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

const bearCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const cameraOffset = {
    x: 0,
    y: 5,  // Adjust height
    z: 7, // Distance behind the bear
};

function updateBearCameraPosition() {
    bearCamera.position.x = bearModel.bear.position.x + cameraOffset.x;
    bearCamera.position.y = bearModel.bear.position.y + cameraOffset.y;
    bearCamera.position.z = bearModel.bear.position.z + cameraOffset.z;
    bearCamera.lookAt(bearModel.bear.position);
}


//GUI
const lightOptions = {
    Light: 'Sunlight' // Default to sunlight
};

const keyStates = {
    'KeyW': false,
    'KeyA': false,
    'KeyS': false,
    'KeyD': false,
};
const cameraOptions = {
    Camera: 'Globe View', // Default camera view
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
gui.add(cameraOptions, 'Camera', ['Globe View', 'Bear View']).onChange(function(val) {
    const crosshair = document.getElementById('crosshair');
    if (val === 'Bear View') {
        scene.remove(camera);
        scene.add(bearCamera);
        document.body.requestPointerLock();
        crosshair.style.display = 'block'; // Show crosshair
    } else {
        scene.remove(bearCamera);
        scene.add(camera);
        document.exitPointerLock();
        crosshair.style.display = 'none'; // Hide crosshair
    }
});


document.addEventListener('keydown', (event) => {
    if (keyStates.hasOwnProperty(event.code)) {
        keyStates[event.code] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keyStates.hasOwnProperty(event.code)) {
        keyStates[event.code] = false;
    }
});

document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body && cameraOptions.Camera === 'Bear View') {
        // Sensitivity factors determine how much the bear and camera rotate based on mouse movement
        const bearRotationSensitivity = 0.002;
        const cameraPitchSensitivity = 0.002;

        // Rotate the bear around the Y-axis
        bearModel.bear.rotation.y -= event.movementX * bearRotationSensitivity;

        // Adjust the camera's pitch (rotation around the X-axis)
        // Limit the rotation so the camera doesn't flip over the top or bottom
        bearCamera.rotation.x -= event.movementY * cameraPitchSensitivity;
        bearCamera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, bearCamera.rotation.x));

        // Since the camera is a child of the bear in this setup, its rotation is relative to the bear's rotation
        // If you want the camera to only rotate up and down without following the bear's left/right rotation,
        // you'll need a more complex setup, possibly involving additional nodes or different parent-child relationships
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

    // to updat snowflakes
    let deltaTime = 1 / 60;
    physicsWorld.stepSimulation(deltaTime, 10);

    snowflakes.forEach(snowflake => { snowflake.update(); });

    campFire.animate(); // Animate the campfire
    updateBearPosition(); //update bear position from keyboard input

    if (cameraOptions.Camera === 'Bear View') {
        updateBearCameraPosition(); // Update only if the bear camera is active
    }

    // Determine which camera to render with based on the GUI selection
    const activeCamera = cameraOptions.Camera === 'Bear View' ? bearCamera : camera;

    renderer.render(scene, activeCamera);
    gui.updateDisplay();
}

animate();