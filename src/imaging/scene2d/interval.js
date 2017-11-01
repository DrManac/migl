import {vec2, vec3, mat4} from 'gl-matrix';

class Interval {
	constructor() {
		this.begin = vec3.create();
		this.end = vec3.create();
	}
	get length() {
		return vec3.len(vec3.sub(vec3.create(), this.end, this.begin));
	}
	capture(e, camera, captureDistance) {
		var pos = vec2.fromValues(e.x, e.y);
		var begin = camera.worldToScreen(this.begin);
		var end = camera.worldToScreen(this.end);
		var sub = vec2.sub(vec2.create(), end, begin);
		var dis = Math.abs(sub[1] * pos[0] - sub[0] * pos[1] + end[0] * begin[1] - end[1] * begin[0]) / vec2.len(sub);
		var capturedLine = dis < captureDistance &&
			(vec2.distance(pos, begin) + vec2.distance(pos, end) < vec2.len(sub) + 2 * captureDistance);
		return capturedLine;
	}
	Render(ctx, camera, options) {
		options = options || {};
		var begin = camera.worldToScreen(this.begin);
		var end = camera.worldToScreen(this.end);
		var anchor = vec3.lerp(vec3.create(), begin, end, 0.5);
		var dir = vec2.normalize(vec2.create(), vec2.sub(vec2.create(), end, begin));

		var text = this.length.toFixed(1);

		var tpx_ = 0;
		var tpy_ = 20;
		var tpx = anchor[0] + dir[0] * tpx_ + dir[1] * tpy_;
		var tpy = anchor[1] + dir[1] * tpx_ - dir[0] * tpy_;

		ctx.save();

		ctx.beginPath();
		ctx.moveTo(begin[0], begin[1]);
		ctx.lineTo(end[0], end[1]);
		ctx.strokeStyle = options.color || "red";
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(anchor[0], anchor[1]);
		ctx.lineTo(tpx, tpy);
		ctx.strokeStyle = options.color || "red";
		ctx.setLineDash([5]);
		ctx.stroke();

		var tw = ctx.measureText(text).width;
		var th = ctx.measureText("M").width * 1.2;

		ctx.fillStyle = "rgba(128, 128, 128, 1)";
		ctx.fillRect(tpx - tw / 2, tpy - th / 2, tw, th);

		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(text, tpx, tpy);

		ctx.restore();
	}
}

export {Interval};
