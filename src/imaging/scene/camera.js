import {mat4} from 'gl-matrix';

class Camera {
	constructor() {
		this.view = mat4.create();
		this.projection = mat4.create();
		mat4.ortho(this.projection, -1, 1, 1, -1, -1, 1);
	}
}

export {Camera};
