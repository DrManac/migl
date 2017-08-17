import {__moduleExports as dicomParser} from 'dicom-parser';
import {vec3} from 'gl-matrix';

class Image {
	constructor(dataSet) {
		this.uid = dataSet.string('x00080018');
		this.number = dataSet.string('x00200013');
		this.numberOfFrames = dataSet.intString('x00280008') || 1;
		this.width = dataSet.uint16('x00280011');
		this.height = dataSet.uint16('x00280010');
		this.pixelWidth = dataSet.floatString('x00280030', 0) || 1;
		this.pixelHeight = dataSet.floatString('x00280030', 1) || 1;
		this.windowCenter = dataSet.floatString('x00281050') || 127;
		this.windowWidth = dataSet.floatString('x00281051') || 255;
		this.rescaleIntercept = dataSet.floatString('x00281052') || 0;
		this.rescaleSlope = dataSet.floatString('x00281053') || 1;

		var xx = dataSet.floatString('x00200037', 0);
		var xy = dataSet.floatString('x00200037', 1);
		var xz = dataSet.floatString('x00200037', 2);
		var yx = dataSet.floatString('x00200037', 3);
		var yy = dataSet.floatString('x00200037', 4);
		var yz = dataSet.floatString('x00200037', 5);

		var px = dataSet.floatString('x00200032', 0);
		var py = dataSet.floatString('x00200032', 1);
		var pz = dataSet.floatString('x00200032', 2);

		this.xort = vec3.fromValues( xx, xy, xz );
		this.yort = vec3.fromValues( yx, yy, yz );
		this.pos =  vec3.fromValues( px, py, pz );

		this.bitsAllocated = dataSet.uint16('x00280100');
		this.pixelRepresentation = dataSet.uint16('x00280103');
		this.bytesPerPixel = this.bitsAllocated / 8;

		this._dataSet = dataSet;
	}
	get pixelData() { return this._dataSet.pixelData; }
}

export {Image};
