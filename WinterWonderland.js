import * as THREE from "three";
import dat from "dat.gui";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import ammo from './ammo.js';
import {ImprovedNoise} from 'https://unpkg.com/three/examples/jsm/math/ImprovedNoise.js';

import PineTree from './PineTree.js';
import LogHut from './LogHut.js';
import CampFire from './CampFire.js';
import Bear from './Bear.js';
import Snowman from "./Snowman.js";

const scene = new THREE.Scene();
// light blue background
scene.background = new THREE.Color(0x9EC9F5);

// Ammojs initialization
const Ammo = await ammo.bind(window)();

// noise 
let noise = new ImprovedNoise();

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
let snowGlobeCollisionShape = new Ammo.btSphereShape(48);

let snowGlobeRbInfo = new Ammo.btRigidBodyConstructionInfo(snowGlobeMass, snowGlobeMotion, snowGlobeCollisionShape, snowGlobeLocalInertia);
let snowGlobeBody = new Ammo.btRigidBody(snowGlobeRbInfo);

physicsWorld.addRigidBody(snowGlobeBody);

// class for the snowflake shape
class Snowflake {
    constructor(scene, physicsWorld){
        this.geometry = new THREE.SphereGeometry(0.2, 8, 8);
        // need a material that can reflect light
        this.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        scene.add(this.mesh);

        // let y = Math.random() * 100 -50;

        //coords
        let radius = 45;
        let theta = Math.random() * Math.PI * 2;
        let phi = Math.acos(Math.random() * 2 - 1);

        //positions
        let x = radius * Math.sin(phi) * Math.cos(theta);
        let y = radius * Math.sin(phi) * Math.sin(theta)+ 20;
        let z = radius * Math.cos(phi);

        //physocs
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(x,y,z));
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
        this.noiseOffset = Math.random() * 1000;
        this.speed = 0.01;
        this.turbulence = 1;
        this.color = [255, 255, 255]
    }

    update(){
        let noiseValue = noise.noise(this.noiseOffset, 0, 0) * perlinparams.turbulence; // noise value

        this.velocity.setX(this.velocity.x() + (noiseValue * 2 - 1) * 0.01);
        this.velocity.setZ(this.velocity.z() + (noiseValue * 2 - 1) * 0.01);

        this.body.getMotionState().getWorldTransform(this.transform);
        let origin = this.transform.getOrigin();
        this.mesh.position.set(origin.x(), origin.y(), origin.z());
        let rotation = this.transform.getRotation();
        this.mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());

        let distanceFromCenter;
        do {
            this.mesh.position.set(
                Math.random() * 100 - 50,
                Math.random() * 100 ,
                Math.random() * 100 - 50
            );
            distanceFromCenter = this.mesh.position.distanceTo(new THREE.Vector3(0, 20, 0));
        } while (distanceFromCenter > 48);

        if(this.mesh.position.y < -50){
            this.body.getLinearVelocity(this.velocity);
            this.velocity.setX(Math.random() * 2 - 1);
            this.velocity.setY(10);
            this.body.setLinearVelocity(this.velocity);
        }
        this.noiseOffset += perlinparams.speed;
        this.material.color.setRGB(this.color[0] / 255, this.color[1] / 255, this.color[2] / 255);
    }
}

var textureLoader = new THREE.TextureLoader();
var snowTexture = textureLoader.load('./models/textures/snowtexture.jpg');
var normalMap = textureLoader.load('./models/textures/NormalMap.png');

// using shadermaterial bc how tf else are we supposed to do this lmao 
var bumpmap = new THREE.ShaderMaterial({
    uniforms: {
        bumpTexture: { type: 't', value: normalMap }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
            vNormal = normal;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,

    fragmentShader: `
        uniform sampler2D bumpTexture;
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
            vec3 normal = texture2D(bumpTexture, vUv).xyz * 2.0 - 1.0;
            normal = normalize(normal);
            float lighting = dot(normal, vec3(0.0, 0.0, 1.0));
            gl_FragColor = vec4(vec3(lighting), 1.0);
        }`
    }
);
// TODO: generate snowflakes inside the globe
// snowflakes
let snowflakes = [];
for(let i = 0; i < 1000; i++){
    snowflakes.push(new Snowflake(scene, physicsWorld));
}

let planeRadius = Math.sqrt(50**2 - 20**2);
var circle = new THREE.CircleGeometry(planeRadius, 32);
var snowMaterial = new THREE.MeshPhongMaterial({ map: snowTexture, side: THREE.DoubleSide});
// var circlePlane = new THREE.Mesh(circle, snowMaterial);

function PerlinTerrain() {
    var geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
    for (let i = 0; i < geometry.vertices.length; i++) {
        var vertex = geometry.vertices[i];
        vertex.z = noise.noise(vertex.x / 10, vertex.y / 10, 0) * 100;
    }
    geometry.computeVertexNormals();
    var material = new THREE.MeshPhongMaterial({ map: snowTexture, side: THREE.DoubleSide });
    var perlinplane = new THREE.Mesh(geometry, material);
    perlinplane.rotation.x = -Math.PI / 2;
    return perlinplane;
    
}

var currentTerrain = circlePlane;
function updateTerrain() {
    scene.remove(currentTerrain);
    currentTerrain = PerlinTerrain();
    scene.add(currentTerrain);
}

var circlePlane = new THREE.Mesh(circle, bumpmap);
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

function isChildOf(child, parent) {
    let node = child.parentNode;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
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
        if (child instanceof THREE.Group) {
            if (child instanceof PineTree) {  // This check depends on your PineTree implementation
                toRemove.push(child);
            }  // This check depends on your PineTree implementation
        }
    });
    for (let object of scene.children) {
        if (object.pineTreeReference instanceof PineTree) {
            toRemove.push(object);
        }
    }

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

