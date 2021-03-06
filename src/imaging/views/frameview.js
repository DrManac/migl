import {mat4} from 'gl-matrix';
import {ViewBase} from './viewbase.js'
import {Frame} from '../scene/frame.js'
import {LutDecorator} from './lutdecorator.js'

class FrameView extends ViewBase {
	constructor() {
		super();
		this._el3d = new Frame();
		this.Add3dSceneElement(this._el3d);
	}
	SetImages(imgArray) {
		this._images = imgArray;
		this._currentImageIndex = 0;
		this._el3d.image = imgArray[this._currentImageIndex];
		this._hasChanges3d = true;
	}
	_updateProjection() {
		var aspect = this.Width / this.Height;
		if(aspect > 1)
			mat4.ortho(this._camera.projection, -aspect, aspect, 1, -1, -1, 1);
		else
			mat4.ortho(this._camera.projection, -1, 1, 1 / aspect, -1 / aspect, -1, 1);
	}
	_onWindowResize() {
		this._updateProjection();
		super._onWindowResize();
	}
}

class FrameViewDecorated extends LutDecorator(FrameView) { }
export {FrameViewDecorated as FrameView};
