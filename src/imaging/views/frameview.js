import { mat4 } from 'gl-matrix';
import { ViewBase } from './viewbase.js'
import { Frame } from '../scene/frame.js'
import { Luts } from '../lut.js'

class FrameView extends ViewBase {
	constructor() {
		super();
		this._el3d = new Frame();
		this.Add3dSceneElement(this._el3d);
		this.SetLut(Luts.list[0]);
	}
	SetImages(imgArray) {
		this._images = imgArray;
		this._currentImageIndex = 0;
		this._el3d.image = imgArray[this._currentImageIndex];
		this._hasChanges3d = true;
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
	_updateProjection() {
		var aspect = this.Width / this.Height;
		if(aspect > 1)
			mat4.ortho(this._el3d.projection, -aspect, aspect, 1, -1, -1, 1);
		else
			mat4.ortho(this._el3d.projection, -1, 1, 1 / aspect, -1 / aspect, -1, 1);
	}
	_onWindowResize() {
		this._updateProjection();
		super._onWindowResize();
	}
}

export { FrameView };
