import {mat4} from 'gl-matrix';
import {Luts} from '../lut.js'
import {Slice} from '../scene/slice.js'
import {SliceView} from './sliceview.js'

class FusionView extends SliceView {
	constructor() {
		super();
		this._el3d2 = new Slice();
		this._el3d2.progressiveAlpha = true;
		this.Add3dSceneElement(this._el3d2);
		this.SetLut2(Luts.list[23]);
	}
	SetVolume2(vol) {
		this._el3d2.volume = vol;
		this._hasChanges3d = true;
	}
	SetLut2(lut) {
		lut.image.then((img) => {
			this._el3d2._lut = img;
			this._hasChanges3d = true;
		});
	}
	get invert2() { return this._el3d2._black > this._el3d2._white; }
	set invert2(invert) {
		if(invert == this.invert) return;
		var tmp = this._el3d2._black;
		this._el3d2._black = this._el3d2._white;
		this._el3d2._white = tmp;
		this._hasChanges3d = true;
	}
	get voi2() { return this.invert ?
		{ black: this._el3d2._black, white: this._el3d2._white } :
		{ black: this._el3d2._white, white: this._el3d2._black };
	}
	set voi2(voi) {
		if(voi.black > voi.white - 1)
			voi.black = voi.white - 1;
		if(this.invert)
		{
			this._el3d2._black = voi.white;
			this._el3d2._white = voi.black;
		} else {
			this._el3d2._black = voi.black;
			this._el3d2._white = voi.white;
		}
		this._hasChanges3d = true;
	}
	_updateTransforms() {
		super._updateTransforms();
		mat4.copy(this._el3d2.world, this._el3d.world);
	}
}

export {FusionView};
