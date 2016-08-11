import * as t from 'babel-types';
import {isMethodCallee, nameOf, isRawFunctionCall} from '../utils';

function maybeReplaceInlineArrowFunctionWithBlock(node) {
	const arrowFunctionArg = node.arguments[1];
	if (t.isArrowFunctionExpression(arrowFunctionArg) && t.isCallExpression(arrowFunctionArg.body)) {
		const inlineCall = arrowFunctionArg.body;
		if (isRawFunctionCall(inlineCall, 'it')) {
			arrowFunctionArg.body = t.blockStatement([
				t.expressionStatement(inlineCall)
			]);
		}
	}
}

function maybeReplaceFunctionWithArrowFunction(node) {
	const functionArg = node.arguments[1];
	if (t.isFunctionExpression(functionArg)) {
		node.arguments[1] = t.ArrowFunctionExpression(functionArg.params, functionArg.body);
	}
}

function findRootFluentFunctionCall(node, fnName) {
	if (isRawFunctionCall(node, fnName)) {
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

export default function ({types: t}) {
	return {
		visitor: {
			CallExpression(path) {
				const {node} = path;

				if (isRawFunctionCall(node, 'describe')) {
					maybeReplaceInlineArrowFunctionWithBlock(node);
					maybeReplaceFunctionWithArrowFunction(node);
				}

				if (isRawFunctionCall(node, 'it')) {
					maybeReplaceFunctionWithArrowFunction(node);
				}
			},
			ReturnStatement(path) {
				const {node} = path;

				if (!t.isCallExpression(node.argument)) {
					return;
				}

				if (isRawFunctionCall(node.argument, 'describe') || isRawFunctionCall(node.argument, 'it')) {
					return path.replaceWith(node.argument);
				}

				const isExpectChain = findRootFluentFunctionCall(node.argument, 'expect');
				if (isExpectChain) {
					return path.replaceWith(node.argument);
				}
			}
		}
	}
}

