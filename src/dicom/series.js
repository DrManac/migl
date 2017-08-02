import {__moduleExports as dicomParser} from 'dicom-parser';
import {Image} from './image.js';

class Series {
	constructor(study, pars) {
		this.study = study;
	   	this.imageMap = {};
		this.images = [];

		if(pars instanceof dicomParser.DataSet)
			this._fromDataSet(pars);
		else
			this._fromSeriesObject(pars);
	}
	_fromDataSet(dataSet) {
		this.uid = dataSet.string('x0020000e');
		this.date = dicomParser.parseDA(dataSet.string('x00080021'));
		this.time = dicomParser.parseTM(dataSet.string('x00080031'));
		this.dateTime = new Date(this.date.year, this.date.month, this.date.day, this.time.hours, this.time.minutes);
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
	_fromSeriesObject(obj) {
		this.uid = obj.uid;
		this.dateTime = new Date(obj.dateTime);
		this.modality = obj.modality;
		this.number = obj.number;
		this.description = obj.description;
		this.isVolumetric = obj.isVolumetric;
		this.numberOfSlices = obj.numberOfSlices;
		this.volumeCount = obj.volumeCount;
		obj.images.sort(function(a, b) { return a.number - b.number; });
		for(var i = 0; i < obj.images.length; i++)
		{
			var image = new Image(obj.images[i]);
			this.imageMap[image.uid] = image;
			this.images.push(image);
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
