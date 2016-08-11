describe('testCase', function () {
	describe('innerTest', () => it('should do something', function () {
		return expect('something').toBeTruthy();
	}));

	describe('otherInnerTest', function () {
		it('case1', function () {
		});

		return it('case2', function () {
			close();
			return expect(vm.isClosing).not.toBeFalsy();
		});
	});

	return describe('lastDescribe', function () {
	});
});
