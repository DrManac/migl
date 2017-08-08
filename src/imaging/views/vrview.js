import {mat4} from 'gl-matrix';
import {VolumeViewBase} from './volumeviewbase.js'
import {Vr} from '../scene/vr.js'
import {LutDecorator} from './lutdecorator.js'

class VrView extends VolumeViewBase {
	constructor() {
		super();
		this._el3d = new Vr();
		this.Add3dSceneElement(this._el3d);
		mat4.perspective(this._camera.projection, 0.392, 16/9, 0.1, 100);
		mat4.translate(this._camera.view, this._camera.view, [0, 0, -10]);
	}
	_updateProjection() {
		var aspect = this.Width / this.Height;
		mat4.perspective(this._camera.projection, 0.392, aspect, 0.1, 100);
	}
	_onWindowResize() {
		this._updateProjection();
		super._onWindowResize();
	}
}

class VrViewDecorated extends LutDecorator(VrView) { }
export {VrViewDecorated as VrView};
