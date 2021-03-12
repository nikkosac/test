import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import ThreeMeshUI from '../src/three-mesh-ui.js';
import VRControl from './utils/VRControl.js';
import ShadowedLight from './utils/ShadowedLight.js';

import FontJSON from './assets/Roboto-msdf.json';
import FontImage from './assets/Roboto-msdf.png';

let scene, camera, renderer, controls, vrControl;
let meshContainer, meshes, currentMesh;
let container,container1,container2,container3;
let objsToTest = [];
let x = 1;

let both,both1;
window.addEventListener( 'load', init );
window.addEventListener('resize', onWindowResize );

// compute mouse position in normalized device coordinates
// (-1 to +1) for both directions.
// Used to raycasting against the interactive elements

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;

window.addEventListener( 'pointermove', ( event )=>{
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
});

window.addEventListener( 'pointerdown', ()=> { selectState = true });

window.addEventListener( 'pointerup', ()=> { selectState = false });

window.addEventListener( 'touchstart', ( event )=> {
	selectState = true;
	mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
});

window.addEventListener( 'touchend', ()=> {
	selectState = false;
	mouse.x = null;
	mouse.y = null;
});

//

function init() {

	////////////////////////
	//  Basic Three Setup
	////////////////////////

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x505050 );

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;
	document.body.appendChild( VRButton.createButton(renderer) );
	document.body.appendChild( renderer.domElement );

	// Orbit controls for no-vr

	controls = new OrbitControls( camera, renderer.domElement );
	camera.position.set( 0, 1.6, 0 );
	controls.target = new THREE.Vector3( 0, 1, -1.8 );

	/////////
	// Room
	/////////

	const room = new THREE.LineSegments(
        new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
		new THREE.LineBasicMaterial( { color: 0x808080 } )
	);
	
	const roomMesh = new THREE.Mesh(
		new THREE.BoxGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
		new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
	);

	scene.add( room );
    objsToTest.push(roomMesh);

	//////////
	// Light
	//////////

	const light = ShadowedLight({
		z: 10,
		width: 6,
		bias: -0.0001
	});

	const hemLight = new THREE.HemisphereLight( 0x808080, 0x606060 );

	scene.add( light, hemLight );

	////////////////
	// Controllers
	////////////////

	vrControl = VRControl( renderer, camera, scene );

	scene.add( vrControl.controllerGrips[ 0 ], vrControl.controllers[ 0 ],vrControl.controllerGrips[ 1 ], vrControl.controllers[ 1 ] );

	vrControl.controllers[ 0 ].addEventListener( 'selectstart', ()=> { selectState = true } );
	vrControl.controllers[ 0 ].addEventListener( 'selectend', ()=> { selectState = false } );

	////////////////////
	// Primitive Meshes
	////////////////////

	meshContainer = new THREE.Group();
	meshContainer.position.set( 0, 1, -1.9 );
	scene.add( meshContainer );

	//

	const sphere = new THREE.Mesh(
		new THREE.IcosahedronBufferGeometry( 0.3, 1 ),
		new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true })
	);
	
	const box = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 0.45, 0.45, 0.45 ),
		new THREE.MeshStandardMaterial({ color: 0x643de3, flatShading: true })
	);
	
	const cone = new THREE.Mesh(
		new THREE.ConeBufferGeometry( 0.28, 0.5, 10 ),
		new THREE.MeshStandardMaterial({ color: 0xe33d4e, flatShading: true })
	);

	//

	sphere.visible = box.visible = cone.visible = false;

	meshContainer.add( sphere, box, cone );

	meshes = [ sphere, box, cone ];
	currentMesh = 0;

	showMesh( currentMesh );
 	
 	//////////
	// Panel
	//////////

	makePanel();

	//

	renderer.setAnimationLoop( loop );

};

// Shows the primitive mesh with the passed ID and hide the others

function showMesh( id ) {

	meshes.forEach( (mesh, i)=> {
		mesh.visible = i === id ? true : false;
	});

};

///////////////////
// UI contruction
///////////////////

