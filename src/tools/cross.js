import {vec3} from 'gl-matrix';

class Cross {
	constructor() {
		this.view = null;
		this.pressed = false;
		this._point = vec3.create();
	}
	mmove(e, camera) {
		if(!this.pressed) return;
		this._point = camera.clipToWorld(e.clipX, e.clipY);
		if(this.view)
			this.view.setSlicePoint(this._point);
	}
	mdown(e, camera) {
		this.pressed = true;
		this._point = camera.clipToWorld(e.clipX, e.clipY);
		if(this.view)
			this.view.setSlicePoint(this._point);
	}
	mup(e) {
		this.pressed = false;
	}
	mwheel(e) {

	}
	Render(ctx, camera) {
		ctx.save();
		var pt = camera.worldToScreen(this._point);
		var gap = 10;
		var len = 1000;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(pt[0] + gap, pt[1]);
		ctx.lineTo(pt[0] + len, pt[1]);
		ctx.moveTo(pt[0] - gap, pt[1]);
		ctx.lineTo(pt[0] - len, pt[1]);
		ctx.moveTo(pt[0], pt[1] + gap);
		ctx.lineTo(pt[0], pt[1] + len);
		ctx.moveTo(pt[0], pt[1] - gap);
		ctx.lineTo(pt[0], pt[1] - len);
		ctx.strokeStyle = 'red';
		ctx.stroke();
		ctx.restore();
	}

}

export {Cross};
