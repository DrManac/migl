import { vec3 } from 'gl-matrix';
import { ImageInfo } from './image.js'

class VolumeInfo extends ImageInfo {
	constructor(info) {
		super(info);
		var _info = info || {};

		this.depth = _info.depth || 1;
		this.pixelDepth = _info.pixelDepth || 1;
		this.zort = _info.zort || vec3.fromValues( 0, 0, 1 );
	}
	get voxelSize() {
		return vec3.fromValues( this.pixelWidth, this.pixelHeight, this.pixelDepth );
	}
}

class Volume extends VolumeInfo {
	constructor(info, data) {
		super(info);
		this._data = data || info._data || new Uint8Array(this.width * this.height * this.depth * this.bytesPerPixel);
		var array = this._data;
		
		var w = this.width, h = this.height, d = this.depth, wc = this.windowCenter, ww = this.windowWidth,
			rs = this.rescaleSlope, ri = this.rescaleIntercept;
		var elcnt = w * h * d;

		var min = 0;
		var max = 0;

		if(this.pixelRepresentation) //signed
		{
			if(this.bytesPerPixel == 1)
				this._pixelData = new Int8Array(array.buffer, array.byteOffset, elcnt);
			else
				this._pixelData = new Int16Array(array.buffer, array.byteOffset, elcnt);
		}
		else //unsigned
		{
			if(this.bytesPerPixel == 1)
				this._pixelData = new Uint8Array(array.buffer, array.byteOffset, elcnt);
			else
				this._pixelData = new Uint16Array(array.buffer, array.byteOffset, elcnt);
		}

		for (var i = 0; i < elcnt; i++) {
			var val = this._pixelData[i] * rs + ri;
			min = Math.min(min, val);
			max = Math.max(max, val);
		}

		this._min = min;
		this._max = max;
	}
}

export {VolumeInfo, Volume};