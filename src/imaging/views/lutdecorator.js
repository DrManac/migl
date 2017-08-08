import {Luts} from '../lut.js'

export const LutDecorator = (superclass) => class extends superclass {
	constructor() {
		super();
		this.SetLut(Luts.list[0]);
	}
	SetLut(lut) {
		lut.image.then((img) => {
			this._el3d._lut = img;
			this._hasChanges3d = true;
		});
	}
	get invert() { return this._el3d._black > this._el3d._white; }
	set invert(invert) {
		if(invert == this.invert) return;
		var tmp = this._el3d._black;
		this._el3d._black = this._el3d._white;
		this._el3d._white = tmp;
		this._hasChanges3d = true;
	}
	get voi() { return this.invert ?
		{ black: this._el3d._black, white: this._el3d._white } :
		{ black: this._el3d._white, white: this._el3d._black };
	}
	set voi(voi) {
		if(voi.black > voi.white - 1)
			voi.black = voi.white - 1;
		if(this.invert)
		{
			this._el3d._black = voi.white;
			this._el3d._white = voi.black;
		} else {
			this._el3d._black = voi.black;
			this._el3d._white = voi.white;
		}
		this._hasChanges3d = true;
	}
};
