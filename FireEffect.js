import * as THREE from 'three';
//import glMatrix from "./scripts/glMatrix";
import { newGLContext, DrawingContext } from "./scripts/gl_context";
import {
  MatrixNode,
  ShaderNode,
  TextureNode,
  FunctionNode,
  SlicedCubeNode
} from "./scripts/scene_graph";

const { mat4, vec3 } = glMatrix;

class FireEffect {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        var gl = newGLContext(this.canvas, true);
        this.context = new DrawingContext(gl);
        
        this.init();
    }

    init() {
        var gl = this.context.gl;
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.enable(gl.BLEND);

        this.initNodes();
        this.initTextures();
    }

    initNodes() {
        var gl = this.context.gl;

        this.projectionNode = new MatrixNode("projectionMatrix", (matrix, context) => {
            mat4.perspective(45, context.gl.viewportWidth / context.gl.viewportHeight, 0.1, 100.0, matrix);
        });

        // The camera and modelView nodes might need to be adapted based on your scene
        this.cameraNode = new LookAtCameraNode(this.canvas, "modelViewMatrix");
        this.modelViewNode = new MatrixNode("modelViewMatrix", (mv) => {
            // Add any transformations here
        });

        // Shader node setup might need to be adapted to your shaders and uniform needs
        this.shaderNode = new ShaderNode("shader-vs", "shader-fs", [
            // Assuming TextureNodes are similar to THREE.js but would need to be adapted to your setup
            new TextureNode(0, "/textures/nzw.png", "nzw", gl.LINEAR, gl.REPEAT),
            new TextureNode(1, "/textures/firetex.png", "fireProfile", gl.LINEAR, gl.CLAMP_TO_EDGE)
        ]);

        this.volumeNode = new SlicedCubeNode("modelViewMatrix", 0.05, "pos", [
            // Cube vertices and texture coordinates setup
        ]);

        // Construct the scene graph
        this.shaderNode.children.push(this.projectionNode);
        this.projectionNode.children.push(this.cameraNode);
        this.cameraNode.children.push(this.modelViewNode);
        this.modelViewNode.children.push(this.volumeNode);
    }

    initTextures() {
        // Texture initialization logic
    }

    update(deltaTime) {
        // Update logic for the fire effect
        if (!this.time) this.time = 0;
        this.time += deltaTime;
        
        var time_loc = this.context.gl.getUniformLocation(this.context.getShaderProgram(), "time");
        this.context.gl.uniform1f(time_loc, this.time);
    }

    render() {
        var gl = this.context.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // You would call your context or renderer's draw method here
        // For example: this.context.draw(this.shaderNode);
    }
}

export default FireEffect;
