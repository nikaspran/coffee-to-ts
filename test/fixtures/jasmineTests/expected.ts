describe('testCase', () => {
	describe('innerTest', () => {
		it('should do something', () => {
			expect('something').toBeTruthy();
		});
	});

	describe('otherInnerTest', () => {
		it('case1', () => {});

		it('case2', () => {
			close();
			expect(vm.isClosing).not.toBeFalsy();
		});
	});

	describe('lastDescribe', () => {});
});
