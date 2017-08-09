import { mat4 } from 'gl-matrix';
import { LutElement } from './lutelement.js'

class Slice extends LutElement {
	constructor() {
		super();
		this._w2v = mat4.create();
		this._progressiveAlpha = false;
	}
	Render(glctx, camera) {
		var volume = this._volume;
		if(!volume) return;
		glctx.SwitchToSlice(volume);
		var voldesc = glctx.AcquireVolumeTexture(volume);

		super.Render(glctx, camera);

		glctx.SetUniforms({world2volume: this._w2v});
		glctx.SetUniforms({progressiveAlpha: this._progressiveAlpha});

		glctx.SetUniforms({
			map: voldesc.map,
			rescale: [volume.rescaleSlope, volume.rescaleIntercept],
			volumeSize: [volume.width, volume.height, volume.depth],
			voxelSize: volume.voxelSize,
			colrows: [voldesc.textureColumns, voldesc.textureRows],
			minmax: [volume._min, volume._max]
		});
		glctx.DrawQuad();
	}
	set volume(volume) {
		this._volume = volume;
		var iw = volume.width * volume.pixelWidth;
		var ih = volume.height * volume.pixelHeight;
		var id = volume.depth * volume.pixelDepth;
		var m = Math.max(iw, ih, id);
		mat4.set(this._w2v,
			...volume.xort, 0,
			...volume.yort, 0,
			...volume.zort, 0,
			0, 0, 0, 1);
		mat4.scale(this._w2v, this._w2v, [iw, ih, id]);
		mat4.invert(this._w2v, this._w2v);
	}
	get progressiveAlpha() { return this._progressiveAlpha; }
	set progressiveAlpha(val) { this._progressiveAlpha = val; }
}

export { Slice };
