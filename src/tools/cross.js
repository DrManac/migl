import {vec3} from 'gl-matrix';

class Cross {
	constructor() {
		this.pressed = false;
		this._point = vec3.create();
	}
	mmove(e) {
		if(!this.pressed) return;
		this._point = e.world;
		if(this.onPointChanged)
			this.onPointChanged(this);
	}
	mdown(e) {
		this.pressed = true;
		//console.log(e.world);
		this._point = e.world;
		if(this.onPointChanged)
			this.onPointChanged(this);
	}
	mup(e) {
		this.pressed = false;
	}
	mwheel(e) {

	}
}

export {Cross};
