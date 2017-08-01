import { mat4 } from 'gl-matrix';
import { VolumeViewBase } from './volumeviewbase.js'
import { Slice } from '../scene/slice.js'
import { Luts } from '../lut.js'

class SliceView extends VolumeViewBase {
	constructor() {
		super();
		this._el3d = new Slice();
		this.Add3dSceneElement(this._el3d);
		this.SetLut(Luts.list[0]);
		this._xort = [1, 0, 0];
		this._yort = [0, 1, 0];
		this._zort = [0, 0, 1];
	}
	SetLut(lut) {
		lut.image.then((img) => {
			this._el3d._lut = img;
			this._hasChanges3d = true;
		});
	}
	SetOrts(xort, yort, zort) {
		this._xort = xort;
		this._yort = yort;
		this._zort = zort;
		this._onWindowResize();
	}
	_updateTransforms() {
		var aspect = this.Width / this.Height;
		var amtx = mat4.create();
		var amtxinv = mat4.create();
		if(aspect > 1)
		{
			mat4.fromScaling(amtx, [1 / aspect, 1, 1]);
			mat4.fromScaling(amtxinv, [aspect, 1, 1]);
		}
		else
		{
			mat4.fromScaling(amtx, [1, aspect, 1]);
			mat4.fromScaling(amtxinv, [1, 1 / aspect, 1]);
		}
		mat4.ortho(this._el3d.projection, -1, 1, 1, -1, -1, 1);
		mat4.mul(this._el3d.projection, this._el3d.projection, amtx);

		var ori = mat4.fromValues(
			...this._xort, 0,
			...this._yort, 0,
			...this._zort, 0,
			0, 0, 0, 1);
		mat4.mul(this._el3d.world, ori, amtxinv);
		mat4.invert(this._el3d.view, ori);
	}
	_onWindowResize() {
		this._updateTransforms();
		super._onWindowResize();
	}
}

export { SliceView };
