import { SceneElement3d } from './sceneelement3d.js'

class LutElement extends SceneElement3d {
	constructor() {
		super();
		this._black = 0;
		this._white = 255;
		this._lut = null;
	}
	Render(glctx, camera) {
		var lut = glctx.AcquireLutTexture(this._lut);

		super.Render(glctx, camera);

		glctx.SetUniforms({
			window: [this._black, this._white],
			lut: lut
		});
	}
}

export { LutElement };
