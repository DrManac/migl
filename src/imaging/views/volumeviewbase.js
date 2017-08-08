import { ViewBase } from './viewbase.js'

class VolumeViewBase extends ViewBase {
	SetVolume(vol) {
		this._el3d.volume = vol;
		this._hasChanges3d = true;
	}
}

export { VolumeViewBase };
