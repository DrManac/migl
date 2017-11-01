import {vec3, mat3} from 'gl-matrix';

class Compass {
	constructor() {
		this._ori = mat3.create();
		this._xort = vec3.create();
		this._yort = vec3.create();
		this._zort = vec3.create();
	}
	Render(ctx, camera) {
		var width = camera.width, height = camera.height;
		//should be camera.projection * camera.view and then y inverted (or yort is (0, -1, 0))
		//works as is as long mat4.ortho(this._camera.projection, -1, 1, 1, -1, -1, 1);
		mat3.fromMat4(this._ori, camera.view);
		vec3.set(this._xort, 1, 0, 0);
		vec3.set(this._yort, 0, 1, 0);
		vec3.set(this._zort, 0, 0, 1);
		vec3.transformMat3(this._xort, this._xort, this._ori);
		vec3.transformMat3(this._yort, this._yort, this._ori);
		vec3.transformMat3(this._zort, this._zort, this._ori);
		vec3.normalize(this._xort, this._xort);
		vec3.normalize(this._yort, this._yort);
		vec3.normalize(this._zort, this._zort);

		var al = 20;
		var ts = 10;
		var al2 = al + ts;
		ctx.save();

		ctx.textBaseline = "middle";
		ctx.textAlign = "center";

		ctx.translate(width - al2 - ts, height - al2 - ts);
		ctx.beginPath();
		ctx.moveTo(-this._xort[0] * al, -this._xort[1] * al);
		ctx.lineTo(this._xort[0] * al, this._xort[1] * al);
		ctx.strokeStyle = "red";
		ctx.stroke();
		ctx.strokeText("L", this._xort[0] * al2, this._xort[1] * al2);
		ctx.strokeText("R", -this._xort[0] * al2, -this._xort[1] * al2);
		ctx.beginPath();
		ctx.moveTo(-this._yort[0] * al, -this._yort[1] * al);
		ctx.lineTo(this._yort[0] * al, this._yort[1] * al);
		ctx.strokeStyle = "green";
		ctx.stroke();
		ctx.strokeText("P", this._yort[0] * al2, this._yort[1] * al2);
		ctx.strokeText("A", -this._yort[0] * al2, -this._yort[1] * al2);
		ctx.beginPath();
		ctx.moveTo(-this._zort[0] * al, -this._zort[1] * al);
		ctx.lineTo(this._zort[0] * al, this._zort[1] * al);
		ctx.strokeStyle = "cyan";
		ctx.stroke();
		ctx.strokeText("S", this._zort[0] * al2, this._zort[1] * al2);
		ctx.strokeText("I", -this._zort[0] * al2, -this._zort[1] * al2);
		ctx.restore();
	}
}

export {Compass};
