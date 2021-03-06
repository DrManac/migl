import {vec3, mat4} from 'gl-matrix';
import {Luts} from '../lut.js'
import {Slice} from '../scene/slice.js'
import {SliceView} from './sliceview.js'

class FusionView extends SliceView {
	constructor() {
		super();
		this._el3d2 = new Slice();
		this._el3d2.progressiveAlpha = true;
		this.Add3dSceneElement(this._el3d2);
		this.SetLut2(Luts.defaultOverlay);
	}
	SetVolume(vol) {
		super.SetVolume(vol);
		this._updateTranslation(vol, this._el3d2._volume);
	}
	SetVolume2(vol) {
		this._el3d2.volume = vol;
		this._updateTranslation(this._el3d._volume, vol);
		this.Invalidate3d();
	}
	SetLut2(lut) {
		lut.image.then((img) => {
			this._el3d2._lut = img;
			this.Invalidate3d();
		});
	}
	get invert2() { return this._el3d2._black > this._el3d2._white; }
	set invert2(invert) {
		if(invert == this.invert2) return;
		var tmp = this._el3d2._black;
		this._el3d2._black = this._el3d2._white;
		this._el3d2._white = tmp;
		this.Invalidate();
	}
	get voi2() { return this.invert2 ?
		{ black: this._el3d2._white, white: this._el3d2._black }:
		{ black: this._el3d2._black, white: this._el3d2._white };
	}
	set voi2(voi) {
		if(voi.black > voi.white - 1)
			voi.black = voi.white - 1;
		if(this.invert2)
		{
			this._el3d2._black = voi.white;
			this._el3d2._white = voi.black;
		} else {
			this._el3d2._black = voi.black;
			this._el3d2._white = voi.white;
		}
		this.Invalidate();
	}
	setDefaultWindow2(ii) {
		this.voi2 = {black: ii.windowCenter - ii.windowWidth / 2, white: ii.windowCenter + ii.windowWidth / 2};
	}
	_updateTransforms() {
		super._updateTransforms();
		mat4.copy(this._el3d2.world, this._el3d.world);
	}
	_updateTranslation(vol, vol2) {
		if(!vol || !vol2) return;
		var c1 = vec3.clone(vol.pos);
		var c2 = vec3.clone(vol2.pos);
		vec3.scaleAndAdd(c1, c1, vol.xort, vol.width * vol.pixelWidth / 2);
		vec3.scaleAndAdd(c1, c1, vol.yort, vol.height * vol.pixelHeight / 2);
		vec3.scaleAndAdd(c1, c1, vol.zort, vol.depth * vol.pixelDepth / 2);
		vec3.scaleAndAdd(c2, c2, vol2.xort, vol2.width * vol2.pixelWidth / 2);
		vec3.scaleAndAdd(c2, c2, vol2.yort, vol2.height * vol2.pixelHeight / 2);
		vec3.scaleAndAdd(c2, c2, vol2.zort, vol2.depth * vol2.pixelDepth / 2);
		vec3.sub(c1, c1, c2);
		vec3.scale(c1, c1, 2);
		this._el3d2.translation = c1;
	}
}

export {FusionView};
