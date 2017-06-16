import { mat4 } from 'gl-matrix';

class SceneElement3d {
	constructor() {
		var mworld = mat4.create();
		var mview = mat4.create();
		var mproj = mat4.create();
		mat4.ortho(mproj, -1, 1, 1, -1, -1, 1);
		this._uniforms = {
			projectionMatrix: mproj,
			viewMatrix: mview,
			worldMatrix: mworld,
		};
	}
	Render(glctx) { } 
}

export { SceneElement3d };
