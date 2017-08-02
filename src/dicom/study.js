import {__moduleExports as dicomParser} from 'dicom-parser';
import {Series} from './series.js';

class Study {
	constructor(pars) {
		this.seriesMap = {};
		this.series = [];

		if(pars instanceof dicomParser.DataSet)
			this._fromDataSet(pars);
		else
			this._fromStudyObject(pars);
	}
	_fromDataSet(dataSet) {
		this.uid = dataSet.string('x0020000d');
	   	this.date = dicomParser.parseDA(dataSet.string('x00080020'));
	   	this.time = dicomParser.parseTM(dataSet.string('x00080030'));
		this.dateTime = new Date(this.date.year, this.date.month, this.date.day, this.time.hours, this.time.minutes);
	   	this.description = dataSet.string('x00081030');
	   	this.patientId = dataSet.string('x00100020');
	   	this.patientName = dataSet.string('x00100010');

	   	this.patientName = decodeURIComponent(escape(this.patientName));
	   	this.description = decodeURIComponent(escape(this.description));
	}
	_fromStudyObject(obj) {
		this.uid = obj.uid;
		this.dateTime = new Date(obj.dateTime);
		this.description = obj.description;
		this.patientId = obj.patientId;
		this.patientName = obj.patientName;
		obj.series.sort(function(a, b) { return a.number - b.number; });

		for(var i = 0; i < obj.series.length; i++)
		{
			var series = new Series(this, obj.series[i]);
			this.seriesMap[series.uid] = series;
			this.series.push(series);
		}
	}
	push(dataSet)
   	{
   		var seriesuid = dataSet.string('x0020000e');
   		var series = this.seriesMap[seriesuid];
   		if(series === undefined)
   		{
   			series = new Series(this, dataSet);
   			this.seriesMap[seriesuid] = series;
			this.series.push(series);
			this.series.sort(function(a, b) { return a.number - b.number; });
   		}
   		series.push(dataSet);
   	}
	get modality(){
		function onlyUnique(value, index, self) {
			return self.indexOf(value) === index;
		}
		return this.series.map(function(val) { return val.modality }).filter(onlyUnique).join('/');
	}
	get seriesCount(){
		return this.series.length;
	}
	get numberOfFrames(){
		return this.series.reduce(function(acc, val){ return acc + val.numberOfFrames }, 0);
	}
}

export {Study};
