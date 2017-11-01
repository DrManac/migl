import {vec3, mat4} from 'gl-matrix';

class Camera {
	constructor() {
		this.width = 1;
		this.height = 1;
		this.view = mat4.create();
		this.projection = mat4.create();
		mat4.ortho(this.projection, -1, 1, 1, -1, -1, 1);
	}
	clipToWorld(x, y, z) {
		z = z || 0;
		let vpi = this.projectionViewInverse;
		return vec3.transformMat4(vec3.create(), [x, y, z], vpi);
	}
	worldToScreen(vec) {
		var mtx = mat4.clone(this.view);
		mat4.mul(mtx, this.projection, mtx);
		mat4.mul(mtx, mat4.fromTranslation(mat4.create(), [1, -1, 1]), mtx);
		mat4.mul(mtx, mat4.fromScaling(mat4.create(), [this.width * .5, -this.height * .5, .5]), mtx);
		return vec3.transformMat4(vec3.create(), vec, mtx);
	}
	get projectionViewInverse() {
		var vpi = mat4.clone(this.projection);
		mat4.mul(vpi, vpi, this.view);
		mat4.invert(vpi, vpi);
		return vpi;
	}
}

export {Camera};
