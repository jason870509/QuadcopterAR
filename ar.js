

// global variables

function initAR() {
	clock = new THREE.Clock();
	let _iOSDevice = !!navigator.platform.match(/iPhone|iPod|iPad/);

	console.log ('iOS: ' + _iOSDevice)


	// init renderer
	renderer	= new THREE.WebGLRenderer({
		// antialias	: true,
		alpha: true
	});
	renderer.shadowMap.type = THREE.PCFSoftShadowMap
	renderer.shadowMap.enabled = true;
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	// renderer.setPixelRatio( 1/2 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	// init scene and camera
	scene	= new THREE.Scene();
	
	var ambient = new THREE.AmbientLight( 0x666666 );
	scene.add( ambient );

	directionalLight = new THREE.DirectionalLight( 'white' );
	directionalLight.position.set( 1, 2, 0.3 ).setLength(2)

	directionalLight.shadow.mapSize.set(128,128)
	directionalLight.shadow.camera.bottom = -0.6
	directionalLight.shadow.camera.top = 0.6
	directionalLight.shadow.camera.right = 0.6
	directionalLight.shadow.camera.left = -0.6
	directionalLight.castShadow = true;
	//scene.add(new THREE.CameraHelper( directionalLight.shadow.camera ))
	scene.add( directionalLight );	
	//////////////////////////////////////////////////////////////////////////////////
	//		Initialize a basic camera
	//////////////////////////////////////////////////////////////////////////////////

	// Create a camera
	camera = new THREE.Camera();
	scene.add(camera);

	////////////////////////////////////////////////////////////////////////////////
	//          handle arToolkitSource
	////////////////////////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		// to read from the webcam 
		sourceType : 'webcam',

		// to read from an image
		// sourceType : 'image',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',		

		// to read from a video
		// sourceType : 'video',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',		
	})

	arToolkitSource.init(function onReady(){
		onResize()
	})
	
	// handle resize
	window.addEventListener('resize', function(){
		onResize()
	})
	function onResize(){
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if( arToolkitContext.arController !== null ){
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}
	////////////////////////////////////////////////////////////////////////////////
	//          initialize arToolkitContext
	////////////////////////////////////////////////////////////////////////////////
	
	arToolkitContext = new THREEx.ArToolkitContext({
		//cameraParametersUrl: 'data/camera_para.dat',
		cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
		detectionMode: 'mono',
		maxDetectionRate: 30,
		canvasWidth: 80*3,
		canvasHeight: 60*3,
	})
	// initialize it
	arToolkitContext.init(function onCompleted(){
		// copy projection matrix to camera
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	})
	markerA = addMarkerA();
	scene.add(markerA);
	markerKanji = addMarkerKanji();
	scene.add (markerKanji);
	markerHiro = addMarkerHiro();
	//scene.add (markerHiro); // hide at first
	
	
	stats = new Stats();
	document.body.appendChild( stats.dom );

	////////////////////////////////////////////////////////
	// picker
	if (_iOSDevice)
		window.addEventListener('touchstart', onTouchStart, false) 
	else
		window.addEventListener ('mousedown', onMouseDown, false);
	raycaster = new THREE.Raycaster();
	pickables = [markerKanji];	


}

function onTouchStart (event) {
	console.log ('in touch start')

   if (event.touches.length == 1) {
        
		event.preventDefault();
		let ndcX = ( event.touches[0].pageX / window.innerWidth ) * 2 - 1;
		let ndcY = - ( event.touches[0].pageY / window.innerHeight ) * 2 + 1;
	
		doToggleHiro (ndcX, ndcY);		
		
	}	
}	
	
function doToggleHiro (ndcX, ndcY) {
  	//raycaster.ray.origin.setFromMatrixPosition( camera.matrixWorld );
	raycaster.ray.origin.set (0,0,0)
	raycaster.ray.direction.set( ndcX, ndcY, 0.5 ).unproject( camera ).sub( raycaster.ray.origin ).normalize();
			
  	var intersects = raycaster.intersectObjects(pickables, true);
	intersects.length = 1
  	if (intersects.length > 0) {
  		console.log ('toggle showHiro');
 		showHiro = !showHiro;
	}
	//console.log()
	if (showHiro) {
		scene.add (markerHiro)
		scene.remove(markerA)
	} else {
		//scene.remove (markerHiro)
		scene.add(markerA)
	}

}

function onMouseDown (event) {
	event.preventDefault();
  	let ndcX = (event.clientX / window.innerWidth) * 2 - 1;
  	let ndcY = -(event.clientY / window.innerHeight) * 2 + 1;
	doToggleHiro (ndcX, ndcY)  	
}

	


