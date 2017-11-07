import {__moduleExports as dicomParser} from 'dicom-parser';
import parse from '../core/multipartparser.js'

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

class WadoWrapper {
	constructor(dataSet) {
		this._dataSet = dataSet;
		var ctype;
		this.pixelData = fetch(this._dataSet['7FE00010'].BulkDataURI).then(function(response) {
			if(response.ok) {
				ctype = response.headers.get('Content-Type');
				return response.arrayBuffer();
			}
			throw new Error('Error during BulkData fetch.');
		}).then(function(body) {
			var mpdata = parse(body, ctype);
			return new Uint8Array(mpdata[0].buffer.slice(mpdata[0].byteOffset));
		});
	}
	uint16(tag, index) { return this._getInt(tag, index); }
	int16(tag, index) { return this._getInt(tag, index); }
	uint32(tag, index) { return this._getInt(tag, index); }
	int32(tag, index) { return this._getInt(tag, index); }
	float(tag, index) { return this._getFloat(tag, index); }
	double(tag, index) { return this._getFloat(tag, index); }
	string(tag, index) {
		tag = tag.slice(-8).toUpperCase();
		var element = this._dataSet[tag];
		if (element && element.Value && element.Value.length > 0) {
			var str = element.Value[0];
			if (index >= 0) {
				var values = str.split('\\');
				return values[index].trim();
			}
			return str.trim();
		}
		return undefined;
	}
	text (tag, index) {
		tag = tag.slice(-8).toUpperCase();
		var element = this._dataSet[tag];
		if (element && element.Value && element.Value.length > 0) {
			var fixedString = element.Value[0];
			if (index >= 0) {
				var values = fixedString.split('\\');
				return values[index].replace(/ +$/, '');
			}
			return fixedString.replace(/ +$/, '');
		}
		return undefined;
	}
	floatString(tag, index) { return parseFloat(this.string(tag, index)); }
	intString(tag, index) { return parseInt(this.string(tag, index)); }

	_getInt(tag, index) {
		tag = tag.slice(-8).toUpperCase();
		var element = this._dataSet[tag];
		if (element && element.Value && element.Value.length > 0) {
			index = index || 0;
			return parseInt(element.Value[index]);
		}
		return undefined;
	}
	_getFloat(tag, index) {
		tag = tag.slice(-8).toUpperCase();
		index = index || 0;
		var element = this._dataSet[tag];
		if (element && element.Value && element.Value.length > 0) {
			index = index || 0;
			return parseFloat(element.Value[index]);
		}
		return undefined;
	}
}


class OrthancWrapper {
	constructor(id, dataSet) {
		this._dataSet = dataSet;
		this.pixelData = fetch(`/instances/${id}/content/7fe0-0010/0`).then(function(response) {
			if(response.ok) {
				return response.arrayBuffer().then((buf) => new Uint8Array(buf));
			}
			throw new Error('Error during PixelData fetch.');
		});
	}
	uint16(tag, index) { return this._getInt(tag, index); }
	int16(tag, index) { return this._getInt(tag, index); }
	uint32(tag, index) { return this._getInt(tag, index); }
	int32(tag, index) { return this._getInt(tag, index); }
	float(tag, index) { return this._getFloat(tag, index); }
	double(tag, index) { return this._getFloat(tag, index); }
	string(tag, index) {
		tag = `${tag.slice(1, 5)},${tag.slice(-4)}`;
		var element = this._dataSet[tag];
		if (element && element.Value) {
			var str = element.Value;
			if (index >= 0) {
				var values = str.split('\\');
				return values[index].trim();
			}
			return str.trim();
		}
		return undefined;
	}
	text (tag, index) {
		tag = `${tag.slice(1, 5)},${tag.slice(-4)}`;
		var element = this._dataSet[tag];
		if (element && element.Value) {
			var fixedString = element.Value;
			if (index >= 0) {
				var values = fixedString.split('\\');
				return values[index].replace(/ +$/, '');
			}
			return fixedString.replace(/ +$/, '');
		}
		return undefined;
	}
	floatString(tag, index) { return parseFloat(this.string(tag, index)); }
	intString(tag, index) { return parseInt(this.string(tag, index)); }

	_getInt(tag, index) {
		tag = `${tag.slice(1, 5)},${tag.slice(-4)}`;
		var element = this._dataSet[tag];
		if (element && element.Value) {
			index = index || 0;
			return parseInt(element.Value);
		}
		return undefined;
	}
	_getFloat(tag, index) {
		tag = `${tag.slice(1, 5)},${tag.slice(-4)}`;
		var element = this._dataSet[tag];
		if (element && element.Value) {
			index = index || 0;
			return parseFloat(element.Value);
		}
		return undefined;
	}
}

export {DatasetWrapper, WadoWrapper, OrthancWrapper};
