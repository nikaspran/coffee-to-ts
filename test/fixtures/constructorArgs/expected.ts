class SomeController {
	constructor(someLocal, public somePublic, private somePrivate) {
		this.somethingElse = somePrivate;
		const x = someLocal;
		console.log(x);
	}

	someMethod() {
		console.log(this.somePrivate);
	}
}
