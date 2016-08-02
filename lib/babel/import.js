'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.parser = parser;

exports.default = function (_ref) {
	var t = _ref.types;

	return {
		visitor: {
			ImportDeclaration: function ImportDeclaration(path) {
				var source = path.node.source.value;
				var local = path.node.local.name;

				if (local === 'templateUrl') {
					var requireSource = t.callExpression(t.identifier('require'), [t.stringLiteral(source)]);
					var requireSourceAsString = buildTypeAssertedExpression('string', requireSource);

					return path.replaceWith( // const ${local} = require('${source}');
					t.variableDeclaration('const', [t.variableDeclarator(t.identifier(local), requireSourceAsString)]));
				} else {
					return path.replaceWith({ // import ${local} = require('${source}');
						type: 'ImportRequire',
						local: { type: 'Identifier', name: local },
						source: { type: 'StringLiteral', value: source }
					});
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

babelTypes.TYPES.push('ImportRequire');
babelTypes.FLIPPED_ALIAS_KEYS.Expression.push('TypeAssertedExpression');

_printer2.default.prototype.ImportRequire = function (node) {
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

_printer2.default.prototype.TypeAssertedExpression = function (node) {
	this.print(node.assertion, node);
	this.space();
	this.print(node.expression, node);
};

_printer2.default.prototype.TypeAssertion = function (node) {
	this.token('<');
	this.word(node.value);
	this.token('>');
};

_parser2.default.prototype.tsParseImportRequire = function (node) {
	this.next();
	node.local = this.parseIdentifier();

	if (!this.eat(_types.types.eq) || !this.eatContextual('require') || !this.eat(_types.types.parenL)) {
		return false;
	}

	node.source = this.match(_types.types.string) ? this.parseExprAtom() : this.unexpected();

	this.eat(_types.types.parenR);
	this.semicolon();
	return this.finishNode(node, 'ImportRequire');
};

function parser(instance) {
	instance.extend('parseImport', function (inner) {
		return function (node) {
			var oldState = this.state.clone(true);

			var parsedImportRequire = this.tsParseImportRequire(node);

			if (parsedImportRequire) {
				return parsedImportRequire;
			}

			this.state = oldState;
			return inner.call(this, node);
		};
	});
}

function buildTypeAssertedExpression(type, expression) {
	return {
		type: 'TypeAssertedExpression',
		assertion: { type: 'TypeAssertion', value: type },
		expression: expression
	};
}