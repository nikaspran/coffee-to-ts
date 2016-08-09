import _ from 'lodash';
import * as t from 'babel-types';

export function isPrivate(node) {
	return node.name.startsWith('_');
}

export function paramsByName(methodPath) {
	return _.keyBy(methodPath.get('params'), ({node}) => nameOf(node));
}

export function modifyWithScope(modifier, identifier) {
	return {
		type: 'ScopeModifiedIdentifier',
		modifier,
		identifier
	}
}

export function nameOf(maybeScopedIdentifier) {
	return maybeScopedIdentifier.name || maybeScopedIdentifier.identifier.name
}

export function deprivatifiedName(node) {
	return nameOf(node).replace('_', '');
}

export function isConstructor(path) {
	return path.node.kind === 'constructor';
}

export function addToClass(classBody, property) {
	const members = classBody.get('body');

	const alreadyContainsMember = _.some(members, (member) => {
		return nameOf(member.node.key) === nameOf(property);
	});

	if (alreadyContainsMember) {
		return;
	}

	const constructor = _.find(members, isConstructor);
	if (constructor && _(paramsByName(constructor)).keys().includes(nameOf(property))) {
		return;
	}

	const newProperty = {
		type: 'ClassProperty',
		key: property
	};

	const firstProperty = _.find(members, (member) => t.isClassProperty(member.node));
	if (firstProperty) {
		firstProperty.insertAfter(newProperty);
	} else {
		members[0].insertBefore(newProperty);
	}
}

export function isMethodCallee(path) {
	return t.isCallExpression(path.parent) && path.parent.callee === path.node
}

export function getClassBody(path) {
	return path.findParent((path) => t.isClassBody(path.node))
}
