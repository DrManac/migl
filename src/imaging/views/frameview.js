import { ViewBase } from './viewbase.js'
import { Frame } from '../scene/frame.js'

class FrameView extends ViewBase {
	constructor() {
		super();
		this._el3d = new Frame();
		this.Add3dSceneElement(this._el3d);
	}
	SetImages(imgArray) {

	}
}

export { FrameView };
