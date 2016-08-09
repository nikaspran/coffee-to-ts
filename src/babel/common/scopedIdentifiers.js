import Printer from 'babel-generator/lib/printer';
import * as babelTypes from 'babel-types';

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
