import { VolumeViewBase } from './volumeviewbase.js'
import { Slice } from '../scene/slice.js'

class SliceView extends VolumeViewBase {
	constructor() {
		super();
		this._el3d = new Slice();
		this.Add3dSceneElement(this._el3d);
	}
	SetOrts(xort, yort, zort) {
	}
}

export { SliceView };
