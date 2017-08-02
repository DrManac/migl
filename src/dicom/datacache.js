import {__moduleExports as dicomParser} from 'dicom-parser';

export var DataCache = {
	cache: {},
	pending: {},
	getDataSet: function(image){
		var that = this;
		var url =  image.url;
		if(this.cache[url]){
			return Promise.resolve(this.cache[url]);
		}
		if(this.pending[url]) {
			return this.pending[url];
		}
		var promise = fetch(url).then(
			function(response) {
				if(response.ok)
					return response.arrayBuffer();
				throw new Error("Bad response")
			}).then(
			function (arrayBuffer) {
				var byteArray = new Uint8Array(arrayBuffer);
				var dataSet = dicomParser.parseDicom(byteArray);
				that.cache[url] = dataSet;
				delete that.pending[url];
				return dataSet;
			}
		).catch(
			function(error) {
				console.log('There has been a problem with your fetch operation: ' + error.message);
				delete that.pending[url];
			});
		this.pending[url] = promise;
		return promise;
	},
	store: function(image, dataSet)
	{
		this.cache[image.url] = dataSet;
	}
};
