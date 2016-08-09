import './common/scopedIdentifiers';
import {isPrivate, paramsByName, modifyWithScope, isConstructor, deprivatifiedName} from '../utils';

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

			this.exposeAs(isPrivate(node.right) ? 'private' : 'public', constructorArgument);
			path.remove();
		}
	};

	return {
		visitor: {
			ClassMethod(path) {
				if (!isConstructor(path)) {
					return;
				}

				path.traverse(propertyAssignments, {
					paramsByName: paramsByName(path),
					exposeAs: (scope, paramPath) => {
						// if (isPrivate(paramPath.node)) {
						// 	path.scope.rename(paramPath.node.name, deprivatifiedName(paramPath.node));
						// }
						paramPath.replaceWith(modifyWithScope(scope, paramPath.node))
					}
				});
			}
		}
	}
}

