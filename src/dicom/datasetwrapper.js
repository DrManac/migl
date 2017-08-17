import {__moduleExports as dicomParser} from 'dicom-parser';

class DatasetWrapper {
	constructor(dataSet) {
		this._dataSet = dataSet;
	}
	uint16(tag, index) { return this._dataSet.uint16(tag, index); }
	int16(tag, index) { return this._dataSet.int16(tag, index); }
	uint32(tag, index) { return this._dataSet.uint32(tag, index); }
	int32(tag, index) { return this._dataSet.int32(tag, index); }
	float(tag, index) { return this._dataSet.float(tag, index); }
	double(tag, index) { return this._dataSet.double(tag, index); }
	string(tag, index) { return this._dataSet.string(tag, index); }
	text(tag, index) { return this._dataSet.text(tag, index); }
	floatString(tag, index) { return this._dataSet.floatString(tag, index); }
	intString(tag, index) { return this._dataSet.intString(tag, index); }

	get pixelData() {
		var pixelDataElement = this._dataSet.elements.x7fe00010;
		return new Uint8Array(this._dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
	}
}

export {DatasetWrapper};
