'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (_ref) {
	var t = _ref.types;

	return {
		visitor: {
			MemberExpression: function MemberExpression(path) {
				var node = path.node;

				if (!t.isThisExpression(node.object) || !t.isIdentifier(node.property) || (0, _utils.isPrivate)(node.property)) {
					return;
				}

				if ((0, _utils.isMethodCallee)(path)) {
					return;
				}

				var classBody = (0, _utils.getClassBody)(path);
				if (!classBody) {
					return;
				}

				(0, _utils.addToClass)(classBody, t.identifier(node.property.name));
			}
		}
	};
};

var _utils = require('../utils');