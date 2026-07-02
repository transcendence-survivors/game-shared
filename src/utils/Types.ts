export interface Vec3d {
	x: number;
	y: number;
	z: number;
}
export interface Vec2d {
	x: number;
	z: number;
}

export interface MoveInput {
	seq: number;
	forward: boolean;
	backward: boolean;
	right: boolean;
	left: boolean;
	jump: boolean;
	deltaTime: number;
	cameraYaw: number;
}

export interface MovementState {
	x: number;
	y: number;
	rotationY: number;
	z: number;
	velocityY: number;
	isGrounded: boolean;
}

export interface HorizontalMove {
	x: number;
	z: number;
	rotationY: number;
}

export interface VerticalMove {
	y: number;
	velocityY: number;
	isGrounded: boolean;
}
