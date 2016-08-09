import {isPrivate, addToClass, isMethodCallee, getClassBody} from '../utils';

export default function ({types: t}) {
	return {
		visitor: {
			MemberExpression(path) {
				const {node} = path;
				if (!t.isThisExpression(node.object) || isPrivate(node.property)) {
					return;
				}

				if (isMethodCallee(path)) {
					return;
				}

				const classBody = getClassBody(path);
				if (!classBody) {
					return;
				}

				addToClass(classBody, t.identifier(node.property.name));
			}
		}
	}
}

