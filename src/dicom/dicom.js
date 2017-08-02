import {__moduleExports as dicomParser} from 'dicom-parser';
import {vec3} from 'gl-matrix';
import {Image as DicomImage} from './image.js';
import {Series} from './series.js';
import {Study} from './study.js';
import {ImageInfo} from '../imaging/image.js'
import {Volume, VolumeInfo} from '../imaging/volume.js'

function imageInfoFromDataSet(dataSet) {
	var ii = {};
	ii.number = dataSet.string('x00200013');
	ii.width = dataSet.uint16('x00280011');
	ii.height = dataSet.uint16('x00280010');
	ii.pixelWidth = parseFloat(dataSet.string('x00280030', 0)) || 1;
	ii.pixelHeight = parseFloat(dataSet.string('x00280030', 1)) || 1;
	ii.windowCenter = parseFloat(dataSet.string('x00281050')) || 127;
	ii.windowWidth = parseFloat(dataSet.string('x00281051')) || 255;
	ii.rescaleIntercept = parseFloat(dataSet.string('x00281052')) || 0;
	ii.rescaleSlope = parseFloat(dataSet.string('x00281053')) || 1;

	var xx = parseFloat(dataSet.string('x00200037', 0));
	var xy = parseFloat(dataSet.string('x00200037', 1));
	var xz = parseFloat(dataSet.string('x00200037', 2));
	var yx = parseFloat(dataSet.string('x00200037', 3));
	var yy = parseFloat(dataSet.string('x00200037', 4));
	var yz = parseFloat(dataSet.string('x00200037', 5));

	var px = parseFloat(dataSet.string('x00200032', 0));
	var py = parseFloat(dataSet.string('x00200032', 1));
	var pz = parseFloat(dataSet.string('x00200032', 2));

	ii.xort = vec3.fromValues( xx, xy, xz );
	ii.yort = vec3.fromValues( yx, yy, yz );
	ii.pos =  vec3.fromValues( px, py, pz );

	ii.bitsAllocated = dataSet.uint16('x00280100');
	ii.pixelRepresentation = dataSet.uint16('x00280103');
	ii.bytesPerPixel = ii.bitsAllocated / 8;
	return ii;
}
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
	vi.pixelDepth = spacing;
	return vi;
}

function volumesFromSeries(series) {
	if(!series.isVolumetric) return Promise.resolve([new Volume()]);
	return Promise.all(series.images.map(img => img.dataSet)).then(
		function(dataSets) {
			var ns = series.numberOfSlices;
			if(!ns) ns = dataSets.length;
			var iis = dataSets.map(function(ds){
				var ii = imageInfoFromDataSet(ds);
				return {
					ii: ii,
					volumeIndex: ((parseInt(ii.number) - 1) / ns) | 0,
					ds: ds,
				};
			});
			var res = [];
			var vc = series.volumeCount;
			if(!vc)
				vc = dataSets.length / ns;
			for(var vind = 0; vind < vc; vind++)
			{
				var filtered = iis.filter(function(el) { return el.volumeIndex === vind; });
				var vi = volumeInfoFromImageInfoStack(filtered.map(function(el) { return el.ii; }));
				var data = [];
				for(var i = 0; i < filtered.length; i++)
				{
					var dataSet = filtered[i].ds;
					var ii = filtered[i].ii;
					var pixelDataElement = dataSet.elements.x7fe00010;
					var pixelData = new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
					data.push(pixelData);
				}
				res.push(new Volume(vi, data));
			}
			return res;
		}
	);
}

export var Dicom = {
	Image : DicomImage,
	Series : Series,
	Study : Study,
	LoadVolumes : function(buffers) {
		var studyMap = {};
		var studies = [];
		for(var i = 0; i < buffers.length; i++) {
			var byteArray = new Uint8Array(buffers[i]);
			var dataSet = dicomParser.parseDicom(byteArray);
			var studyuid = dataSet.string('x0020000d');
			var study = studyMap[studyuid];
			if(study === undefined) {
				study = new Study(dataSet)
				studyMap[studyuid] = study;
				studies.push(study);
			}
			study.push(dataSet);
		}
		var volSeries = ([].concat(...studies.map(st => st.series)));
		volSeries = volSeries.filter(se => se.isVolumetric);
		return Promise.all(volSeries.map(volumesFromSeries)).then(
			function(volArrays) {
				return [].concat(...volArrays);
		});
	}
};
