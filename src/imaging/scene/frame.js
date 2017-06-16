import { SceneElement3d } from './sceneelement3d.js'

class Frame extends SceneElement3d {
	constructor() {
		super();
		this._black = 0;
		this._white = 255;
	}
	Render(glctx) {
		glctx.SwitchToFrame();
		glctx.SetUniforms(this._uniforms);
		glctx.SetUniforms({
			map: glctx.AcquireImageTexture(this._image),
			window: [this._black, this._white],
			//transform: this._transform,
			lut: glctx.AcquireLutTexture(this._lut)
		});
		glctx.gl.drawArrays(glctx.gl.TRIANGLE_STRIP, 0, 4);
	}
}

export { Frame };
