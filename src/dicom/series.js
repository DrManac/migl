import {__moduleExports as dicomParser} from 'dicom-parser';
import {Image} from './image.js';
import {parseDateTime} from './utils.js';

class Series {
	constructor(study, dataSet) {
		this.study = study;
	   	this.imageMap = {};
		this.images = [];

		this.uid = dataSet.string('x0020000e');
		this.dateTime = parseDateTime(dataSet, 'x00080021', 'x00080031');
		this.modality = dataSet.string('x00080060');
		this.number = dataSet.string('x00200011');
		this.description = dataSet.string('x0008103e');

		this.description = decodeURIComponent(escape(this.description));

		//volumetric properties determination
		switch (this.modality) {
			case 'PT':
				this.isVolumetric = (dataSet.string('x00541000', 1) == 'IMAGE');
				this.numberOfSlices = dataSet.uint16('x00540081');
				break;
			case 'CT':
				this.isVolumetric = (dataSet.string('x00080008', 2) == 'AXIAL');
				this.volumeCount = 1;
				break;
			case 'MR':
				this.isVolumetric = true;
				this.volumeCount = 1;
				break;
			default:
		}
	}
	push(dataSet) {
		var instanceuid = dataSet.string('x00080018');
		var image = this.imageMap[instanceuid];
		if(image === undefined)
		{
			image = new Image(dataSet);
			this.imageMap[instanceuid] = image;
			this.images.push(image);
			this.images.sort(function(a, b) { return a.number - b.number; });
		}
	}
	get numberOfFrames() {
		return this.images.reduce(function(acc, val){ return acc + val.numberOfFrames }, 0);
	}
}

export {Series};
