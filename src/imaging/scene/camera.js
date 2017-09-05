import {vec3, mat4} from 'gl-matrix';

class Camera {
	constructor() {
		this.view = mat4.create();
		this.projection = mat4.create();
		mat4.ortho(this.projection, -1, 1, 1, -1, -1, 1);
	}
	clipToWorld(x, y, z) {
		z = z || 0;
		let vpi = this.projectionViewInverse;
		return vec3.transformMat4(vec3.create(), [x, y, z], vpi);
	}
	get projectionViewInverse() {
		var vpi = mat4.clone(this.projection);
		mat4.mul(vpi, vpi, this.view);
		mat4.invert(vpi, vpi);
		return vpi;
	}
}

export {Camera};
