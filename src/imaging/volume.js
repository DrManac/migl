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
		this._data = data ||
			Array.apply(null, {length: this.depth}).map(() => new Uint8Array(this.width * this.height * this.bytesPerPixel));
		this._data = this._data.map(src => Promise.resolve(src));

		var w = this.width, h = this.height, d = this.depth, wc = this.windowCenter, ww = this.windowWidth,
			rs = this.rescaleSlope, ri = this.rescaleIntercept;
		var elcnt = w * h;

		this._min = 0;
		this._max = 0;

		this._pixelData = this._data.map(
			(val) => val.then(
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
					return pd;
			}));
	}
}

export {VolumeInfo, Volume};
