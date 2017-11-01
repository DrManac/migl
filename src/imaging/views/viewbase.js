import {Camera} from '../scene/camera.js'

class ViewBase {
	constructor() {
		this.canvas2d = document.createElement('canvas');
		this.canvas2d.style.position = 'absolute';
		this.canvas2d.style.left = '0px';
		this.canvas2d.style.right = '0px';
		this.canvas2d.style.top = '0px';
		this.canvas2d.style.bottom = '0px';
		this.gr = this.canvas2d.getContext("2d");
		this._hasChanges3d = true;
		this._hasChanges2d = true;
		this._scene2d = [];
		this._scene3d = [];
		this._camera = new Camera();
	}
	Add2dSceneElement(el) {
		this._scene2d.push(el);
		this.InvalidateOverlay();
	}
	Add3dSceneElement(el) {
		this._scene3d.push(el);
		this.Invalidate3d();
	}
	Render() {
		if(!this._attached) return;
		if(this._hasChanges3d) {
			this._render3d();
			this._hasChanges3d = false;
		}
		if(this._hasChanges2d) {
			this._render2d();
			this._hasChanges2d = false;
		}
	}
	Invalidate() {
		this._hasChanges2d = true;
		this._hasChanges3d = true;
	}
	Invalidate3d() {
		this._hasChanges3d = true;
	}
	InvalidateOverlay() {
		this._hasChanges2d = true;
	}
	Attach(area, element) {
		this._workarea = area;
		this._container = element;
		while (element.firstChild) {
			element.removeChild(container.firstChild);
		}
		element.appendChild(this.canvas2d);
		this._onWindowResize();
		this._attachEventListeners();
		this._attached = true;
	}
	Detach() {
		this._attached = false;
		this._detachEventListeners();
		this._container.removeChild(this.canvas2d);
		this.canvas2d.width = 1;
		this.canvas2d.height = 1;
		this._container = null;
		this._workarea = null;
	}
	get Width() { return this._container.clientWidth; }
	get Height() { return this._container.clientHeight; }
	_render2d() {
		let width = this.Width, height = this.Height;
		this.gr.clearRect(0, 0, width, height);
		for(let i = 0; i < this._scene2d.length; i++)
			this._scene2d[i].Render(this.gr, this._camera);
	}
	_render3d()	{
		//determine viewport rectangle (x, y, width, height)
		var x = 0;
		var y = 0;
		var width = this.Width, height = this.Height;
		var node = this._container;
		var root = this._workarea.container;
		while(node != root && node !== null) {
			x += node.offsetLeft;
			y += node.offsetTop;
			node = node.parentElement;
		}
		y = root.clientHeight - y - height;

		//begin 3D drawing
		var gl = this._workarea.glctx.gl;
		gl.enable(gl.SCISSOR_TEST);

		gl.scissor(x, y, width, height);
		gl.viewport(x, y, width, height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//render scene elemnts
		for(let i = 0; i < this._scene3d.length; i++)
			this._scene3d[i].Render(this._workarea.glctx, this._camera);

		gl.disable(gl.SCISSOR_TEST);
	}
	_attachEventListeners() {
		this.__onWindowResize = this._onWindowResize.bind(this);
		this.__onGlContextStateChange = this._onGlContextStateChange.bind(this);

		window.addEventListener('resize', this.__onWindowResize, false);
		this._workarea.glctx.addEventListener("changed", this.__onGlContextStateChange, true);
	}
	_detachEventListeners() {
		window.removeEventListener('resize', this.__onWindowResize, false);
		this._workarea.glctx.removeEventListener("changed", this.__onGlContextStateChange, true);
	}
	_onWindowResize() {
		this._camera.width = this.canvas2d.width = this.Width;
		this._camera.height = this.canvas2d.height = this.Height;
		this.Invalidate();
	}
	_onGlContextStateChange() {
		this.Invalidate3d();
	}
}

export { ViewBase };
