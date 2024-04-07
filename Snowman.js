import * as THREE from "three";

// this answers the texture mapping portion
class Snowman {
    constructor(scene) {
        this.scene = scene;
        this.snowman = new THREE.Group();
        this.loadModel();
    }
    loadModel() {
        let textureLoader = new THREE.TextureLoader();
        let snowmanTexture = textureLoader.load('./models/textures/snowtexture.jpg');
        let carrotTexture = textureLoader.load('./models/textures/carrottexture.jpg');

        let snowmanMaterial = new THREE.MeshBasicMaterial({ map: snowmanTexture });
        let carrotMaterial = new THREE.MeshBasicMaterial({ map: carrotTexture });

        //body structure
        var bodyGeometry = new THREE.SphereGeometry(1.25, 32, 32);
        var body = new THREE.Mesh(bodyGeometry, snowmanMaterial);
        body.position.set(0, 1.25, 0);
        this.snowman.add(body);

        // head 
        var headGeometry = new THREE.SphereGeometry(0.75, 32, 32);
        var head = new THREE.Mesh(headGeometry, snowmanMaterial);
        head.position.set(0, 3, 0);
        this.snowman.add(head);

        // eyes
        var eyeGeometry = new THREE.SphereGeometry(0.05, 32, 32);
        var eyematerial = new THREE.MeshBasicMaterial({ color: 0x000000 }); 
        var eye1 = new THREE.Mesh(eyeGeometry, eyematerial);
        var eye2 = new THREE.Mesh(eyeGeometry, eyematerial);
        eye1.position.set(0.35, 3.2, 0.7);
        eye2.position.set(-0.35, 3.2, 0.7);
        this.snowman.add(eye1);
        this.snowman.add(eye2);

        //nose
        var noseGeometry = new THREE.ConeGeometry(0.075, 0.3, 32);
        var nose = new THREE.Mesh(noseGeometry, carrotMaterial);
        nose.position.set(0, 3, 0.8);
        nose.rotation.x = Math.PI / 2;
        this.snowman.add(nose);

        this.scene.add(this.snowman);
    }

    setPosition(x, y, z) {
        this.snowman.position.set(x, y, z);
    }

    rotate(x, y, z) {
        this.snowman.rotation.x += x;
        this.snowman.rotation.y += y;
        this.snowman.rotation.z += z;
    }
}
export default Snowman;