import {vec3, mat4} from 'gl-matrix';

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

export const ActiveToolDecorator = (superclass) => class extends superclass {
	constructor() {
		super();
		this._activeTool = null;
	}
	get activetool() { return this._activeTool; }
	set activetool(tool) {
		this._activeTool = tool;
		tool.view = this;
	}
	_attachEventListeners() {
		super._attachEventListeners();
		this.__onKeyDown = this._onKeyDown.bind(this);
		this.__onKeyUp = this._onKeyUp.bind(this);
		this.__onMouseMove = this._onMouseMove.bind(this);
		this.__onMouseDown = this._onMouseDown.bind(this);
		this.__onMouseUp = this._onMouseUp.bind(this);
		this.__onMouseWheel = this._onMouseWheel.bind(this);
		this.__onMouseOut = this._onMouseOut.bind(this);

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
		super._detachEventListeners();
	}
	_onKeyDown(e) {
		if(this._activeTool && this._activeTool.kdown)
			this._activeTool.kdown(e);
	}
	_onKeyUp(e) {
		if(this._activeTool && this._activeTool.kup)
			this._activeTool.kup(e);
	}
	_onMouseMove(e) {
		if(this._activeTool && this._activeTool.mmove)
			this._activeTool.mmove(this._convertMouseEvent(e), this._camera);
	}
	_onMouseDown(e) {
		if(this._activeTool && this._activeTool.mdown)
			this._activeTool.mdown(this._convertMouseEvent(e), this._camera);
	}
	_onMouseUp(e) {
		if(this._activeTool && this._activeTool.mup)
			this._activeTool.mup(this._convertMouseEvent(e), this._camera);
	}
	_onMouseWheel(e) {
		if(this._activeTool && this._activeTool.mwheel)
			this._activeTool.mwheel(e);
	}
	_onMouseOut(e) {
		if(this._activeTool && this._activeTool.mout)
			this._activeTool.mout(e);
	}
	_convertMouseEvent(e) {
		var rect = this.canvas2d.getBoundingClientRect();
		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;
		var normedX = x / this.Width;
		var normedY = y / this.Height;
		var clipX = 2 * normedX - 1;
		var clipY = 1 - 2 * normedY;
		return {
			button: e.button,
			x: x,
			y: y,
			normedX: normedX,
			normedY: normedY,
			clipX: clipX,
			clipY: clipY
		}
	}
};
