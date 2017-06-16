import { VolumeViewBase } from './volumeviewbase.js'
import { Vr } from '../scene/vr.js'

class VrView extends VolumeViewBase {
	constructor() {
		super();
		this._el3d = new Vr();
		this.Add3dSceneElement(this._el3d);
	}
}

export { VrView };
