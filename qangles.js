(function() {
  rotateAlongAxisTo = function(u, axis, w) {
    let angle = u.angleTo(w);
    let cc = u.clone();
    cc.cross(w);
    if (cc.dot(axis) > 0)
      return angle;
    else
      return -angle;
  }
})();

// rollAngle: try my best to return (-PI,PI)
function getBodyPitch2 (body) {
	// CANNON.JS
	var localX, localY;
	localX = body.vectorToWorldFrame (new CANNON.Vec3(1,0,0) );
    localY = body.vectorToWorldFrame (new CANNON.Vec3(0,1,0) );

	// THREE.JS
	var xL = new THREE.Vector3 (localX.x, localX.y, localX.z);
	var yL = new THREE.Vector3 (localY.x, localY.y, localY.z);
	var yW = new THREE.Vector3 (0,1,0);

	var v = yW.projectOnPlane (xL);
	var pitchAngle =  rotateAlongAxisTo (v, xL, yL);	

  	return pitchAngle;
}

// rollAngle: try my best to return (-PI,PI)
function getBodyRoll2 (body) {
	// CANNON.JS
	var localY, localZ;
    localY = body.vectorToWorldFrame (new CANNON.Vec3(0,1,0) );
	localZ = body.vectorToWorldFrame (new CANNON.Vec3(0,0,1) );

	// THREE.JS
	var yL = new THREE.Vector3 (localY.x, localY.y, localY.z);
	var zL = new THREE.Vector3 (localZ.x, localZ.y, localZ.z);
	var yW = new THREE.Vector3 (0,1,0);

	var v = yW.projectOnPlane (zL);
	var rollAngle =  rotateAlongAxisTo (v, zL, yL);	

  	return rollAngle;
}

// yawAngle: try my best to return [0, 2PI)
function getBodyYaw2 (body) {
	// CANNON.JS
	var localY, localZ;
    localY = body.vectorToWorldFrame (new CANNON.Vec3(0,1,0) );
	localZ = body.vectorToWorldFrame (new CANNON.Vec3(0,0,1) );
	
	// THREE.JS
	var yL = new THREE.Vector3 (localY.x, localY.y, localY.z);
	var zL = new THREE.Vector3 (localZ.x, localZ.y, localZ.z);
	var zW = new THREE.Vector3 (0,0,1);
	//var v = new THREE.Vector3();
	var v = zW.projectOnPlane (yL);
	var yawAngle =  rotateAlongAxisTo (v, yL, zL);	

	if (yawAngle < 0) yawAngle += Math.PI*2;	
	if (yawAngle > Math.PI*2)
		yawAngle %= Math.PI*2;
	return yawAngle;
}