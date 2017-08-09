
class ProgramCache {
	constructor() {
		this.map = new Map();
	}
	has(key) {
		return this.map.has(key);
	}
	get(key) {
		return this.map.get(key);
	}
	set(key, value) {
		this.map.set(key, value);
	}
}

export {ProgramCache};
