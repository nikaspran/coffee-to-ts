import './common/scopedIdentifiers';
import {isPrivate, modifyWithScope, getClassBody, addToClass} from '../utils';

export default function ({types: t}) {
	return {
		visitor: {
			ClassMethod(path) {
				const keyPath = path.get('key');
				if (isPrivate(keyPath.node)) {
					keyPath.replaceWith(modifyWithScope('private', keyPath.node));
				}
			},
			MemberExpression(path) {
				const {node} = path;
				if (!t.isThisExpression(node.object) || !t.isIdentifier(node.property) || !isPrivate(node.property)) {
					return;
				}

				const classBody = getClassBody(path);
				if (classBody) {
					addToClass(classBody, modifyWithScope('private', t.identifier(node.property.name)))
				}
			}
		}
	}
}

