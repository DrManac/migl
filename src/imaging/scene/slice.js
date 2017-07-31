import { LutElement } from './lutelement.js'

class Slice extends LutElement {
	constructor() {
		super();
	}
	Render(glctx) {
		var volume = this._volume;
		glctx.SwitchToSlice(volume);
		var voldesc = glctx.AcquireVolumeTexture(volume);

		super.Render(glctx);

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
	}
}

export { Slice };
