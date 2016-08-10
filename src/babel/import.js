import Parser from "babylon/lib/parser";
import {types} from 'babylon/lib/tokenizer/types';
import Printer from 'babel-generator/lib/printer';
import * as babelTypes from 'babel-types';

babelTypes.TYPES.push('ImportRequire');
babelTypes.FLIPPED_ALIAS_KEYS.Expression.push('TypeAssertedExpression');

Printer.prototype.ImportRequire = function (node) {
	this.word('import');
	this.print(node.local, node);
	this.space();
	this.token('=');
	this.space();
	this.word('require');
	this.token('(');
	this.print(node.source, node);
	this.token(')');
	this.semicolon();
};

Printer.prototype.TypeAssertedExpression = function (node) {
	this.print(node.assertion, node);
	this.space();
	this.print(node.expression, node);
};

Printer.prototype.TypeAssertion = function (node) {
	this.token('<');
	this.word(node.value);
	this.token('>');
};

Parser.prototype.tsParseImportRequire = function (node) {
	this.next();
	node.local = this.parseIdentifier();

	this.eat(types.eq);
	this.eatContextual('require');
	this.eat(types.parenL);

	node.source = this.match(types.string) ? this.parseExprAtom() : this.unexpected();
	this.eat(types.parenR);
	this.semicolon();
	return this.finishNode(node, 'ImportRequire');
};

export function parser(instance) {
	instance.extend('parseImport', function (inner) {
		return function (node) {
			const oldState = this.state.clone(true);

			try {
				return this.tsParseImportRequire(node);
			} catch (e) {
				this.state = oldState;
				return inner.call(this, node);
			}
		};
	});
}

function buildTypeAssertedExpression(type, expression) {
	return {
		type: 'TypeAssertedExpression',
		assertion: {type: 'TypeAssertion', value: type},
		expression
	}
}

export default function ({types: t}) {
	return {
		visitor: {
			ImportDeclaration(path){
				if (!path.node.local) {
					return;
				}

				const local = path.node.local.name;
				const source = path.node.source.value;

				if (local === 'templateUrl') {
					const requireSource = t.callExpression(t.identifier('require'), [t.stringLiteral(source)]);
					const requireSourceAsString = buildTypeAssertedExpression('string', requireSource);

					return path.replaceWith(// const ${local} = require('${source}');
						t.variableDeclaration('const', [t.variableDeclarator(t.identifier(local), requireSourceAsString)])
					);
				} else {
					return path.replaceWith({ // import ${local} = require('${source}');
						type: 'ImportRequire',
						local: {type: 'Identifier', name: local},
						source: {type: 'StringLiteral', value: source}
					});
				}
			}
		}
	}
}

