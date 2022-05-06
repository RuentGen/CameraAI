import * as THREE from 'three'
import { GLTFLoader } from 'https://unpkg.com/three@0.123.0/examples/jsm/loaders/GLTFLoader.js';

const animatedCanvas = document.querySelector(".animation_canvas")
const animationScene = new THREE.Scene();
const animationRenderer = new THREE.WebGLRenderer({canvas: animatedCanvas, alpha: true});
const animatedGLTFloader = new GLTFLoader();

const frameSize = {
    width: 640,
    height: 480
}
const animationCam = new THREE.PerspectiveCamera(75, frameSize.width / frameSize.height, 0.1, 1000);

const init = () => {
    
    animationRenderer.setSize(frameSize.width, frameSize.height);
    animationRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    animationRenderer.shadowMap.enabled = true;
    // Load a GLB/GLTF resource
    animatedGLTFloader.load(
        // resource URL
        'assets/models/earings.gltf',
        // called when the resource is loaded
        ( gltf ) => {
            const hikaw = gltf.scene;
            hikaw.scale.set(0.5, 0.5, 0.5)
            hikaw.position.set(0, 0.3, -1)
            // hikaw.scene; // THREE.Group
            // hikaw.cameras; // Array<THREE.Camera>
            // hikaw.animations; // Array<THREE.AnimationClip>
            // hikaw.scenes; // Array<THREE.Group>
            // hikaw.asset; // Object
            animationScene.add(hikaw);
        },
        
        // called while loading is progressing
        ( xhr ) => {
            console.log( ( xhr.loaded / xhr.total * 100 ) + ' earings % loaded' );
        },

        // called when loading has errors
        ( error ) => {
            console.log( 'An error happened', error );
        }
    );

    const ambiantLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    animationScene.add( ambiantLight );


    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(0, 0, 5)
    animationScene.add(directionalLight)

    
    const animates = () => {
        requestAnimationFrame(animates)
        animationRenderer.render(animationScene, animationCam);
    }

    animates();

}







// INITIALIZE INITIAL FUNTION
init()