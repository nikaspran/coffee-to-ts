'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isPrivate = isPrivate;
exports.paramsByName = paramsByName;
exports.modifyWithScope = modifyWithScope;
exports.nameOf = nameOf;
exports.deprivatifiedName = deprivatifiedName;
exports.isConstructor = isConstructor;
exports.addToClass = addToClass;
exports.isMethodCallee = isMethodCallee;
exports.getClassBody = getClassBody;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isPrivate(node) {
	return node.name.startsWith('_');
}

function paramsByName(methodPath) {
	return _lodash2.default.keyBy(methodPath.get('params'), function (_ref) {
		var node = _ref.node;
		return nameOf(node);
	});
}

function modifyWithScope(modifier, identifier) {
	return {
		type: 'ScopeModifiedIdentifier',
		modifier: modifier,
		identifier: identifier
	};
}

function nameOf(maybeScopedIdentifier) {
	if (t.isAssignmentPattern(maybeScopedIdentifier)) {
		return nameOf(maybeScopedIdentifier.left);
	}

	return maybeScopedIdentifier.name || maybeScopedIdentifier.identifier.name;
}

function deprivatifiedName(node) {
	return nameOf(node).replace('_', '');
}

function isConstructor(path) {
	return path.node.kind === 'constructor';
}

function addToClass(classBody, property) {
	var members = classBody.get('body');

	var alreadyContainsMember = _lodash2.default.some(members, function (member) {
		return nameOf(member.node.key) === nameOf(property);
	});

	if (alreadyContainsMember) {
		return;
	}

	var constructor = _lodash2.default.find(members, isConstructor);
	if (constructor && (0, _lodash2.default)(paramsByName(constructor)).keys().includes(nameOf(property))) {
		return;
	}

	var newProperty = {
		type: 'ClassProperty',
		key: property
	};

	var firstProperty = _lodash2.default.find(members, function (member) {
		return t.isClassProperty(member.node);
	});
	if (firstProperty) {
		firstProperty.insertAfter(newProperty);
	} else {
		members[0].insertBefore(newProperty);
	}
}

function isMethodCallee(path) {
	return t.isCallExpression(path.parent) && path.parent.callee === path.node;
}

function getClassBody(path) {
	return path.findParent(function (path) {
		return t.isClassBody(path.node);
	});
}