function createAirplane(){
	let loader = new THREE.TextureLoader();
	loader.crossOrigin = '';
	var airplane = new THREE.Group();
	texture = loader.load('https://i.imgur.com/qr8kAad.png');

	var box = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 7), new THREE.MeshBasicMaterial({
		color: 0xffffff, 
		map: texture
	}));
	airplane.add(box)
	box.castShadow = true;
	box.receiveShadow = true;
	//////////////////////////////////////////boxLinks
	let boxLinks = []
	for (i = 0; i < 4; i++) {
		boxLinks[i] = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 0.2), new THREE.MeshBasicMaterial({
		  color: 0x333333,
		  map: texture
		}));
		airplane.add(boxLinks[i])
		boxLinks[i].castShadow = true;
		boxLinks[i].receiveShadow = true;
	}
	boxLinks[0].position.set(-2.5, 0, 3.0)
	boxLinks[0].rotation.y = Math.PI / 4
	boxLinks[1].position.set(-2.5, 0, -3.0)
	boxLinks[1].rotation.y = -Math.PI / 4
	boxLinks[2].position.set(2.5, 0, -3.0)
	boxLinks[2].rotation.y = Math.PI / 4
	boxLinks[3].position.set(2.5, 0, 3.0)
	boxLinks[3].rotation.y = -Math.PI / 4
	//////////////////////////////////////////motorSides
	let motorSides = []
	material = new THREE.MeshBasicMaterial({
		color: 0x333333,
		side: THREE.DoubleSide,
		map: texture
	})
	motorSides[0] = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 50, 2, true, 4, 2.5), material)
	motorSides[0].position.set(-4, 1, 4)
	motorSides[1] = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 50, 2, true, 2.8, 2.5), material)
	motorSides[1].position.set(-4, 1, -4)
	motorSides[2] = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 50, 2, true, 1, 2.5), material)
	motorSides[2].position.set(4, 1, -4)
	motorSides[3] = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 50, 2, true, -0.5, 2.5), material)
	motorSides[3].position.set(4, 1, 4)
	for (i = 0; i < 4; i++) {
		airplane.add(motorSides[i])
		motorSides[i].castShadow = true;
		motorSides[i].receiveShadow = true;
	}
	//////////////////////////////////////////motorCenters
	let motorCenters = [], motorCenters2 = []
	for (i = 0; i < 4; i++) {
		motorCenters[i] = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3.5, 50), new THREE.MeshBasicMaterial({
			color: 0xCCCCCC, 
			map: texture
		}));
		airplane.add(motorCenters[i])
		motorCenters[i].castShadow = true;
		motorCenters[i].receiveShadow = true;
	}
	motorCenters[0].position.set(-4, 0, 4)
	motorCenters[1].position.set(-4, 0, -4)
	motorCenters[2].position.set(4, 0, -4)
	motorCenters[3].position.set(4, 0, 4)
	for (i = 0; i < 4; i++) {
		motorCenters2[i] = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 50, 2, true), new THREE.MeshBasicMaterial({
		color: 0x333333, 
		map: texture
	}));
		airplane.add(motorCenters2[i])
		motorCenters2[i].castShadow = true;
		motorCenters2[i].receiveShadow = true;
	}
	motorCenters2[0].position.set(-4, -0.5, 4)
	motorCenters2[1].position.set(-4, -0.5, -4)
	motorCenters2[2].position.set(4, -0.5, -4)
	motorCenters2[3].position.set(4, -0.5, 4)
	//////////////////////////////////////////motorLinks
	let motorLinks = []
	for (i = 0; i < 8; i++) {
		motorLinks[i] = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.4, 0.2), new THREE.MeshBasicMaterial({
			color: 0x333333,
			map: texture
		}));
		airplane.add(motorLinks[i])
		motorLinks[i].castShadow = true;
		motorLinks[i].receiveShadow = true;
	}
	motorLinks[0].position.set(-6, 0, 4)
	motorLinks[1].position.set(-6, 0, -4)
	motorLinks[2].position.set(6, 0, -4)
	motorLinks[3].position.set(6, 0, 4)
	motorLinks[0].rotation.z = -Math.PI / 6
	motorLinks[1].rotation.z = -Math.PI / 6
	motorLinks[2].rotation.z = Math.PI / 6
	motorLinks[3].rotation.z = Math.PI / 6
	motorLinks[4].position.set(-4, 0, 6)
	motorLinks[4].rotation.y = -Math.PI / 2
	motorLinks[4].rotation.x = -Math.PI / 6
	motorLinks[5].position.set(-4, 0, -6)
	motorLinks[5].rotation.y = -Math.PI / 2
	motorLinks[5].rotation.x = Math.PI / 6
	motorLinks[6].position.set(4, 0, -6)
	motorLinks[6].rotation.y = -Math.PI / 2
	motorLinks[6].rotation.x = Math.PI / 6
	motorLinks[7].position.set(4, 0, 6)
	motorLinks[7].rotation.y = -Math.PI / 2
	motorLinks[7].rotation.x = -Math.PI / 6
	//////////////////////////////////////////motors
	var motors = []
	motorTexture = loader.load('https://i.imgur.com/yCho2gY.png');
	for(i=0;i<4;i++){
		motors[i] = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 1), new THREE.MeshPhongMaterial({map:motorTexture,transparent: true, side:THREE.DoubleSide}))
		motors[i].rotation.x = -Math.PI / 2
		airplane.add(motors[i])	
		motors[i].castShadow = true;
		motors[i].receiveShadow = true;
	}
	motors[0].position.set(-4, 1, 4)
	motors[1].position.set(-4, 1, -4)
	motors[2].position.set(4, 1, -4)
	motors[3].position.set(4, 1, 4)
	return airplane
}

