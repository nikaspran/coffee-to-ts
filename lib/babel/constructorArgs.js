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

			this.exposeAs((0, _utils.isPrivate)(node.right) ? 'private' : 'public', constructorArgument);
			path.remove();
		}
	};

	return {
		visitor: {
			ClassMethod: function ClassMethod(path) {
				if (!(0, _utils.isConstructor)(path)) {
					return;
				}

				path.traverse(propertyAssignments, {
					paramsByName: (0, _utils.paramsByName)(path),
					exposeAs: function exposeAs(scope, paramPath) {
						// if (isPrivate(paramPath.node)) {
						// 	path.scope.rename(paramPath.node.name, deprivatifiedName(paramPath.node));
						// }
						paramPath.replaceWith((0, _utils.modifyWithScope)(scope, paramPath.node));
					}
				});
			}
		}
	};
};

require('./common/scopedIdentifiers');

var _utils = require('../utils');