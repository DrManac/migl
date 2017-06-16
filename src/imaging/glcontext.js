import twgl from 'twgl-base.js'
import { Shaders } from './shaders.js'

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
	SwitchToFrame() {
		var gl = this._gl;
		if(!this._frameProgram)
			this._frameProgram = twgl.createProgramInfo(gl, [Shaders.frame_vertex, Shaders.frame_fragment]);
		if(this._currentProgram != this._frameProgram) {
			gl.useProgram(this._frameProgram.program);
			twgl.setBuffersAndAttributes(gl, this._frameProgram, this._bufferInfo);
			this._currentProgram = this._frameProgram;
		}
	}
	SetUniforms(u) {
		twgl.setUniforms(this._currentProgram, u);
	}
	AcquireImageTexture(img) {
		var gl = this._gl;
		if(!this._frameTexture)
			this._frameTexture = gl.createTexture();

		var elcnt = img.width * img.height;
		var rs = img.rescaleSlope, ri = img.rescaleIntercept;
		var pixels = new Float32Array(elcnt);

		for (var i = 0; i < elcnt; i++) {
			var val = img._pixelData[i];
			pixels[i] = (val * rs + ri);
		}

		gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, img.width, img.height, 0, gl.LUMINANCE, gl.FLOAT, pixels);
		//gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, this.width, this.height, 0, gl.RED, gl.FLOAT, pixels);
		// if(nolinear)
		// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		// else
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.bindTexture(gl.TEXTURE_2D, null);

		return this._frameTexture;
	}
	AcquireLutTexture(lut) {
		return null;
	}
}

export { GlContext };
