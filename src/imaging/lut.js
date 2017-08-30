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

//Luts.push(new Lut("Grayscale", "lut/grayscale.png"));
Luts.push(new Lut("16Step", "lut/16Step.png"));
//Luts.push(new Lut("30PercBlack", "lut/30PercBlack.png"));
Luts.push(new Lut("ADACIsocontour", "lut/ADACIsocontour.png"));
Luts.push(new Lut("Auxctq", "lut/Auxctq.png"));
Luts.push(new Lut("BWInvLog", "lut/BWInvLog.png"));
Luts.push(new Lut("BWLog", "lut/BWLog.png"));
//Luts.push(new Lut("BWParabolic", "lut/BWParabolic.png"));
//Luts.push(new Lut("Cyclic", "lut/Cyclic.png"));
//Luts.push(new Lut("Designer", "lut/Designer.png"));
Luts.push(new Lut("ECATRainbow", "lut/ECATRainbow.png"));
//Luts.push(new Lut("Edges", "lut/Edges.png"));
Luts.push(new Lut("Heart", "lut/Heart.png"));
Luts.push(new Lut("Hotbody", "lut/Hotbody.png"));
Luts.push(new Lut("Isocount", "lut/Isocount.png"));
Luts.push(new Lut("Linear", "lut/Linear.png"));
Luts.push(new Lut("MicroDeltaHotMetal", "lut/MicroDeltaHotMetal.png"));
Luts.push(new Lut("PagePhase", "lut/PagePhase.png"));
Luts.push(new Lut("Parathyroid", "lut/Parathyroid.png"));
//Luts.push(new Lut("PETSUVMask", "lut/PETSUVMask.png"));
Luts.push(new Lut("PIXEF", "lut/PIXEF.png"));
//Luts.push(new Lut("QGS10Step", "lut/QGS10Step.png"));
//Luts.push(new Lut("Rainbow", "lut/Rainbow.png"));
Luts.push(new Lut("Red", "lut/Red.png"));
Luts.push(new Lut("Region", "lut/Region.png"));
//Luts.push(new Lut("Siemens PET SUV 50", "lut/Siemens%20PET%20SUV%2050.png"));
//Luts.push(new Lut("Siemens PET SUV 75", "lut/lut/Siemens%20PET%20SUV%2075.png"));
Luts.push(new Lut("Smart1", "lut/Smart1.png"));
Luts.push(new Lut("Spectrum", "lut/Spectrum.png"));
Luts.push(new Lut("Spectrum10Step", "lut/Spectrum10Step.png"));
Luts.push(new Lut("spohaRainbow", "lut/spohaRainbow.png"));
Luts.push(new Lut("Stars", "lut/Stars.png"));
Luts.push(new Lut("Thal", "lut/Thal.png"));
//Luts.push(new Lut("WarmMetal", "lut/WarmMetal.png"));
//Luts.push(new Lut("XT6Cardiac", "lut/XT6Cardiac.png"));

export { Lut, Luts };
