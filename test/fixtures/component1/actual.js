import module from 'refactor/module';
import templateUrl from './templateSubcategoryTemplate.html';

let TEMPLATES_PER_PAGE = 10;

class TemplateSubcategoryController {
	/* @ngInject */
	constructor($scope, _$state, _$window, _WrapResource, _permissionsService, _eventBus, _templateCategories, Pager, _confirmationService, _fullScreenLoading, _loadingMessages, _notificationUtils) {

		this._$state = _$state;
		this._$window = _$window;
		this._WrapResource = _WrapResource;
		this._permissionsService = _permissionsService;
		this._eventBus = _eventBus;
		this._templateCategories = _templateCategories;
		this._confirmationService = _confirmationService;
		this._fullScreenLoading = _fullScreenLoading;
		this._loadingMessages = _loadingMessages;
		this._notificationUtils = _notificationUtils;
		let TEAM_ID = this._permissionsService.getCurrentTeamId();

		$scope.$watchGroup(['$ctrl.category', '$ctrl.searchQuery'], () => {
			if (!this.category) {
				return;
			}

			this.onlyShowInitialTemplates();

			if (this.category.myTemplates) {
				var queryFn = this._WrapResource.getTeamTemplates;
				var params = {
					teamId: TEAM_ID
				};
			} else {
				var queryFn = this._WrapResource.getTemplates;
				var params = this._paramsFor(this.category);
			}

			this.pager = new Pager(queryFn, params, TEMPLATES_PER_PAGE);
			return this.pager.query({ search: this.searchQuery }, true);
		}
		);
	}

	_paramsFor(category) {
		let params = {
			teamId: this._permissionsService.getCurrentTeamId(),
			templateLocation: this.location,
			deviceType: 'desktop'
		};

		if (!this._templateCategories.isAllTemplates(category)) {
			params.categoryId = category.id;
		}

		return params;
	}

	previewTemplate(template) {
		return this._WrapResource.getWrap({ id: template.id }).$promise.then(wrap => PreviewUnpublishedWrapMediaEmbed.show(wrap));
	}

	editTemplate(template) {
		this._eventBus.editWrapFromWrapListStart();
		return this._$state.go('wraps.show.cards.show', {
			wrap_id: template.id,
			card_id: template.cards[0].id,
			teamId: this._$state.params.teamId
		});
	}

	copyTemplate(template) {
		this._eventBus.copyTemplateFromTemplatesListStart();
		this._fullScreenLoading.show(this._loadingMessages.WRAP_CREATING_MESSAGE);
		return template.clone(null, this._$state.params.teamId, true)
			.then(response => {
				this.pager.items.unshift(response);
				return this._$window.scrollTo(0, 0);
			}
			).catch(response => {
				let hasReachedWrapsLimit = (__guard__(__guard__(response.data.errors, x1 => x1.base), x => x[0]) === 'wrap quota exceeded');
				if (hasReachedWrapsLimit) {
					return this._notificationUtils.wrapCountExceededNotification();
				}
			}
			).finally(() => {
				this._fullScreenLoading.hide();
				return this._eventBus.copyTemplateFromTemplatesListFinish();
			}
			);
	}

	removeTemplate(template) {
		return this._confirmationService.show({
			title: `Delete \"${template.name}\"`,
			buttons: {
				cancel: 'Go back',
				ok: 'Yes, delete template'
			},
			isDestructive: true,
			content: '<p class="primary-text">Are you sure you want to delete this Template?</p><p class="secondary-text"><b>CAUTION:</b> This cannot be undone.</p>'
		}).then(() => {
			this._eventBus.deleteTemplateFromTemplateListStart();
			return this._WrapResource.delete({ id: template.id }).$promise.then(() => {
				this._eventBus.deleteTemplateFromTemplateListFinish({ templateId: template.id });
				return _.remove(this.pager.items, template);
			}
			);
		}
		);
	}

	createFromTemplate(template) {
		this._eventBus.createWrapFromTemplateStart();
		template.isCreating = true;
		this.isCreatingFromTemplate = true;

		return this._WrapResource.createFromTemplate({
			templateId: template.id,
			teamId: this._permissionsService.getCurrentTeamId()
		})
			.then(wrap => {
				__guardFunc__(this.onCreateWrap, f => f({ wrap }));
				return this._eventBus.createWrapFromTemplateFinish({ wrapId: wrap.id, templateId: template.id });
			}
			)
			.finally(() => {
				template.isCreating = false;
				return this.isCreatingFromTemplate = false;
			}
			);
	}

	loadMore() {
		if (!this._hasMoreCachedTemplates()) {
			this.pager.query();
		}
		return this._showAllLoadedTemplates();
	}

	hasMore() { return __guard__(this.pager, x => x.hasMore()) || this._hasMoreCachedTemplates(); }

	_hasMoreCachedTemplates() { return this.templateLimit < __guard__(this.pager, x => x.items.length); }

	onlyShowInitialTemplates() {
		return this.templateLimit = this.initialTemplateCount || 1;
	}

	_showAllLoadedTemplates() {
		return this.templateLimit = undefined;
	}
}

module.component('wmTemplateSubcategory', {
	bindings: {
		category: '<',
		searchQuery: '@?',
		onCreateWrap: '&?',
		hideName: '<?',
		initialTemplateCount: '<?',
		selectedCard: '=?',
		onSelectCard: '&?',
		hideActions: '<?',
		location: '@'
	},
	controller: TemplateSubcategoryController,
	templateUrl
});

function __guard__(value, transform) {
	return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __guardFunc__(func, transform) {
	return typeof func === 'function' ? transform(func) : undefined;
}
