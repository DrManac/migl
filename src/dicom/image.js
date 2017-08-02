import {__moduleExports as dicomParser} from 'dicom-parser';
import {DataCache} from './datacache.js';

class Image {
	constructor(pars) {
		if(pars instanceof dicomParser.DataSet)
			this._fromDataSet(pars);
		else
			this._fromImageObject(pars);
	}
	_fromDataSet(dataSet) {
		this.uid = dataSet.string('x00080018');
		this.number = dataSet.string('x00200013');
		this.numberOfFrames = parseInt(dataSet.string('x00280008')) || 1;
		this._dataSet = dataSet;
	}
	_fromImageObject(obj) {
		this.uid = obj.uid;
		this.number = obj.number;
		this.numberOfFrames = obj.numberOfFrames;
		this._url = obj.url || obj._url;
	}
	get url() {
		return this._url;
	}
	set url(url) {
		this._url = url;
		DataCache.store(this, this._dataSet);
		delete this._dataSet;
	}
	get dataSet(){
		if(this._dataSet)
			return Promise.resolve(this._dataSet);
		return DataCache.getDataSet(this);
	}
}

export {Image};
