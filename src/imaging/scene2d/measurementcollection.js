class MeasurementCollection {
	constructor() {
		this.objects = [];
	}
	Render(ctx, camera, vprect) {
		for(let i = 0; i < this.length; i++)
			this.objects[i].Render(ctx, camera, vprect);
	}
	get length() {
		return this.objects.length;
	}
	get(index) {
		return this.objects[index];
	}
	push(obj) {
		this.objects.push(obj);
	}
	remove(obj) {
		var idx = this.indexOf(obj);
		if(idx > -1)
			this.splice(idx, 1);
	}
}

export {MeasurementCollection};
