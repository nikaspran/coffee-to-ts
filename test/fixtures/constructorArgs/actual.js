class SomeController {
	constructor(someLocal, somePublic, _somePrivate, someLocalDefault = {}) {
		this.somePublic = somePublic;
		this._somePrivate = _somePrivate;
		this.somethingElse = _somePrivate;
		const x = someLocal;
		console.log(x);
	}

	someMethod() {
		console.log(this._somePrivate);
	}
}
