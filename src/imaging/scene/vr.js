import {mat4} from 'gl-matrix';
import {LutElement} from './lutelement.js'

class Vr extends LutElement {
	constructor() {
		super();
		this.mip = true;
	}
	Render(glctx, camera) {
		var volume = this._volume;
		glctx.SwitchToVr(volume, this.mip);
		var voldesc = glctx.AcquireVolumeTexture(volume);

		super.Render(glctx, camera);

		glctx.SetUniforms({
			inverseViewMatrix: mat4.invert(mat4.create(), camera.view),
			inverseWorldMatrix: mat4.invert(mat4.create(), this.world)
		});
		glctx.SetUniforms({
			map: voldesc.map,
			rescale: [volume.rescaleSlope, volume.rescaleIntercept],
			volumeSize: [volume.width, volume.height, volume.depth],
			voxelSize: volume.voxelSize,
			colrows: [voldesc.textureColumns, voldesc.textureRows],
			minmax: [volume._min, volume._max]
		});
		glctx.DrawCube();
	}
	set volume(volume) {
		this._volume = volume;
		var iw = volume.width * volume.pixelWidth;
		var ih = volume.height * volume.pixelHeight;
		var id = volume.depth * volume.pixelDepth;
		var m = Math.max(iw, ih, id);
		mat4.fromScaling(this.world, [ iw / m, ih / m, id / m]);
	}
}

export {Vr};
