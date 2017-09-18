import grayscaleUrl from './lut/grayscale.png';
import warmMetalUrl from './lut/WarmMetal.png';

class Lut {
	constructor(name, url) {
		this.name = name;
		this.url = url;

		var self = this;

		this.image = new Promise(function(resolve, reject) {
			var img = new Image();
			function clearEventHandlers() {
				img.removeEventListener('error', onError);
				img.removeEventListener('load', onLoad);
			}
			function onError(e) {
				var msg = "couldn't load image: " + url;
				console.error(msg);
				clearEventHandlers();
				reject(e);
			}
			function onLoad() {
				clearEventHandlers();
				resolve(img);
			}

			img.addEventListener('error', onError);
			img.addEventListener('load', onLoad);
			img.src = url;
		});
	}
}

var Luts = {
	default: new Lut("Grayscale", grayscaleUrl),
	defaultOverlay: new Lut("WarmMetal", warmMetalUrl),
	urlMap: {},
	list: [],
	add: function(name, url) {
		var lut = new Lut(name, url);
		this.push(lut);
	},
	push: function(lut) {
		this.list.push(lut);
		this.urlMap[lut.url] = lut;
	},
	getLut: function(url)
	{
		var res = this.urlMap[url];
		return res;
	},
	get length() {
		return this.list.length;
	}
};

export { Lut, Luts };
