import {mat4} from 'gl-matrix';
import {VolumeViewBase} from './volumeviewbase.js'
import {Slice} from '../scene/slice.js'
import {LutDecorator} from './lutdecorator.js'

class SliceView extends VolumeViewBase {
	constructor() {
		super();
		this._el3d = new Slice();
		this.Add3dSceneElement(this._el3d);
		this._xort = [1, 0, 0];
		this._yort = [0, 1, 0];
		this._zort = [0, 0, 1];
		this._disp = 0;
	}
	SetOrts(xort, yort, zort) {
		this._xort = xort;
		this._yort = yort;
		this._zort = zort;
		this._onWindowResize();
	}
	SetDisplacement(disp) {
		this._disp = disp;
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
		mat4.ortho(this._camera.projection, -1, 1, 1, -1, -1, 1);
		mat4.mul(this._camera.projection, this._camera.projection, amtx);

		var ori = mat4.fromValues(
			...this._xort, 0,
			...this._yort, 0,
			...this._zort, 0,
			0, 0, 0, 1);
		mat4.mul(this._el3d.world, ori, amtxinv);
		mat4.translate(this._el3d.world, this._el3d.world, [0, 0, this._disp]);
		mat4.invert(this._camera.view, ori);
	}
	_onWindowResize() {
		this._updateTransforms();
		super._onWindowResize();
	}
}
class SliceViewDecorated extends LutDecorator(SliceView) { }
export {SliceViewDecorated as SliceView};
