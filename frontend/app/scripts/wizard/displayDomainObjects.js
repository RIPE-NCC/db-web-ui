(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DisplayDomainObjectsController', ['$state', '$stateParams', 'MessageStore', 'WhoisResources', 'AlertService',
        function ($state, $stateParams, MessageStore, WhoisResources, AlertService) {

            var vm = this;

            vm.source = $stateParams.source;

            var result = MessageStore.get('result');
            vm.prefix = result.prefix;

            var whoisResources = WhoisResources.wrapWhoisResources(result.whoisResources);
            vm.objects = whoisResources.objects.object;

            AlertService.clearErrors();
            AlertService.addErrors(whoisResources);

            vm.navigateToSelect = function () {
                $state.transitionTo('webupdates.select');
            };

        }]);
})();
