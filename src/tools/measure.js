import {vec3, mat4} from 'gl-matrix';
import {Interval} from '../imaging/scene2d/interval.js'

class Measure {
	constructor() {
		this.view = null;
		this.object = new Interval();
		this.pressed = false;
	}
	mmove(e, camera) {
		if(!this.pressed) return;
		this.object.end = camera.clipToWorld(e.clipX, e.clipY);
		if(this.view) this.view.InvalidateOverlay();
	}
	mdown(e, camera) {
		this.pressed = true;
		var world = camera.clipToWorld(e.clipX, e.clipY);
		this.object.begin = world;
		this.object.end = world;
		if(this.view)
			this.view.Add2dSceneElement(this.object);
	}
	mup(e) {
		this.pressed = false;
		this.object = new Interval();
	}
}

export {Measure};
