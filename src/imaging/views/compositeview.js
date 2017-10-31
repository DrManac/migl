class CompositeView {
	constructor() {
		this._views = arguments;
	}
	Add2dSceneElement(el) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].Add2dSceneElement)
				this._views[i].Add2dSceneElement(el);
	}
	Add3dSceneElement(el) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].Add3dSceneElement)
				this._views[i].Add3dSceneElement(el);
	}
	Render() {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].Render)
				this._views[i].Render();
	}
	Invalidate() {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].Invalidate)
				this._views[i].Invalidate();
	}
	Invalidate3d() {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].Invalidate3d)
				this._views[i].Invalidate3d();
	}
	InvalidateOverlay() {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].InvalidateOverlay)
				this._views[i].InvalidateOverlay();
	}
	SetLut(lut) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].SetLut)
				this._views[i].SetLut(lut);
	}
	SetLut2(lut) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].SetLut2)
				this._views[i].SetLut2(lut);
	}
	get invert() { return this._views.length > 0 ? this._views[0].invert : false; }
	set invert(invert) {
		for(let i = 0; i < this._views.length; i++)
			if('invert' in this._views[i])
				this._views[i].invert = invert;
	}
	get voi() { return this._views.length > 0 ? this._views[0].voi : {black: 0, white: 255}; }
	set voi(voi) {
		for(let i = 0; i < this._views.length; i++)
			if('voi' in this._views[i])
				this._views[i].voi = voi;
	}
	get voi2() { return this._views.length > 0 ? this._views[0].voi2 : {black: 0, white: 255}; }
	set voi2(voi) {
		for(let i = 0; i < this._views.length; i++)
			if('voi2' in this._views[i])
				this._views[i].voi2 = voi;
	}
	setDefaultWindow(ii) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].setDefaultWindow)
				this._views[i].setDefaultWindow(ii);
	}
	setDefaultWindow2(ii) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].setDefaultWindow2)
				this._views[i].setDefaultWindow2(ii);
	}
	get activetool() { return this._views.length > 0 ? this._views[0].activetool : null; }
	set activetool(tool) {
		for(let i = 0; i < this._views.length; i++)
			if('activetool' in this._views[i])
				this._views[i].activetool = tool;
		tool.view = this;
	}
	get zoom() { return this._views.length > 0 ? this._views[0].zoom : 1; }
	set zoom(zoom) {
		for(let i = 0; i < this._views.length; i++)
			if('zoom' in this._views[i])
				this._views[i].zoom = zoom;
	}
	SetVolume(vol) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].SetVolume)
				this._views[i].SetVolume(vol);
	}
	SetVolume2(vol) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].SetVolume2)
				this._views[i].SetVolume2(vol);
	}
	setSlicePoint(pt) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].setSlicePoint)
				this._views[i].setSlicePoint(pt);
	}
	applyCameraTransform(transform) {
		for(let i = 0; i < this._views.length; i++)
			if(this._views[i].applyCameraTransform)
				this._views[i].applyCameraTransform(transform);
	}
}

export {CompositeView};
