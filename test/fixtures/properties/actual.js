class SomeController {
	_somePrivateMethod() {
		this.somePublicProperty = 'test';
		this._somePrivateProperty = 'private1';
	}

	somePublicMethod() {
		this.somePublicProperty = 'test2';
		this._somePrivateMethod();
		console.log(this.someOtherPublicProperty);
	}
}
