import { mat4 } from 'gl-matrix';
import { VolumeViewBase } from './volumeviewbase.js'
import { Vr } from '../scene/vr.js'
import { Luts } from '../lut.js'

class VrView extends VolumeViewBase {
	constructor() {
		super();
		this._el3d = new Vr();
		this.Add3dSceneElement(this._el3d);
		this.SetLut(Luts.list[0]);
	}
	SetLut(lut) {
		lut.image.then((img) => {
			this._el3d._lut = img;
			this._hasChanges3d = true;
		});
	}
	_updateProjection() {
		var aspect = this.Width / this.Height;
		mat4.perspective(this._el3d.projection, 0.392, aspect, 0.1, 100);
	}
	_onWindowResize() {
		this._updateProjection();
		super._onWindowResize();
	}
}

export { VrView };
