import twgl from 'twgl-base.js'
import { Shaders } from './shaders.js'
import { TextureCache } from './texturecache.js'

class GlContext {
	constructor(canvas) {
		var gl = twgl.getWebGLContext(canvas, {preserveDrawingBuffer: true});
		this._gl = gl;
		this.float_texture_ext = gl.getExtension('OES_texture_float');
       	this.float_texture_linear_ext = gl.getExtension('OES_texture_float_linear');
		this.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		//this.MAX_TEXTURE_SIZE = 1024;

		this._volCache = new TextureCache();

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
	SwitchToVr(vi, mip) {
		var gl = this._gl;
		var tl = this._getVolumeTextureLayout(vi);
		if(!(this._vrProgramSigned === vi.pixelRepresentation &&
			this._vrProgramBpp === vi.bytesPerPixel &&
			this._vrProgramTextureCount === tl.textureCount &&
			this._vrProgramMip === mip)) {
				if(this._vrProgram)
					gl.deleteProgram(this._vrProgram.program);
				this._vrProgramSigned = vi.pixelRepresentation;
				this._vrProgramBpp = vi.bytesPerPixel;
				this._vrProgramTextureCount = tl.textureCount;
				this._vrProgramMip = mip;
				this._vrProgram = twgl.createProgramInfo(gl, [Shaders.vr_vertex, Shaders.vr_fragment(vi.pixelRepresentation, vi.bytesPerPixel, tl.textureCount, mip)]);
		}

		if(this._currentProgram != this._vrProgram) {
			this._gl.useProgram(this._vrProgram.program);
			twgl.setBuffersAndAttributes(this._gl, this._vrProgram, this._cubeBufferInfo);
			this._currentProgram = this._vrProgram;
		}
	}
	SwitchToSlice(vi) {
		var gl = this._gl;
		var tl = this._getVolumeTextureLayout(vi);
		if(!(this._sliceProgramSigned === vi.pixelRepresentation &&
			this._sliceProgramBpp === vi.bytesPerPixel &&
			this._sliceProgramTextureCount === tl.textureCount)) {
				if(this._sliceProgram)
					gl.deleteProgram(this._sliceProgram.program);
				this._sliceProgramSigned = vi.pixelRepresentation;
				this._sliceProgramBpp = vi.bytesPerPixel;
				this._sliceProgramTextureCount = tl.textureCount;
				this._sliceProgram = twgl.createProgramInfo(gl, [Shaders.slice_vertex, Shaders.slice_fragment(vi.pixelRepresentation, vi.bytesPerPixel, tl.textureCount)]);
		}

		if(this._currentProgram != this._sliceProgram) {
			this._gl.useProgram(this._sliceProgram.program);
			twgl.setBuffersAndAttributes(this._gl, this._sliceProgram, this._bufferInfo);
			this._currentProgram = this._sliceProgram;
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
	AcquireVolumeTexture(vol) {
		if(this._volCache.has(vol))
			return this._volCache.get(vol);
		var gl = this._gl;
		var tl = this._getVolumeTextureLayout(vol);
		var w = tl.textureWidth, h = tl.textureHeight, w4 = tl.stride;
		var map;
		var texture;
		if(tl.textureCount > 1)
		{
			texture = gl.createTexture();
			map = [texture];
		} else {
			map = gl.createTexture();
			texture = map;
		}
		gl.bindTexture(gl.TEXTURE_2D, texture);
		//var pixels = new Uint8Array(w * h * 4);
		//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		var xo = 0, yo = 0;
		for(var z = 0; z < vol.depth; z++)
		{
			vol._pixelData[z].then(textureFillFunction(gl, texture, xo, yo, w4, vol.height));
			//gl.texSubImage2D(gl.TEXTURE_2D, 0, xo, yo, w4, vol.height, gl.RGBA, gl.UNSIGNED_BYTE, vol._pixelData[z]);
			xo += w4;
			if(xo >= w)
			{
				xo = 0;
				yo += vol.height;
			}
			if(yo >= h && z != vol.depth - 1) {
				yo = 0;
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				texture = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, texture);
				//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
				map.push(texture);
			}
		}
		//pixels = null;
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);
		var voldesc = {
			map: map,
			textureColumns: tl.cols,
			textureRows: tl.rows
		};
		this._volCache.set(vol, voldesc);
		return voldesc;
	}
	AcquireLutTexture(lut) {
		var gl = this._gl;
		if(!this._lutTexture)
			this._lutTexture = gl.createTexture();
		if(this._lutSrc != lut)
		{
			gl.bindTexture(gl.TEXTURE_2D, this._lutTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lut);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.bindTexture(gl.TEXTURE_2D, null);
			this._lutSrc = lut;
		}
		return this._lutTexture;
	}
	DrawQuad() {
		var gl = this._gl;
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
	DrawCube() {
		var gl = this._gl;
		gl.drawElements(gl.TRIANGLES, this._cubeBufferInfo.numElements, this._cubeBufferInfo.elementType, 0);
	}
	_getVolumeTextureLayout(vi) {
		var sliceCnt = vi.depth;
		var sz4 = vi.width * vi.height * vi.depth * 0.25 * vi.bytesPerPixel;
		var w4 = (vi.width * vi.bytesPerPixel / 4);
		var mt = this.MAX_TEXTURE_SIZE;
		var w = near2(Math.sqrt(sz4));
		if( w > mt )
			w = mt;
		var cols = Math.floor(w / w4);
		var rows = Math.ceil(sliceCnt / cols);
		w = cols * w4;
		var h = rows * vi.height;
		var htotal = h;
		var textureCount = 1;
		if(h > mt) {
			h = mt;
			rows = Math.floor(h / vi.height);
			h = rows * vi.height;
			textureCount = Math.ceil(htotal / h);
		}
		return {
			textureWidth: w,
			textureHeight: h,
			stride: w4,
			cols: cols,
			rows: rows,
			textureCount: textureCount
		};
	}
}

function textureFillFunction(gl, texture, xo, yo, w4, vol_height) {
	return function(value) {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, xo, yo, w4, vol_height, gl.RGBA, gl.UNSIGNED_BYTE, value);
	}
}

function near2(val) {
	var pow = 1;
	while (pow < val) {
		pow <<= 1;
	}
	return pow;
}

export { GlContext };
