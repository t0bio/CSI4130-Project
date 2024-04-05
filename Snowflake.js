import * as THREE from 'three';
import ammo from './ammo.js';

// initialization
const Ammo = await ammo.bind(window)();

class Snowflake {
    constructor(scene, physicsWorld){
        this.geometry = new THREE.SphereGeometry(0.2, 8, 8);
        this.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        scene.add(this.mesh);

        //physocs
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(Math.random() * 50 -25, Math.random() * 50 + 25, Math.random() * 50 - 25));

        let motions = new Ammo.btDefaultMotionState(transform);
        let mass = 1;
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let collisionShape = new Ammo.btSphereShape(0.2);

        collisionShape.calculateLocalInertia(mass, localInertia); // nonzero numbers make mass dynamic
        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motions, collisionShape, localInertia); 
        let body = new Ammo.btRigidBody(rbInfo);

        physicsWorld.addRigidBody(body);

        this.body = body;
        this.velocity = new Ammo.btVector3();
    }

    update(){
        let transform = new Ammo.btTransform();
        this.body.getMotionState().getWorldTransform(transform);
        let origin = transform.getOrigin();
        this.mesh.position.set(origin.x(), origin.y(), origin.z());
        let rotation = transform.getRotation();
        this.mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());

        if(this.mesh.position.y < -50){
            let velocity = this.body.getLinearVelocity();
            velocity.setX(Math.random() * 2 - 1);
            velocity.setY(-velocity.y());
            this.body.setLinearVelocity(velocity);
        }
    }
}

export default Snowflake;