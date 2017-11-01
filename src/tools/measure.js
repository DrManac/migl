import {vec3, mat4} from 'gl-matrix';
import {Interval} from '../imaging/scene2d/interval.js'
import {MeasurementCollection} from '../imaging/scene2d/measurementcollection.js'

const MeasureDecorator = (superclass) => class extends superclass {
	constructor() {
		super();
		this.objects = new MeasurementCollection();
	}
	mmove(e, camera) {
		if(this.edittool && this.edittool.pressed) {
			this.edittool.mmove(e, camera);
			return;
		}
		if(this.pressed) {
			super.mmove(e, camera);
			return;
		}
		for(let i = 0; i < this.objects.length; i++) {
			let obj = this.objects.get(i);
			if(obj && obj.capture && obj.capture(e, camera)) {
				this.edittool = obj.editTool;
				this.edittool.object = obj;
				this.edittool.view = this.view;
				this.edittool.mmove(e, camera);
				return;
			}
		}
		if(this.edittool)
			this.edittool.view = null;
		this.edittool = null;

		super.mmove(e, camera);
	}
	mdown(e, camera) {
		if(this.edittool) {
			this.edittool.mdown(e, camera);
			return;
		}
		super.mdown(e, camera);
	}
	mup(e, camera) {
		if(this.edittool) {
			this.edittool.mup(e, camera);
			return;
		}
		super.mup(e, camera);
	}
	get view() { return this._view; }
	set view(view) {
		this._view = view;
		if(view && view._scene2d) {
			var mes = view._scene2d.filter(x => typeof x == 'MeasurementCollection');
			if(mes.length > 0)
				this.objects = mes[0];
			else {
				var mc = new MeasurementCollection();
				view.Add2dSceneElement(mc);
				this.objects = mc;
			}
		}
	}
	onResultChanged(obj) {
		this.objects.push(obj);
		if(this.view) this.view.InvalidateOverlay();
	}
}

class Measure {
	constructor() {
		this._edittool = new MeasureEdit();
		this.view = null;
		this.object = new Interval();
		this.object.editTool = this._edittool;
		this.pressed = false;
	}
	mmove(e, camera) {
		if(!this.pressed) return;
		this.object.end = camera.clipToWorld(e.clipX, e.clipY);
		if(this.view) this.view.InvalidateOverlay();
	}
	mdown(e, camera) {
		this.pressed = true;
		var world = camera.clipToWorld(e.clipX, e.clipY);
		this.object.begin = world;
		this.object.end = world;
	}
	mup(e) {
		this.pressed = false;
		if(this.object.length > 0)
			if(this.onResultChanged)
				this.onResultChanged(this.object);
		this.object = new Interval();
		this.object.editTool = this._edittool;
	}
	Render(ctx, camera, vprect) {
		if(this.object.length > 0)
			this.object.Render(ctx, camera, vprect);
	}
}

class MeasureEdit {
	constructor() {
	}
	mmove(e, camera) {
	}
	mdown(e, camera) {
	}
	mup(e) {
	}
}

class MeasureDecorated extends MeasureDecorator(Measure) { }

export {MeasureDecorated as Measure};
