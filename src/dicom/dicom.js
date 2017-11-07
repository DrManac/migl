import {__moduleExports as dicomParser} from 'dicom-parser';
import {vec3} from 'gl-matrix';
import {DatasetWrapper, WadoWrapper, OrthancWrapper} from './datasetwrapper.js';
import {Image as DicomImage} from './image.js';
import {Series} from './series.js';
import {Study} from './study.js';
import {ImageInfo} from '../imaging/image.js'
import {Volume, VolumeInfo} from '../imaging/volume.js'

function volumeInfoFromImageInfoStack(imageInfos) {
	var vi = {};
	var ii = imageInfos[0];
	vi.width = ii.width;
	vi.height = ii.height;
	vi.depth = imageInfos.length;
	vi.bitsAllocated = ii.bitsAllocated;
	vi.bytesPerPixel = ii.bytesPerPixel;
	vi.pixelRepresentation = ii.pixelRepresentation;
	vi.rescaleIntercept = ii.rescaleIntercept;
	vi.rescaleSlope = ii.rescaleSlope;
	vi.xort = ii.xort;
	vi.yort = ii.yort;
	var spacing = 1;
	vi.zort = vec3.fromValues(0, 0, 1);
	if(imageInfos.length > 1)
	{
		var ii2 = imageInfos[1];
		vec3.cross(vi.zort, vi.xort, vi.yort);
		spacing = vec3.dot(vi.zort, vec3.sub(vec3.create(), ii2.pos, ii.pos));
		vec3.scale(vi.zort, vi.zort, Math.sign(spacing));
	}
	vi.pixelWidth = ii.pixelWidth;
	vi.pixelHeight = ii.pixelHeight;
	vi.pixelDepth = Math.abs(spacing);
	vi.pos = ii.pos;
	vi.windowCenter = ii.windowCenter;
	vi.windowWidth = ii.windowWidth;
	return vi;
}

function volumesFromSeries(series) {
	if(!series.isVolumetric) return Promise.resolve([new Volume()]);
	var ns = series.numberOfSlices;
	if(!ns) ns = series.images.length;
	var iis = series.images.map(function(ii, index){
		return {
			ii: ii,
			//volumeIndex: ((parseInt(ii.number) - 1) / ns) | 0,
			volumeIndex: (index / ns) | 0,
		};
	});
	var res = [];
	var vc = series.volumeCount;
	if(!vc)
		vc = series.images.length / ns;
	for(var vind = 0; vind < vc; vind++)
	{
		var filtered = iis.filter(function(el) { return el.volumeIndex === vind; });
		var vi = volumeInfoFromImageInfoStack(filtered.map(function(el) { return el.ii; }));
		var data = [];
		for(var i = 0; i < filtered.length; i++)
			data.push(filtered[i].ii.pixelData);
		res.push(new Volume(vi, data));
	}
	return res;
}

function readFile(file, resolve) {
	var reader = new FileReader();
	reader.onload = function(evt) {
		var arrayBuffer = reader.result;
		resolve(arrayBuffer);
	}
	reader.readAsArrayBuffer(file);
}

export var Dicom = {
	Image : DicomImage,
	Series : Series,
	Study : Study,
	volumesFromSeries : volumesFromSeries,
	volumesFromStudies : function(studies) {
		var volSeries = ([].concat(...studies.map(st => st.series)));
		volSeries = volSeries.filter(se => se.isVolumetric);
		return [].concat(...volSeries.map(volumesFromSeries));
	},
	getStudiesFromFiles : function(files) {
		var promises = [];
		var studyMap = {};
		var studies = [];
		for(var i = 0; i < files.length; i++)
			promises.push(new Promise(
				function(resolve, reject){
					readFile(files[i], resolve);
				}).then(function(buffer) {
					var byteArray = new Uint8Array(buffer);
					var dataSet = new DatasetWrapper(dicomParser.parseDicom(byteArray));
					var studyuid = dataSet.string('x0020000d');
					var study = studyMap[studyuid];
					if(study === undefined) {
						study = new Study(dataSet)
						studyMap[studyuid] = study;
						studies.push(study);
					}
					study.push(dataSet);
				}));

		return Promise.all(promises).then(() => studies);
	},
	getStudiesFromWado : function(url) {
		var fetchInit = {headers: new Headers({"Accept" : "application/json"})};
		return fetch(url, fetchInit).then(function(response) {
			if(response.ok)
				return response.json();
			throw new Error('Network response was not ok.');
		}).then(function(obj) {
			var studyMap = {};
			var studies = [];
			for(var i = 0; i < obj.length; i++)
			{
				var dataSet = new WadoWrapper(obj[i]);
				var studyuid = dataSet.string('x0020000d');
				var study = studyMap[studyuid];
				if(study === undefined) {
					study = new Study(dataSet)
					studyMap[studyuid] = study;
					studies.push(study);
				}
				study.push(dataSet);
			}
			return studies;
		}).catch(function(error) {
			console.log(error);
		});
	},
	getSeriesFromWado : function(wadoRoot, studyuid, seriesuid) {
		var fetchInit = {headers: new Headers({"Accept" : "application/json"})};
		var url = `${wadoRoot}/studies/${studyuid}/series/${seriesuid}/metadata`;
		return fetch(url, fetchInit).then(function(response) {
			if(response.ok)
				return response.json();
			throw new Error('Network response was not ok.');
		}).then(function(obj) {
			var studyMap = {};
			var studies = [];
			for(var i = 0; i < obj.length; i++)
			{
				var dataSet = new WadoWrapper(obj[i]);
				var studyuid = dataSet.string('x0020000d');
				var study = studyMap[studyuid];
				if(study === undefined) {
					study = new Study(dataSet)
					studyMap[studyuid] = study;
					studies.push(study);
				}
				study.push(dataSet);
			}
			return studies[0].series[0];
		}).catch(function(error) {
			console.log(error);
		});
	},
	getSeriesFromOrthanc : function(seriesuid) {
		var fetchInit = {headers: new Headers({"Accept" : "application/json"})};
		var url = `/series/${seriesuid}`;
		return fetch(url, fetchInit).then(function(response) {
			if(response.ok)
				return response.json();
			throw new Error('Network response was not ok.');
		}).then(function(obj) {
			return Promise.all(obj.Instances.map(uid => fetch(`/instances/${uid}/tags`, fetchInit).then(function(response) {
				if(response.ok)
					return response.json().then((json) => ({id: uid, json: json}));
				throw new Error('Network response was not ok.');
			})));
		}).then(function(obj) {
			var studyMap = {};
			var studies = [];
			for(var i = 0; i < obj.length; i++)
			{
				var dataSet = new OrthancWrapper(obj[i].id, obj[i].json);
				var studyuid = dataSet.string('x0020000d');
				var study = studyMap[studyuid];
				if(study === undefined) {
					study = new Study(dataSet)
					studyMap[studyuid] = study;
					studies.push(study);
				}
				study.push(dataSet);
			}
			return studies[0].series[0];
		})/*.catch(function(error) {
			console.log(error);
		})*/;
	}
};
