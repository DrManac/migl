import {vec2, vec3, mat4} from 'gl-matrix';

class Interval {
	constructor() {
		this.begin = vec3.create();
		this.end = vec3.create();
	}
	Render(ctx, camera, vprect) {
		var width = vprect.width, height = vprect.height;
		var mtx = mat4.create();
		mat4.mul(mtx, camera.projection, camera.view);
		mat4.mul(mtx, mat4.fromTranslation(mat4.create(), [1, -1, 1]), mtx);
		mat4.mul(mtx, mat4.fromScaling(mat4.create(), [width * .5, -height * .5, .5]), mtx);
		var begin = vec3.transformMat4(vec3.create(), this.begin, mtx);
		var end = vec3.transformMat4(vec3.create(), this.end, mtx);
		var anchor = vec3.lerp(vec3.create(), begin, end, 0.5);
		var dir = vec2.normalize(vec2.create(), vec2.sub(vec2.create(), end, begin));

		var text = vec2.len(vec2.sub(vec2.create(), end, begin)).toFixed(1);

		var tpx_ = 0;
		var tpy_ = 20;
		var tpx = anchor[0] + dir[0] * tpx_ + dir[1] * tpy_;
		var tpy = anchor[1] + dir[1] * tpx_ - dir[0] * tpy_;

		ctx.save();

		ctx.beginPath();
		ctx.moveTo(begin[0], begin[1]);
		ctx.lineTo(end[0], end[1]);
		ctx.strokeStyle = "red";
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(anchor[0], anchor[1]);
		ctx.lineTo(tpx, tpy);
		ctx.strokeStyle = "red";
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
