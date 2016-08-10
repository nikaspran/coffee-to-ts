'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (_ref) {
	var t = _ref.types;

	return {
		visitor: {
			ClassMethod: function ClassMethod(path) {
				var keyPath = path.get('key');
				if ((0, _utils.isPrivate)(keyPath.node)) {
					keyPath.replaceWith((0, _utils.modifyWithScope)('private', keyPath.node));
				}
			},
			MemberExpression: function MemberExpression(path) {
				var node = path.node;

				if (!t.isThisExpression(node.object) || !(0, _utils.isPrivate)(node.property)) {
					return;
				}

				var classBody = (0, _utils.getClassBody)(path);
				if (classBody) {
					(0, _utils.addToClass)(classBody, (0, _utils.modifyWithScope)('private', t.identifier(node.property.name)));
				}
			}
		}
	};
};

require('./common/scopedIdentifiers');

var _utils = require('../utils');