
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
	}
	Add2dSceneElement(el) {
		this._scene2d.push(el);
	}
	Add3dSceneElement(el) {
		this._scene3d.push(el);
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
	Attach(area, element) {
		this._workarea = area;
		this._container = element;
		while (element.firstChild) {
			element.removeChild(container.firstChild);
		}
		this.canvas2d.width = this.Width;
		this.canvas2d.height = this.Height;
		element.appendChild(this.canvas2d);
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
		for(let i = 0; i < this._scene2d.length; i++)
			this._scene2d[i].Render();
	}
	_render3d()
	{
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
			this._scene3d[i].Render(this._workarea.glctx);

		gl.disable(gl.SCISSOR_TEST);
	}
	_attachEventListeners() {
		this.__onWindowResize = this._onWindowResize.bind(this);
		this.__onKeyDown = this._onKeyDown.bind(this);
		this.__onKeyUp = this._onKeyUp.bind(this);
		this.__onMouseMove = this._onMouseMove.bind(this);
		this.__onMouseDown = this._onMouseDown.bind(this);
		this.__onMouseUp = this._onMouseUp.bind(this);
		this.__onMouseWheel = this._onMouseWheel.bind(this);
		this.__onMouseOut = this._onMouseOut.bind(this);

		window.addEventListener('resize', this.__onWindowResize, false);
		document.addEventListener('keydown', this.__onKeyDown, false);
		document.addEventListener('keyup', this.__onKeyUp, false);
		this.canvas2d.addEventListener('mousemove', this.__onMouseMove, false);
		this.canvas2d.addEventListener('mousedown', this.__onMouseDown, false);
		this.canvas2d.addEventListener('mouseup', this.__onMouseUp, false);
		this.canvas2d.addEventListener('wheel', this.__onMouseWheel, false);
		this.canvas2d.addEventListener('mouseout', this.__onMouseOut, false);
		this.canvas2d.addEventListener("touchstart", touch2Mouse, true);
		this.canvas2d.addEventListener("touchmove", touch2Mouse, true);
		this.canvas2d.addEventListener("touchend", touch2Mouse, true);
	}
	_detachEventListeners() {
		window.removeEventListener('resize', this.__onWindowResize, false);
		document.removeEventListener('keydown', this.__onKeyDown, false);
		document.removeEventListener('keyup', this.__onKeyUp, false);
		this.canvas2d.removeEventListener('mousemove', this.__onMouseMove, false);
		this.canvas2d.removeEventListener('mousedown', this.__onMouseDown, false);
		this.canvas2d.removeEventListener('mouseup', this.__onMouseUp, false);
		this.canvas2d.removeEventListener('wheel', this.__onMouseWheel, false);
		this.canvas2d.removeEventListener('mouseout', this.__onMouseOut, false);
		this.canvas2d.removeEventListener("touchstart", touch2Mouse, true);
		this.canvas2d.removeEventListener("touchmove", touch2Mouse, true);
		this.canvas2d.removeEventListener("touchend", touch2Mouse, true);
	}
	_onWindowResize(){
		this.canvas2d.width = this.width;
		this.canvas2d.height = this.height;
		this._updateTransform();
	}
	_onKeyDown(e) { }
	_onKeyUp(e) { }
	_onMouseMove(e) { }
	_onMouseDown(e) { }
	_onMouseUp(e) { }
	_onMouseWheel(e) { }
	_onMouseOut(e) { }
}

function touch2Mouse(e)
{
	var theTouch = e.changedTouches[0];
	var mouseEv;

	switch(e.type)
	{
		case "touchstart": mouseEv="mousedown"; break;
		case "touchend":   mouseEv="mouseup"; break;
		case "touchmove":  mouseEv="mousemove"; break;
		default: return;
	}

	var mouseEvent = document.createEvent("MouseEvent");
	mouseEvent.initMouseEvent(mouseEv, true, true, window, 1, theTouch.screenX, theTouch.screenY, theTouch.clientX, theTouch.clientY, false, false, false, false, 0, null);
	theTouch.target.dispatchEvent(mouseEvent);

	e.preventDefault();
}

export { ViewBase };