var snowman = new Snowman(scene);
snowman.setPosition(6.5, 0, 6.5);
snowman.rotate(0, THREE.MathUtils.degToRad(90), 0)

const campFire = new CampFire(scene);
campFire.loadModel().then(() => {
    campFire.setPosition(0, 0, 0); 
    campFire.rotate(0, THREE.MathUtils.degToRad(-45), 0);
});

const bearModel = new Bear(scene);
bearModel.setPosition(5, 0, -5);
bearModel.rotate(0, THREE.MathUtils.degToRad(180), 0);
bearModel.addToScene();

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

// Define the array of points that make up the path
const points = [
    new THREE.Vector3(-13, 0, 12),
    new THREE.Vector3(-8, 0, -8),
    new THREE.Vector3(10, 0, -10),
    new THREE.Vector3(7, 0, 6),
    new THREE.Vector3(-13, 0, 12),
    new THREE.Vector3(-8, 0, -8),
    new THREE.Vector3(10, 0, -10),
    new THREE.Vector3(7, 0, 6),
    new THREE.Vector3(-13, 0, 12),
    // Add as many points as you want to create the desired path
];
// Create the curve from the points
const curve = new THREE.CatmullRomCurve3(points);

// To visualize the path (optional)
const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
const material = new THREE.LineBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0
});
const curveObject = new THREE.Line(geometry, material);
scene.add(curveObject);


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
controls.autoRotate = false;

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
    
    bearCamera.rotation.y = bearModel.bear.rotation.y + Math.PI;
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

const perlinparams = {
    speed: 0.01,
    turbulence: 1,
    color: [255, 255, 255]
};

controls.toggleRotate = function() {
    controls.autoRotate = !this.autoRotate;
};

const gui = new dat.GUI();
//using the spherical properties to define multiple controls for the camera
gui.add(spherical, 'radius', 1, 200).onChange(updateCameraPosition);//distance from the origin
gui.add(spherical, 'theta', 0, Math.PI * 2).onChange(updateCameraPosition);//horizontal rotation
gui.add(spherical, 'phi', 0, Math.PI).onChange(updateCameraPosition);//verical rotation
gui.add(treeControl, 'numberOfTrees', 30, 200).step(1).onChange(generateAndUpdatePineTrees);
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
gui.add(controls, 'toggleRotate').name('Toggle Auto Rotate');

let params = gui.addFolder('Perlin Noise Parameters');
params.add(perlinparams, 'speed', 0, 0.01).onChange(function(val) {
    noise.speed = val
    });
params.add(perlinparams, 'turbulence', 0, 10).onChange(function(val) {
    noise.turbulence = val
    });
params.addColor(perlinparams, 'color').onChange(function(val) {
    snowflakes.forEach(snowflake => { snowflake.color = val; });
});

let terrainopt = {Terrain: 'Procedural Bump Map'};

gui.add(terrainopt, 'Terrain', ['Procedural Bump Map', 'Perlin Plane']).onChange(function(val) {
    if (val === 'Procedural Bump Map') {
        updateTerrain(circlePlane);
    } else if (val === 'Perlin Plane') {
        var perlin = PerlinTerrain()
        updateTerrain(perlin);
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

// const cameraNode = new THREE.Object3D();

// cameraNode.add(bearCamera);

document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body && cameraOptions.Camera === 'Bear View') {
        // Sensitivity factors determine how much the bear and camera rotate based on mouse movement
        const bearRotationSensitivity = 0.002;
        const cameraPitchSensitivity = 0.002;

        // Rotate the bear around the Y-axis
        bearModel.bear.rotation.y -= event.movementX * bearRotationSensitivity;

        // Adjust the camera's pitch (rotation around the X-axis)
        // Limit the rotation so the camera doesn't flip over the top or bottom
        // bearCamera.rotation.x -= event.movementY * cameraPitchSensitivity;
        // bearCamera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, bearCamera.rotation.x));

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

let t = 0;
const clock = new THREE.Clock();

function initBearPosition() {
    const position = curve.getPoint(0);
    bearModel.setPosition(position.x, position.y, position.z);
}

initBearPosition(); // Set the bear's initial position

function animate() {
    requestAnimationFrame(animate);

    // to updat snowflakes
    let deltaTime1 = 1 / 60;
    physicsWorld.stepSimulation(deltaTime1, 10);

    controls.update();

    snowflakes.forEach(snowflake => { snowflake.update(); });

    campFire.animate(); // Animate the campfire
    // updateBearPosition(); //update bear position from keyboard input

    if (controls.autoRotate) {
        spherical.theta += 0.01;
        updateCameraPosition();
    }

    if (cameraOptions.Camera === 'Bear View') {
        updateBearPosition();
        updateBearCameraPosition(); // Update only if the bear camera is active
    }

    // Determine which camera to render with based on the GUI selection
    const activeCamera = cameraOptions.Camera === 'Bear View' ? bearCamera : camera;

    const deltaTime = clock.getDelta();

    // Update bear's position along the curve
    t += deltaTime * 0.1; // This controls the speed of the bear along the path
    t = t % 1; // Loop t between 0 and 1 to keep the bear walking indefinitely

    const position = curve.getPoint(t); // Get the point at t
    bearModel.setPosition(position.x, position.y, position.z); // Set bear's position

    const tangent = curve.getTangent(t).normalize(); // Get the tangent at t
    bearModel.bear.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

    bearModel.update(deltaTime); // Update the bear's animation

    renderer.render(scene, activeCamera);
    gui.updateDisplay();
}

animate();