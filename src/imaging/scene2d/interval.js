import {vec3, mat4} from 'gl-matrix';

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
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(begin[0], begin[1]);
		ctx.lineTo(end[0], end[1]);
		ctx.strokeStyle = "red";
		ctx.stroke();
		ctx.restore();
	}
}

export {Interval};
