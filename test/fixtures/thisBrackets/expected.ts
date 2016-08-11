class SomeClass {
	reset(objects = []) {
		let keys = Object.getOwnPropertyNames(this);
		while (keys.length) {
			delete this[keys.shift()];
		}

		return this.add(objects);
	}
}
