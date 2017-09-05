import {vec3, vec4, mat4} from 'gl-matrix';

class Rotate {
	constructor() {
		this.view = null;
		this.pressed = false;
		this._prevAngle = 0;
		this._mtx = mat4.create();
	}
	mmove(e, camera) {
		if(!this.pressed) return;
		var angle = Math.atan2(e.clipY, e.clipX);
		var axis = vec4.transformMat4(vec4.create(), [0, 0, 1, 0], camera.projectionViewInverse);
		var origin = camera.clipToWorld(0, 0, 0);
		mat4.fromTranslation(this._mtx, origin);
		mat4.rotate(this._mtx, this._mtx, angle - this._prevAngle, axis);
		vec3.scale(origin, origin, -1);
		mat4.translate(this._mtx, this._mtx, origin);
		if(this.view)
			this.view.applyCameraTransform(this._mtx);
		this._prevAngle = angle;
	}
	mdown(e, camera) {
		this.pressed = true;
		this._prevAngle = Math.atan2(e.clipY, e.clipX);
	}
	mup(e) {
		this.pressed = false;
	}
}

export {Rotate};
