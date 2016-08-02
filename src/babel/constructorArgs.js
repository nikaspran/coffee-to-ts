import Parser from "babylon/lib/parser";
import {types} from 'babylon/lib/tokenizer/types';
import Printer from 'babel-generator/lib/printer';
import * as babelTypes from 'babel-types';
import _ from 'lodash';

stubClassMethodValidatorToAllowForScopeModifiedIdentifiers();
function stubClassMethodValidatorToAllowForScopeModifiedIdentifiers() {
	const originalValidator = babelTypes.NODE_FIELDS.ClassMethod.key.validate;

	babelTypes.NODE_FIELDS.ClassMethod.key.validate = function (node, key, val) {
		if (val.type === 'ScopeModifiedIdentifier') {
			return true;
		} else {
			return originalValidator(node, key, val);
		}
	}
}

Printer.prototype.ScopeModifiedIdentifier = function (node) {
	this.word(node.modifier);
	this.space();
	this.print(node.identifier, node);
};

function modifyWithScope(modifier, identifier) {
	return {
		type: 'ScopeModifiedIdentifier',
		modifier,
		identifier
	}
}

function isPrivate(node) {
	return node.name.startsWith('_');
}

function deprivatifiedName(node) {
	return node.name.replace('_', '');
}

export default function ({types: t}) {
	const propertyAssignments = {
		AssignmentExpression(path) {
			const {node} = path;
			const assigningToThis = t.isMemberExpression(node.left) && t.isThisExpression(node.left.object);
			if (!assigningToThis) {
				return;
			}

			const samePropertyAsParam = node.left.property.name === node.right.name;
			if (!samePropertyAsParam) {
				return;
			}

			const constructorArgument = this.paramsByName[node.right.name];
			if (!constructorArgument) {
				return;
			}

			this.exposedAs(isPrivate(node.right) ? 'private' : 'public', constructorArgument);
			path.remove();
		}
	};

	function visitConstructor(path) {
		const {node} = path;

		path.traverse(propertyAssignments, {
			paramsByName: _.keyBy(path.get('params'), 'node.name'),
			exposedAs: (scope, paramPath) => {
				if (isPrivate(paramPath.node)) {
					path.scope.rename(paramPath.node.name, deprivatifiedName(paramPath.node));
				}
				paramPath.replaceWith(modifyWithScope(scope, paramPath.node))
			}
		});
	}

	function visitMethod(path) {
		const keyPath = path.get('key');
		if (isPrivate(keyPath.node)) {
			keyPath.node.name = deprivatifiedName(keyPath.node);
			keyPath.replaceWith(modifyWithScope('private', keyPath.node));
		}
	}

	return {
		visitor: {
			ClassMethod(path) {
				const visitors = {
					constructor: visitConstructor,
					method: visitMethod
				};

				const visitor = visitors[path.node.kind];
				if (visitor) {
					visitor(path);
				}
			},
			MemberExpression(path) {
				const {node} = path;
				if (t.isThisExpression(node.object) && isPrivate(node.property)) {
					node.property.name = deprivatifiedName(node.property);
				}
			}
		}
	}
}

