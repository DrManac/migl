import { vec3 } from 'gl-matrix';

class ImageInfo {
	constructor(info) {
		var _info = info || {};
		this.number = _info.number || 1;
		this.width = _info.width || 1;
		this.height = _info.height || 1;

		this.pixelWidth = _info.pixelWidth || 1;
		this.pixelHeight = _info.pixelHeight || 1;

		this.windowCenter = _info.windowCenter || 127;
		this.windowWidth = _info.windowWidth || 255;

		this.rescaleIntercept = _info.rescaleIntercept || 0;
		this.rescaleSlope = _info.rescaleSlope || 1;

		this.xort = _info.xort || vec3.fromValues( 1, 0, 0 );
		this.yort = _info.yort || vec3.fromValues( 0, 1, 0 );
		this.pos =  _info.pos || vec3.fromValues( 0, 0, 0 );

		this.bitsAllocated = _info.bitsAllocated || 8;
		this.pixelRepresentation = _info.pixelRepresentation || 0;
		this.bytesPerPixel = this.bitsAllocated / 8;
	}
}

class Image extends ImageInfo {
	constructor(info, data) {
		super(info);

		this._data = data || new Uint8Array(this.width * this.height * this.bytesPerPixel);
		var array = this._data;
		
		var w = this.width, h = this.height, wc = this.windowCenter, ww = this.windowWidth,
			rs = this.rescaleSlope, ri = this.rescaleIntercept;
		var elcnt = w * h;

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

export { ImageInfo, Image };

