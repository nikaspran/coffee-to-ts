import module = require('refactor/module');
const templateUrl = <string> require('./templateSubcategoryTemplate.html');


let TEMPLATES_PER_PAGE = 10;

class TemplateSubcategoryController {
	/* @ngInject */
	constructor($scope, private $state, private $window, private WrapResource, private permissionsService, private eventBus, private templateCategories, Pager, private confirmationService, private fullScreenLoading, private loadingMessages, private notificationUtils) {
		let TEAM_ID = this.permissionsService.getCurrentTeamId();

		$scope.$watchGroup(['$ctrl.category', '$ctrl.searchQuery'], () => {
			if (!this.category) {
				return;
			}

			this.onlyShowInitialTemplates();

			if (this.category.myTemplates) {
				var queryFn = this.WrapResource.getTeamTemplates;
				var params = {
					teamId: TEAM_ID
				};
			} else {
				var queryFn = this.WrapResource.getTemplates;
				var params = this.paramsFor(this.category);
			}

			this.pager = new Pager(queryFn, params, TEMPLATES_PER_PAGE);
			return this.pager.query({ search: this.searchQuery }, true);
		});
	}

	private paramsFor(category) {
		let params = {
			teamId: this.permissionsService.getCurrentTeamId(),
			templateLocation: this.location,
			deviceType: 'desktop'
		};

		if (!this.templateCategories.isAllTemplates(category)) {
			params.categoryId = category.id;
		}

		return params;
	}

	previewTemplate(template) {
		return this.WrapResource.getWrap({ id: template.id }).$promise.then(wrap => PreviewUnpublishedWrapMediaEmbed.show(wrap));
	}

	editTemplate(template) {
		this.eventBus.editWrapFromWrapListStart();
		return this.$state.go('wraps.show.cards.show', {
			wrap_id: template.id,
			card_id: template.cards[0].id,
			teamId: this.$state.params.teamId
		});
	}

	copyTemplate(template) {
		this.eventBus.copyTemplateFromTemplatesListStart();
		this.fullScreenLoading.show(this.loadingMessages.WRAP_CREATING_MESSAGE);
		return template.clone(null, this.$state.params.teamId, true).then(response => {
			this.pager.items.unshift(response);
			return this.$window.scrollTo(0, 0);
		}).catch(response => {
			let hasReachedWrapsLimit = __guard__(__guard__(response.data.errors, x1 => x1.base), x => x[0]) === 'wrap quota exceeded';
			if (hasReachedWrapsLimit) {
				return this.notificationUtils.wrapCountExceededNotification();
			}
		}).finally(() => {
			this.fullScreenLoading.hide();
			return this.eventBus.copyTemplateFromTemplatesListFinish();
		});
	}

	removeTemplate(template) {
		return this.confirmationService.show({
			title: `Delete \"${ template.name }\"`,
			buttons: {
				cancel: 'Go back',
				ok: 'Yes, delete template'
			},
			isDestructive: true,
			content: '<p class="primary-text">Are you sure you want to delete this Template?</p><p class="secondary-text"><b>CAUTION:</b> This cannot be undone.</p>'
		}).then(() => {
			this.eventBus.deleteTemplateFromTemplateListStart();
			return this.WrapResource.delete({ id: template.id }).$promise.then(() => {
				this.eventBus.deleteTemplateFromTemplateListFinish({ templateId: template.id });
				return _.remove(this.pager.items, template);
			});
		});
	}

	createFromTemplate(template) {
		this.eventBus.createWrapFromTemplateStart();
		template.isCreating = true;
		this.isCreatingFromTemplate = true;

		return this.WrapResource.createFromTemplate({
			templateId: template.id,
			teamId: this.permissionsService.getCurrentTeamId()
		}).then(wrap => {
			__guardFunc__(this.onCreateWrap, f => f({ wrap }));
			return this.eventBus.createWrapFromTemplateFinish({ wrapId: wrap.id, templateId: template.id });
		}).finally(() => {
			template.isCreating = false;
			return this.isCreatingFromTemplate = false;
		});
	}

	loadMore() {
		if (!this.hasMoreCachedTemplates()) {
			this.pager.query();
		}
		return this.showAllLoadedTemplates();
	}

	hasMore() {
		return __guard__(this.pager, x => x.hasMore()) || this.hasMoreCachedTemplates();
	}

	private hasMoreCachedTemplates() {
		return this.templateLimit < __guard__(this.pager, x => x.items.length);
	}

	onlyShowInitialTemplates() {
		return this.templateLimit = this.initialTemplateCount || 1;
	}

	private showAllLoadedTemplates() {
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
	return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
}
function __guardFunc__(func, transform) {
	return typeof func === 'function' ? transform(func) : undefined;
}
