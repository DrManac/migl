import {vec3, mat4} from 'gl-matrix';
import {ImageInfo} from './image.js'

class VolumeInfo extends ImageInfo {
	constructor(info) {
		super(info);
		var _info = info || {};

		this.depth = _info.depth || 1;
		this.pixelDepth = _info.pixelDepth || 1;
		this.zort = _info.zort || vec3.fromValues( 0, 0, 1 );

		this._w2v = mat4.set(mat4.create(),
			...this.xort, 0,
			...this.yort, 0,
			...this.zort, 0,
			0, 0, 0, 1);
		mat4.scale(this._w2v, this._w2v, [this.pixelWidth, this.pixelHeight, this.pixelDepth]);
		mat4.translate(this._w2v, this._w2v, [-this.width, -this.height, -this.depth]);
		mat4.scale(this._w2v, this._w2v, [2, 2, 2])
		mat4.invert(this._w2v, this._w2v);
	}
	get voxelSize() {
		return vec3.fromValues( this.pixelWidth, this.pixelHeight, this.pixelDepth );
	}
	worldToVolume(vec) {
		return vec3.transformMat4(vec3.create(), vec, this._w2v);
	}
}

class Volume extends VolumeInfo {
	constructor(info, data) {
		super(info);
		this._data = data ||
			Array.apply(null, {length: this.depth}).map(() => new Uint8Array(this.width * this.height * this.bytesPerPixel));
		this._data = this._data.map(src => Promise.resolve(src));

		var w = this.width, h = this.height, d = this.depth, wc = this.windowCenter, ww = this.windowWidth,
			rs = this.rescaleSlope, ri = this.rescaleIntercept;
		var elcnt = w * h;

		this._min = 0;
		this._max = 0;

		this._loadedData = this._data.map((val) => null);

		this._pixelData = this._data.map(
			(val, idx) => val.then(
				(sliceData) => {
					var pd;
					if(this.pixelRepresentation) //signed
					{
						if(this.bytesPerPixel == 1)
							pd = new Int8Array(sliceData.buffer, sliceData.byteOffset, elcnt);
						else
							pd = new Int16Array(sliceData.buffer, sliceData.byteOffset, elcnt);
					}
					else //unsigned
					{
						if(this.bytesPerPixel == 1)
							pd = new Uint8Array(sliceData.buffer, sliceData.byteOffset, elcnt);
						else
							pd = new Uint16Array(sliceData.buffer, sliceData.byteOffset, elcnt);
					}
					for (var i = 0; i < elcnt; i++) {
						var val = pd[i] * rs + ri;
						this._min = Math.min(this._min, val);
						this._max = Math.max(this._max, val);
					}
					this._loadedData[idx] = pd;
					return pd;
			}));
	}
	sampleWorld(vec) {
		var pt = this.worldToVolume(vec);
		vec3.floor(pt, pt);
		if(pt[0] < 0 || pt[0] >= this.width || pt[1] < 0 || pt[1] >= this.height || pt[2] < 0 || pt[2] >= this.depth)
			return undefined;
		if(!this._loadedData[pt[2]])
			return undefined;
		return this._loadedData[pt[2]][pt[0] + pt[1] * this.width] * this.rescaleSlope + this.rescaleIntercept;
	}
}

export {VolumeInfo, Volume};
