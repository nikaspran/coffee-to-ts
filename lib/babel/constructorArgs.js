'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (_ref) {
	var t = _ref.types;

	var propertyAssignments = {
		AssignmentExpression: function AssignmentExpression(path) {
			var node = path.node;

			var assigningToThis = t.isMemberExpression(node.left) && t.isThisExpression(node.left.object);
			if (!assigningToThis) {
				return;
			}

			var samePropertyAsParam = node.left.property.name === node.right.name;
			if (!samePropertyAsParam) {
				return;
			}

			var constructorArgument = this.paramsByName[node.right.name];
			if (!constructorArgument) {
				return;
			}

			this.exposedAs(isPrivate(node.right) ? 'private' : 'public', constructorArgument);
			path.remove();
		}
	};

	function visitConstructor(path) {
		var node = path.node;


		path.traverse(propertyAssignments, {
			paramsByName: _lodash2.default.keyBy(path.get('params'), 'node.name'),
			exposedAs: function exposedAs(scope, paramPath) {
				if (isPrivate(paramPath.node)) {
					path.scope.rename(paramPath.node.name, deprivatifiedName(paramPath.node));
				}
				paramPath.replaceWith(modifyWithScope(scope, paramPath.node));
			}
		});
	}

	function visitMethod(path) {
		var keyPath = path.get('key');
		if (isPrivate(keyPath.node)) {
			keyPath.node.name = deprivatifiedName(keyPath.node);
			keyPath.replaceWith(modifyWithScope('private', keyPath.node));
		}
	}

	return {
		visitor: {
			ClassMethod: function ClassMethod(path) {
				var visitors = {
					constructor: visitConstructor,
					method: visitMethod
				};

				var visitor = visitors[path.node.kind];
				if (visitor) {
					visitor(path);
				}
			},
			MemberExpression: function MemberExpression(path) {
				var node = path.node;

				if (t.isThisExpression(node.object) && isPrivate(node.property)) {
					node.property.name = deprivatifiedName(node.property);
				}
			}
		}
	};
};

var _parser = require('babylon/lib/parser');

var _parser2 = _interopRequireDefault(_parser);

var _types = require('babylon/lib/tokenizer/types');

var _printer = require('babel-generator/lib/printer');

var _printer2 = _interopRequireDefault(_printer);

var _babelTypes = require('babel-types');

var babelTypes = _interopRequireWildcard(_babelTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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

function modifyWithScope(modifier, identifier) {
	return {
		type: 'ScopeModifiedIdentifier',
		modifier: modifier,
		identifier: identifier
	};
}

function isPrivate(node) {
	return node.name.startsWith('_');
}

function deprivatifiedName(node) {
	return node.name.replace('_', '');
}