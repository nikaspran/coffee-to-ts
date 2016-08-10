'use strict';

var _printer = require('babel-generator/lib/printer');

var _printer2 = _interopRequireDefault(_printer);

var _babelTypes = require('babel-types');

var babelTypes = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

stubClassMethodValidatorToAllowForScopeModifiedIdentifiers();
function stubClassMethodValidatorToAllowForScopeModifiedIdentifiers() {
	var originalValidator = babelTypes.NODE_FIELDS.ClassMethod.key.validate;

	babelTypes.NODE_FIELDS.ClassMethod.key.validate = function (node, key, val) {
		if (val.type === 'ScopeModifiedIdentifier') {
			return true;
		} else {
			return originalValidator(node, key, val);
		}
	};
}

_printer2.default.prototype.ScopeModifiedIdentifier = function (node) {
	this.word(node.modifier);
	this.space();
	this.print(node.identifier, node);
};