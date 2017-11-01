import {vec2, vec3, mat4} from 'gl-matrix';
import {Interval} from '../imaging/scene2d/interval.js'
import {MeasurementCollection} from '../imaging/scene2d/measurementcollection.js'

const CAPTURE_DISTANCE = 10;
const COLOR_ACTIVE = 'yellow';

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
			if(obj && obj.capture && obj.capture(e, camera, CAPTURE_DISTANCE)) {
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
		if(this.view) this.view.InvalidateOverlay();

		super.mmove(e, camera);
	}
	mdown(e, camera) {
		if(this.edittool) {
			if(e.button == 1) {
				this.objects.remove(this.edittool.object);
				this.edittool.view = null;
				this.edittool = null;
				if(this.view) this.view.InvalidateOverlay();
				return;
			}
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
			var mes = view._scene2d.filter(x => x instanceof MeasurementCollection);
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
	Render(ctx, camera) {
		if(this.edittool) {
			this.edittool.Render(ctx, camera);
			return;
		}
		super.Render(ctx, camera);
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
	Render(ctx, camera) {
		if(this.object.length > 0)
			this.object.Render(ctx, camera);
	}
}

class MeasureEdit {
	constructor() {
	}
	mmove(e, camera) {
		if(this.view) this.view.InvalidateOverlay();
		if (!this.pressed) {
			let pos = vec2.fromValues(e.x, e.y);
			let begin = camera.worldToScreen(this.object.begin);
			let end = camera.worldToScreen(this.object.end);
			this.beginIsActive = vec2.distance(pos, begin) < CAPTURE_DISTANCE;
			this.endIsActive = vec2.distance(pos, end) < CAPTURE_DISTANCE;
			return;
		}
		var posWorld = camera.clipToWorld(e.clipX, e.clipY);
		if(!this.endIsActive)
			vec3.add(this.object.begin, this.object.begin, vec3.sub(vec3.create(), posWorld, this.prev));
		if(!this.beginIsActive)
			vec3.add(this.object.end, this.object.end, vec3.sub(vec3.create(), posWorld, this.prev));
		this.prev = posWorld;
	}
	mdown(e, camera) {
		this.pressed = true;
		this.prev = camera.clipToWorld(e.clipX, e.clipY);
	}
	mup(e, camera) {
		this.pressed = false;
	}
	Render(ctx, camera) {
		if(this.object.length > 0)
			this.object.Render(ctx, camera, {color: COLOR_ACTIVE});
		var begin = camera.worldToScreen(this.object.begin);
		var end = camera.worldToScreen(this.object.end);
		ctx.save();
		ctx.fillStyle = 'red';
		if (this.beginIsActive)
			ctx.fillStyle = COLOR_ACTIVE;
		ctx.beginPath();
		ctx.arc(begin[0], begin[1], 4, 0, 2 * Math.PI);
		ctx.fill();
		ctx.fillStyle = 'red';
		if (this.endIsActive)
		  ctx.fillStyle = COLOR_ACTIVE;
		ctx.beginPath();
		ctx.arc(end[0], end[1], 4, 0, 2 * Math.PI);
		ctx.fill();
		ctx.restore();
	}
}

class MeasureDecorated extends MeasureDecorator(Measure) { }

export {MeasureDecorated as Measure};
