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
		var pos = vec2.fromValues(e.x, e.y);
		var begin = camera.worldToScreen(this.object.begin);
		var end = camera.worldToScreen(this.object.end);

		if (!this.pressed) {
			this.beginIsActive = vec2.distance(pos, begin) < CAPTURE_DISTANCE;
			this.endIsActive = vec2.distance(pos, end) < CAPTURE_DISTANCE;
			this.boxIsActive = (pos[0] >= this.object.trect.minx && pos[0] <= this.object.trect.maxx && pos[1] >= this.object.trect.miny && pos[1] <= this.object.trect.maxy);
			return;
		}
		var posWorld = camera.clipToWorld(e.clipX, e.clipY);
		if(!this.endIsActive && !this.boxIsActive)
			vec3.add(this.object.begin, this.object.begin, vec3.sub(vec3.create(), posWorld, this.prev));
		if(!this.beginIsActive && !this.boxIsActive)
			vec3.add(this.object.end, this.object.end, vec3.sub(vec3.create(), posWorld, this.prev));
		if(this.boxIsActive) {
			var anchor = vec2.lerp(vec2.create(), begin, end, this.object.anchor);
			var sub = vec2.sub(vec2.create(), end, begin);
			var dir = vec2.normalize(vec2.create(), sub);
			var norm = vec2.fromValues(dir[1], -dir[0]);
			var tp = vec2.scaleAndAdd(vec2.create(), anchor, dir, this.object.texpos[0]);
			vec2.scaleAndAdd(tp, tp, norm, this.object.texpos[1]);
			vec2.add(tp, tp, vec2.sub(vec2.create(), pos, this.prevScreen));
			this.object.anchor = vec2.dot(sub, vec2.sub(vec2.create(), tp, begin)) / vec2.dot(sub, sub);
			if(this.object.anchor > 1.0) this.object.anchor = 1.0;
			if(this.object.anchor < 0.0) this.object.anchor = 0.0;
			vec2.lerp(anchor, begin, end, this.object.anchor);
			vec2.sub(tp, tp, anchor);
			vec2.set(this.object.texpos, vec2.dot(tp, dir), vec2.dot(tp, norm));
		}
		this.prev = posWorld;
		this.prevScreen = pos;
	}
	mdown(e, camera) {
		this.pressed = true;
		this.prev = camera.clipToWorld(e.clipX, e.clipY);
		this.prevScreen = vec2.fromValues(e.x, e.y);
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
