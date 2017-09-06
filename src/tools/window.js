class Window {
	constructor(wpropname) {
		this.view = null;
		this.pressed = false;
		this.wprop = wpropname;
		if(!this.wprop)
			this.wprop = 'voi';
		this._begin = {x: 0, y: 0};
		this._beginWindow = {black: 0, white: 256};
		this._scale = 256;
	}
	mmove(e) {
		if(!this.pressed) return;
		var dc = (e.normedY - this._begin.y) * this._scale;
		var dw = (e.normedX - this._begin.x) * this._scale;
		if(this._beginWindow.white - this._beginWindow.black + 2 * dw < 0)
			dw = 0;
		this.view[this.wprop] = {
			black: this._beginWindow.black + dc - dw,
			white: this._beginWindow.white + dc + dw };
		this._begin = {x: e.normedX, y: e.normedY};
		this._beginWindow = this.view[this.wprop];
	}
	mdown(e) {
		this.pressed = true;
		this._begin = {x: e.normedX, y: e.normedY};
		this._beginWindow = this.view[this.wprop];
		this._scale = Math.max(256, Math.abs(this._beginWindow.white - this._beginWindow.black));
	}
	mup(e) {
		this.pressed = false;
	}
}

export {Window};
