function hoverServo (body, dt) {  // pass dt for integral control
	let yy = body.position.y;
	let vv = body.velocity.y;

	let error = yref - yy;
	if (hoverServo.integral === undefined)
		hoverServo.integral = 0;
	hoverServo.integral += error*dt;

	const KP = 8;
	const KI = 7;
	const KD = 16;
	let omega = KP*error + KI*hoverServo.integral + KD*(-vv);
	return omega;
}


function yawServo (body, dt) {  // pass dt for integral control
	let error = yawRef - yawAngle;	
	
	if (yawServo.integral === undefined)
		yawServo.integral = 0;
	yawServo.integral += error*dt;
	
	var diff = 0;
	if (yawServo.lastError !== undefined) {
	   diff = (error - yawServo.lastError)/dt;
//	   yawServo.lastError = error;
	}  
	yawServo.lastError = error;
	
	const KP = .3;
	const KI = 0//2;  // PD works, but not PID ...
	const KD = 15;
	let r = KP*error + KI*yawServo.integral + KD*diff;
	return r;
}

function rollServo (body, dt) {  // pass dt for integral control

	let error = rollRef - rollAngle;	
	
	if (rollServo.integral === undefined)
		rollServo.integral = 0;
	rollServo.integral += error*dt;
	
	var diff = 0;
	if (rollServo.lastError !== undefined) {
	   diff = (error - rollServo.lastError)/dt;
	   rollServo.lastError = error;
	}
	
	const KP = 2;
	const KI = 0//2;  // PD works, but not PID ...
	const KD = 6;
	let r = KP*error + KI*rollServo.integral + KD*diff;
	//console.log ('r:'+r)
	return r;
}

function pitchServo (body, dt) {
	let error = pitchRef - pitchAngle;	
	
	if (pitchServo.integral === undefined)
		pitchServo.integral = 0;
	pitchServo.integral += error*dt;
	
	var diff = 0;
	if (pitchServo.lastError !== undefined) {
	   diff = (error - pitchServo.lastError)/dt;
	   pitchServo.lastError = error;
	}
	
	const KP = 2;
	const KI = 0//2;  // PD works, but not PID ...
	const KD = 6;
	let r = KP*error + KI*pitchServo.integral + KD*diff;
	//console.log ('r:'+r)
	return r;
}
