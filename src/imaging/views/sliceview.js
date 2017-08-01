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
	}
	SetLut(lut) {
		lut.image.then((img) => {
			this._el3d._lut = img;
			this._hasChanges3d = true;
		});
	}
	SetOrts(xort, yort, zort) {
		this._el3d.world = mat4.fromValues(
			xort[0], xort[1], xort[2], 0,
			yort[0], yort[1], yort[2], 0,
			zort[0], zort[1], zort[2], 0,
			0, 0, 0, 1);
	}
	_updateProjection() {
		var aspect = this.Width / this.Height;
		if(aspect > 1)
			mat4.ortho(this._el3d.projection, -aspect, aspect, 1, -1, -1, 1);
		else
			mat4.ortho(this._el3d.projection, -1, 1, 1 / aspect, -1 / aspect, -1, 1);
		//mat4.ortho(this._el3d.projection, -1, 1, 1, -1, -1, 1);
		mat4.scale(this._el3d.projection, this._el3d.projection, [.5, .5, .5]);
		mat4.fromXRotation(this._el3d.view, 0.78);
		mat4.rotateZ(this._el3d.view, this._el3d.view, 0.78);
	}
	_onWindowResize() {
		this._updateProjection();
		super._onWindowResize();
	}
}

export { SliceView };
