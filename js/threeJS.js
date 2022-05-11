import * as THREE from 'three'
import { GLTFLoader } from 'https://unpkg.com/three@0.123.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://unpkg.com/three@0.123.0/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.123.0/examples/jsm/controls/OrbitControls.js'
// import { RGBELoader } from 'https://unpkg.com/three@0.123.0/examples/jsm/loaders/RGBELoader.js'
// import { FlakesTexture } from 'https://unpkg.com/three@0.123.0/examples/jsm/textures/FlakesTexture.js'

// =============================GLOBAL VARIABLES=================================================
const canvas = document.querySelector('.overlay_canvas')
const scene = new THREE.Scene();
const renderer = new THREE.WebGL1Renderer({
	canvas: canvas,	
	antialias: true,
	alpha: true,
});

let model = null;
const pmremGenerator = new THREE.PMREMGenerator(renderer);

// ==============================================================================

const sizes = {
	width: 640,
	height: 480,
}

const loader = new GLTFLoader();
const rgbeLoader = new RGBELoader()

let pt_matrix_three_js_format = null;
let euler_angles = null;
let pitch = null;
let yaw = null;
let roll = null;

const loadModel = (file) => {
	return new Promise((res, rej) => {
			rgbeLoader.setPath('/assets/texture/').load('royal_esplanade_1k.hdr', (texture) => {
			const envMap = pmremGenerator.fromEquirectangular(texture).texture;

			texture.mapping = THREE.EquirectangularReflectionMapping;

    		// scene.background = envMap;
			scene.environment = envMap;	
			scene.position.set(0, 0, 0)
			
			texture.dispose();
			pmremGenerator.dispose();
			loader.load(file,(glb) => {
				const glasses = glb.scene;
				setInterval(() => {
					if(!facemeshData.length) return
					pt_matrix_three_js_format = new THREE.Matrix4().fromArray(PT_MATRIX)
					euler_angles = new THREE.Euler().setFromRotationMatrix(pt_matrix_three_js_format, 'XYZ')
					pitch = THREE.MathUtils.radToDeg(euler_angles['x']);
					yaw = THREE.MathUtils.radToDeg(euler_angles['y']);
					roll = THREE.MathUtils.radToDeg(euler_angles['z']);
					
					//PITCH
					glasses.rotation.x = pitch - (pitch * ( 98.7 / 100 )) //DONE
					//YAW
					glasses.rotation.y = -(yaw - (yaw * ( 98 / 100))) //DONE
					//ROLL
					glasses.rotation.z = -(roll - (roll * (98.15 / 100 ))) //DONE
	
					glasses.position.x = -xPosition //- (xPosition * (90 / 100))
					glasses.position.y = -yPosition //- (yPosition * (99 / 100))
					glasses.position.z = -zPosition //- (zPosition * (10 / 100))
					
					glasses.scale.x = distance(RIGHT_EYE[0], LEFT_EYE[0])
					glasses.scale.y = distance(RIGHT_EYE[0], LEFT_EYE[0])
					glasses.scale.z = distance(RIGHT_EYE[0], LEFT_EYE[0])

					console.log(glasses.rotation.x)
	
				});
				res(glasses)
				},(xhr) => {
					console.log( ( xhr.loaded / xhr.total * 100 ) + ' glasses % loaded' );
				},(error) => {
					rej(error)
				}
			);
		})
	})
}

const distance = (pos1, pos2) => {
	// get ratio of video element since x and y coordinates are given assuming square element
	let aspectRatio = 640/480;
  
	return Math.sqrt(
	  (pos1.x - pos2.x) ** 2 * aspectRatio + 
	  (pos1.y - pos2.y) ** 2 / aspectRatio + 
	  (pos1.z - pos2.z) ** 2
	);
}


const init = async () => {

	model = await loadModel('./assets/models/glassesgreen.glb') 
	scene.add(model);

	pmremGenerator.compileEquirectangularShader();

	const hemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
	scene.add( hemisphereLight );

	const pointLight1 = new THREE.PointLight( 0xffffff, 1);
	pointLight1.position.set( 150, 10, 0 );
	pointLight1.castShadow = false;
	scene.add( pointLight1 );

	const ambiantLight = new THREE.AmbientLight( 0xffffff , 1 ); // soft white light
	scene.add( ambiantLight );

	const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
	directionalLight.position.set(0, 1, 5)
	scene.add(directionalLight)


	const camera = new THREE.PerspectiveCamera( 20, sizes.width / sizes.height, 0.1, 1000); 
	camera.position.set( 0, 0, 30)
	camera.lookAt({x: canvas.width / 2, y: canvas.height / 2, z: 0, isVector3: true})
	scene.add(camera)

	const controls = new OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, - 0.2 );
	controls.update();

	renderer.setSize(sizes.width,sizes.height);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;

	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = .5;

	const animate = () => {
		requestAnimationFrame(animate)
		controls.update();
		renderer.render(scene, camera);
	}

	animate();

}

init()
// ==================================================================================




