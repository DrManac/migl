import {vec3} from 'gl-matrix';

class Cross {
	constructor() {
		this.view = null;
		this.pressed = false;
		this._point = vec3.create();
	}
	mmove(e, camera) {
		if(!this.pressed) return;
		this._point = camera.clipToWorld(e.clipX, e.clipY);
		if(this.view)
			this.view.setSlicePoint(this._point);
	}
	mdown(e, camera) {
		this.pressed = true;
		this._point = camera.clipToWorld(e.clipX, e.clipY);
		if(this.view)
			this.view.setSlicePoint(this._point);
	}
	mup(e) {
		this.pressed = false;
	}
	mwheel(e) {

	}
}

export {Cross};
