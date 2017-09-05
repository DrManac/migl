import {vec3, mat4} from 'gl-matrix';
import {VolumeViewBase} from './volumeviewbase.js'
import {Slice} from '../scene/slice.js'
import {LutDecorator} from './lutdecorator.js'
import {ActiveToolDecorator} from './activetooldecorator.js'

class SliceView extends VolumeViewBase {
	constructor() {
		super();
		this._el3d = new Slice();
		this.Add3dSceneElement(this._el3d);
		this._xort = [1, 0, 0];
		this._yort = [0, 1, 0];
		this._zort = [0, 0, 1];
		this._disp = 0;
		this._cameraTransform = mat4.create();
	}
	SetOrts(xort, yort) {
		this._xort = xort;
		this._yort = yort;
		vec3.cross(this._zort, xort, yort);
		this._updateTransforms();
	}
	setSlicePoint(pt) {
		pt = vec3.transformMat4(vec3.create(), pt, this._cameraTransform);
		this._disp = vec3.dot(pt, this._zort);
		this._updateTransforms();
	}
	applyCameraTransform(transform) {
		mat4.mul(this._cameraTransform, this._cameraTransform, transform);
		this._updateTransforms();
	}
	_updateTransforms() {
		super._updateTransforms();
		var aspect = this.Width / this.Height;
		var amtx = mat4.create();
		if(aspect > 1)
			mat4.fromScaling(amtx, [1 / aspect, 1, 1]);
		else
			mat4.fromScaling(amtx, [1, aspect, 1]);
		mat4.ortho(this._camera.projection, -1, 1, 1, -1, -1, 1);
		mat4.mul(this._camera.projection, this._camera.projection, amtx);

		var volume = this._el3d._volume;
		if(volume) {
			var iw = volume.width * volume.pixelWidth;
			var ih = volume.height * volume.pixelHeight;
			var id = volume.depth * volume.pixelDepth;
			var m = Math.max(iw, ih, id);
			mat4.scale(this._camera.projection, this._camera.projection, [1/m, 1/m, 1/m]);
			var ori = mat4.fromValues(
				...this._xort, 0,
				...this._yort, 0,
				...this._zort, 0,
				0, 0, 0, 1);
			mat4.translate(ori, ori, [0, 0, this._disp]);
			mat4.invert(this._camera.view, ori);
			mat4.mul(this._camera.view, this._camera.view, this._cameraTransform);
			mat4.mul(this._el3d.world, this._camera.projection, this._camera.view);
			mat4.invert(this._el3d.world, this._el3d.world);
		}
	}
}
class SliceViewDecorated extends ActiveToolDecorator(LutDecorator(SliceView)) { }
export {SliceViewDecorated as SliceView};
