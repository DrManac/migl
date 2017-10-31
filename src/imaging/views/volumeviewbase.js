import {ViewBase} from './viewbase.js'

class VolumeViewBase extends ViewBase {
	SetVolume(vol) {
		this._el3d.volume = vol;
		this._updateTransforms();
	}
	_onWindowResize() {
		this._updateTransforms();
		super._onWindowResize();
	}
	_updateTransforms() {
		this.Invalidate();
	}
}

export {VolumeViewBase};
