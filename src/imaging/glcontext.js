import twgl from 'twgl-base.js'

class GlContext {
	constructor(canvas) {
		var gl = twgl.getWebGLContext(canvas);
		this._gl = gl;
		this.float_texture_ext = gl.getExtension('OES_texture_float');
       	this.float_texture_linear_ext = gl.getExtension('OES_texture_float_linear');

		gl.clearColor(0.2, 0.3, 0.2, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.depthFunc(gl.LEQUAL);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		//gl.cullFace(gl.FRONT);
		gl.disable(gl.CULL_FACE);

		var arrays = {
			position: { numComponents: 3, data: [1.0,  1.0,  0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0] },
			uv: { numComponents: 2, data: [1.0,  1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0] },
			uv2: { numComponents: 2, data: [1.0,  1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0] }
		};

		var cube = {
  			position: [1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1],
  			normal:   [1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1],
  			uv: { numComponents: 2, data: [1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1] },
  			indices:  [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],
		};

		this._bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
		this._cubeBufferInfo = twgl.createBufferInfoFromArrays(gl, cube)
	}
	get gl() { return this._gl; }
}

export { GlContext };
