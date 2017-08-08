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
		this._hasChanges = true;
	}
	get hasChanges() { return this._hasChanges; }
	get world() { return this._uniforms.worldMatrix; }
	set world(mtx) { this._uniforms.worldMatrix = mtx; }
	get view() { return this._uniforms.viewMatrix; }
	set view(mtx) { this._uniforms.viewMatrix = mtx; }
	get projection() { return this._uniforms.projectionMatrix; }
	set projection(mtx) { this._uniforms.projectionMatrix = mtx; }
	Render(glctx) {
		glctx.SetUniforms(this._uniforms);
		this._hasChanges = false;
	}
}

export { SceneElement3d };
