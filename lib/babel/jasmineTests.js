'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (_ref) {
	var t = _ref.types;

	return {
		visitor: {
			CallExpression: function CallExpression(path) {
				var node = path.node;


				if ((0, _utils.isRawFunctionCall)(node, 'describe')) {
					maybeReplaceInlineArrowFunctionWithBlock(node);
					maybeReplaceFunctionWithArrowFunction(node);
				}

				if ((0, _utils.isRawFunctionCall)(node, 'it')) {
					maybeReplaceFunctionWithArrowFunction(node);
				}
			},
			ReturnStatement: function ReturnStatement(path) {
				var node = path.node;


				if (!t.isCallExpression(node.argument)) {
					return;
				}

				if ((0, _utils.isRawFunctionCall)(node.argument, 'describe') || (0, _utils.isRawFunctionCall)(node.argument, 'it')) {
					return path.replaceWith(node.argument);
				}

				var isExpectChain = findRootFluentFunctionCall(node.argument, 'expect');
				if (isExpectChain) {
					return path.replaceWith(node.argument);
				}
			}
		}
	};
};

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _utils = require('../utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function maybeReplaceInlineArrowFunctionWithBlock(node) {
	var arrowFunctionArg = node.arguments[1];
	if (t.isArrowFunctionExpression(arrowFunctionArg) && t.isCallExpression(arrowFunctionArg.body)) {
		var inlineCall = arrowFunctionArg.body;
		if ((0, _utils.isRawFunctionCall)(inlineCall, 'it')) {
			arrowFunctionArg.body = t.blockStatement([t.expressionStatement(inlineCall)]);
		}
	}
}

function maybeReplaceFunctionWithArrowFunction(node) {
	var functionArg = node.arguments[1];
	if (t.isFunctionExpression(functionArg)) {
		node.arguments[1] = t.ArrowFunctionExpression(functionArg.params, functionArg.body);
	}
}

function findRootFluentFunctionCall(node, fnName) {
	if ((0, _utils.isRawFunctionCall)(node, fnName)) {
		return node;
	}

	if (t.isCallExpression(node)) {
		return findRootFluentFunctionCall(node.callee, fnName);
	}

	if (t.isMemberExpression(node)) {
		return findRootFluentFunctionCall(node.object, fnName);
	}

	return null;
}