function addMarkerKanji () {
	let markerRootKanji = new THREE.Group();
	var artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRootKanji, {
		type : 'pattern',
		//patternUrl : 'data/kanji.patt'
		patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji'
	})

	kanjiAirplane = createAirplane();
	
	markerRootKanji.add (kanjiAirplane);

	kanjiAirplane.position.y = 0.5;
	kanjiAirplane.scale.set(0.05,0.05,0.05)
	kanjiAirplane.rotation.x = - Math.PI / 2
	kanjiAirplane.rotation.y = - Math.PI / 2
	// point the directionalLight to the marker
	directionalLight.target = kanjiAirplane
	var material2 = new THREE.ShadowMaterial();

	material2.opacity = 0.7; 
	var geometry2 = new THREE.PlaneGeometry(30, 30)
	var planeMesh = new THREE.Mesh( geometry2, material2);
	planeMesh.receiveShadow = true;
	planeMesh.depthWrite = false;
	planeMesh.rotation.x = -Math.PI/2
	
	markerRootKanji.add(planeMesh);
	
	/// add gridhelper
	var gridXZ = new THREE.GridHelper(1,10);
	//markerRootKanji.add (gridXZ);
	return markerRootKanji;
}

function addMarkerHiro(){
	let markerRoot = new THREE.Group()

	var artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
		type : 'pattern',
		//patternUrl : 'data/hiro.patt'
		patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro'
	})

	hiroAirplane = createAirplane();
	//hiroAirplane.children[0].material.color.setHex( 0x29e2f0 );
	markerRoot.add (hiroAirplane);
	hiroAirplane.visible = false
	hiroAirplane.position.y = 0.5;
	hiroAirplane.scale.set(0.05,0.05,0.05)
	hiroAirplane.rotation.x = - Math.PI / 2
	hiroAirplane.rotation.y = - Math.PI / 2
	// point the directionalLight to the marker
	//directionalLight.target = mesh

	// add a transparent ground-plane shadow-receiver
	var material = new THREE.ShadowMaterial();
	//var material = new THREE.MeshLambertMaterial({color:0xffff00, side:THREE.DoubleSide});

	material.opacity = 0.7; //! bug in threejs. can't set in constructor

	var geometry = new THREE.PlaneGeometry(30, 30) // should be large enough
	var planeMesh = new THREE.Mesh( geometry, material);
	planeMesh.receiveShadow = true;
	planeMesh.depthWrite = false;
	planeMesh.rotation.x = -Math.PI/2
	markerRoot.add(planeMesh);	
	
		
	return markerRoot;
}	

function addMarkerA(){
	let markerA = new THREE.Group()

	var artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerA, {
		type : 'pattern',
		patternUrl : 'data/house.patt'
	})

	// add a torus knot	
	/*var geometry	= new THREE.TorusKnotGeometry(0.3,0.1,64,16);
	var material	= new THREE.MeshNormalMaterial();
	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.y	= 0.5
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.position.y	= 0.7
	markerRoot.add (mesh);
	mesh.scale.set(0.1,0.1,0.1)*/
	aAirplane = createAirplane();
	//hiroAirplane.children[0].material.color.setHex( 0x29e2f0 );
	markerA.add (aAirplane);
	aAirplane.visible = false
	aAirplane.position.y = 0.5;
	aAirplane.scale.set(0.05,0.05,0.05)
	aAirplane.rotation.x = - Math.PI / 2
	aAirplane.rotation.y = - Math.PI / 2
	// point the directionalLight to the marker
	//directionalLight.target = mesh

	// add a transparent ground-plane shadow-receiver
	var material = new THREE.ShadowMaterial();
	//var material = new THREE.MeshLambertMaterial({color:0xffff00, side:THREE.DoubleSide});

	material.opacity = 0.7; //! bug in threejs. can't set in constructor

	var geometry = new THREE.PlaneGeometry(30, 30) // should be large enough
	var planeMesh = new THREE.Mesh( geometry, material);
	planeMesh.receiveShadow = true;
	planeMesh.depthWrite = false;
	planeMesh.rotation.x = -Math.PI/2
	markerA.add(planeMesh);	
	
		
	return markerA;
}	




