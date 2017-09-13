class Zoom {
	constructor() {
		this.view = null;
		this.pressed = false;
		this._beginY = 0;
		this._beginZoom = 1;
	}
	mmove(e, camera) {
		if(!this.pressed) return;
		if(this.view)
			this.view.zoom = this.beginZoom * Math.pow(10, -(e.normedY - this.beginY));
	}
	mdown(e, camera) {
		this.pressed = true;
		this.beginY = e.normedY;
		this.beginZoom = this.view.zoom;
	}
	mup(e) {
		this.pressed = false;
	}
}

export {Zoom};
