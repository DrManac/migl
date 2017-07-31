import { mat4 } from 'gl-matrix';
import { SceneElement3d } from './sceneelement3d.js'

class Vr extends SceneElement3d {
	constructor() {
		super();
		mat4.perspective(this.projection, 0.392, 16/9, 0.1, 100);
		mat4.translate(this.view, this.view, [0, 0, -10]);
		this._black = 0;
		this._white = 255;
		this.mip = true;
	}
	Render(glctx) {
		var volume = this._volume;
		glctx.SwitchToVr(volume, this.mip);
		glctx.SetUniforms(this._uniforms);
		glctx.SetUniforms({
			inverseViewMatrix: mat4.invert(mat4.create(), this._uniforms.viewMatrix),
			inverseWorldMatrix: mat4.invert(mat4.create(), this._uniforms.worldMatrix)
		});

		glctx.SetUniforms({
			window: [this._black, this._white],
			lut: glctx.AcquireLutTexture(this._lut)
		});
		var voldesc = glctx.AcquireVolumeTexture(volume);
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

export { Vr };