function makePanel() {

	// Container block, in which we put the two buttons.
	// We don't define width and height, it will be set automatically from the children's dimensions
	// Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

	both = new THREE.Group();

	container = new ThreeMeshUI.Block({
		justifyContent: 'center',
		alignContent: 'center',
		contentDirection: 'row-reverse',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.5,
		borderRadius: 0,
		width: 2,
		height: 1,
		backgroundOpacity: 1,
		backgroundColor: new THREE.Color(0x303030),
	}).add(
		new ThreeMeshUI.Text({
			fontSize: 0.3,
			content: "add"
		}),
	);

	container.position.set( -.05, 0.045, .04 );
	container.rotation.x = -0.55;

	container1 = new ThreeMeshUI.Block({
		justifyContent: 'center',
		alignContent: 'center',
		contentDirection: 'row-reverse',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.5,
		borderRadius: 0,
		width: 2,
		height: 1,
		backgroundOpacity: 1,
		backgroundColor: new THREE.Color(0x303030),
	}).add(
		new ThreeMeshUI.Text({
			fontSize: .3,
			content: "delete"
		}),
	);

	container1.position.set( -.082, .015, .09 );
	container1.rotation.x = -0.55;
	container.scale.multiplyScalar(1/30);
	container1.scale.multiplyScalar(1/30);
	both.add(container);
	both.add(container1);
	scene.add(both);

	both1 = new THREE.Group();

	container2 = new ThreeMeshUI.Block({
		justifyContent: 'center',
		alignContent: 'center',
		contentDirection: 'row-reverse',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.5,
		borderRadius: 0,
		width: 2,
		height: 1,
		backgroundOpacity: 1,
		backgroundColor: new THREE.Color(0x303030),
	}).add(
		new ThreeMeshUI.Text({
			fontSize: 0.3,
			content: "add"
		}),
	);

	container2.position.set( .05, 0.045, .04 );
	container2.rotation.x = -0.55;

	container3 = new ThreeMeshUI.Block({
		justifyContent: 'center',
		alignContent: 'center',
		contentDirection: 'row-reverse',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.5,
		borderRadius: 0,
		width: 2,
		height: 1,
		backgroundOpacity: 1,
		backgroundColor: new THREE.Color(0x303030),
	}).add(
		new ThreeMeshUI.Text({
			fontSize: .3,
			content: "delete"
		}),
	);

	container3.position.set( .082, .015, .09 );
	container3.rotation.x = -0.55;
	container2.scale.multiplyScalar(1/30);
	container3.scale.multiplyScalar(1/30);
	both1.add(container2);
	both1.add(container3);
	scene.add(both1);

	// BUTTONS

	// We start by creating objects containing options that we will use with the two buttons,
	// in order to write less code.

	

};

// Handle resizing the viewport

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
};

//

function loop() {

	// Don't forget, ThreeMeshUI must be updated manually.
	// This has been introduced in version 3.0.0 in order
	// to improve performance
	ThreeMeshUI.update();

	controls.update();

	meshContainer.rotation.z += 0.01;
	meshContainer.rotation.y += 0.01;

	renderer.render( scene, camera );

	updateButtons();

};

// Called in the loop, get intersection with either the mouse or the VR controllers,
// then update the buttons states according to result

function updateButtons() {

	// Find closest intersecting object
	let intersect;

	if ( renderer.xr.isPresenting ) {

		if(x === 1){
			x = 0;
			var color = new THREE.Color(0x65b7f3)
			console.log("working");
			vrControl.controllers[ 0 ].add(both);	
			var geometry = new THREE.Geometry();
			var geometry1 = new THREE.Geometry();
            geometry.vertices.push(vrControl.controllers[ 0 ].position.clone().add(new THREE.Vector3(.02,0.01,.07)));
            geometry.vertices.push(container.position.clone().addScalar(-.0032));
			geometry1.vertices.push(vrControl.controllers[ 0 ].position.clone().add(new THREE.Vector3(.0125,.005,.085)));
            geometry1.vertices.push(container1.position.clone().addScalar(-.0032));
			var material = new THREE.LineBasicMaterial({ color: color });
            var line = new THREE.Line( geometry, material );
			scene.add(line);
			vrControl.controllers[ 0 ].add(line);
			var line1 = new THREE.Line( geometry1, material );
			scene.add(line1);
			vrControl.controllers[ 0 ].add(line1);

			vrControl.controllers[ 1 ].add(both1);	
			var geometry2 = new THREE.Geometry();
			var geometry3 = new THREE.Geometry();
            geometry2.vertices.push(vrControl.controllers[ 1 ].position.clone().add(new THREE.Vector3(-.02,0.01,.07)));
            geometry2.vertices.push(container2.position.clone().addScalar(-.0032));
			geometry3.vertices.push(vrControl.controllers[ 1 ].position.clone().add(new THREE.Vector3(-.0125,.005,.085)));
            geometry3.vertices.push(container3.position.clone().addScalar(-.0032));
			var material = new THREE.LineBasicMaterial({ color: color });
            var line2 = new THREE.Line( geometry2, material );
			scene.add(line2);
			vrControl.controllers[ 1 ].add(line2);
			var line3 = new THREE.Line( geometry3, material );
			scene.add(line3);
			vrControl.controllers[ 1 ].add(line3);
		}

		var position = new THREE.Vector3();
		var quaternion = new THREE.Quaternion();
		var scale = new THREE.Vector3();

		camera.matrixWorld.decompose( position, quaternion, scale );
		//both.lookAt(position);

		vrControl.setFromController( 0, raycaster.ray );

		intersect = raycast();

		// Position the little white dot at the end of the controller pointing ray
		if ( intersect ) vrControl.setPointerAt( 0, intersect.point );

	} else if ( mouse.x !== null && mouse.y !== null ) {

		raycaster.setFromCamera( mouse, camera );

		intersect = raycast();

	};

	// Update targeted button state (if any)

	if ( intersect && intersect.object.isUI ) {

		if ( selectState ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'selected' );

		} else {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'hovered' );

		};

	};

	// Update non-targeted buttons state

	objsToTest.forEach( (obj)=> {

		if ( (!intersect || obj !== intersect.object) && obj.isUI ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			obj.setState( 'idle' );

		};

	});

};

//

function raycast() {

	return objsToTest.reduce( (closestIntersection, obj)=> {

		const intersection = raycaster.intersectObject( obj, true );

		if ( !intersection[0] ) return closestIntersection

		if ( !closestIntersection || intersection[0].distance < closestIntersection.distance ) {

			intersection[0].object = obj;

			return intersection[0]

		} else {

			return closestIntersection

		};

	}, null );

};