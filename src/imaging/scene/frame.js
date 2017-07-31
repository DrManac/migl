import { mat4 } from 'gl-matrix';
import { LutElement } from './lutelement.js'

class Frame extends LutElement {
	constructor() {
		super();
		this._imageUniform = { map: null };
	}
	Render(glctx) {
		glctx.SwitchToFrame();
		this._imageUniform.map = glctx.AcquireImageTexture(this._image);

		super.Render(glctx);

		glctx.SetUniforms(this._imageUniform);
		glctx.DrawQuad();
	}
	set image(img) {
		this._image = img;
		var iw = img.width * img.pixelWidth;
		var ih = img.height * img.pixelHeight;
		var m = Math.max(iw, ih);
		mat4.fromScaling(this.world, [ iw / m, ih / m, 1]);
	}
}

export { Frame };
