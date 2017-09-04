import {vec3, mat4} from 'gl-matrix';

class Pan {
	constructor() {
		this.view = null;
		this.pressed = false;
		this._point = vec3.create();
		this.translation = vec3.create();
	}
	mmove(e, camera) {
		if(!this.pressed) return;
		vec3.sub(this.translation, camera.clipToWorld(e.clipX, e.clipY), this._point);
		if(this.view)
			this.view.applyCameraTransform(mat4.fromTranslation(mat4.create(), this.translation));
		vec3.copy(this._point, camera.clipToWorld(e.clipX, e.clipY));
	}
	mdown(e, camera) {
		this.pressed = true;
		vec3.copy(this._point, camera.clipToWorld(e.clipX, e.clipY));
	}
	mup(e) {
		this.pressed = false;
	}
}

export {Pan};
