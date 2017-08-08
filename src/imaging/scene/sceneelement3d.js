import {mat4} from 'gl-matrix';

class SceneElement3d {
	constructor() {
		this.world = mat4.create();
	}
	Render(glctx, camera) {
		glctx.SetUniforms({
			projectionMatrix: camera.projection,
			viewMatrix: camera.view,
			worldMatrix: this.world
		});
	}
}

export {SceneElement3d};
