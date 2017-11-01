class MeasurementCollection {
	constructor() {
		this.objects = [];
	}
	Render(ctx, camera) {
		for(let i = 0; i < this.length; i++)
			this.objects[i].Render(ctx, camera);
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
		var idx = this.objects.indexOf(obj);
		if(idx > -1)
			this.objects.splice(idx, 1);
	}
}

export {MeasurementCollection};
