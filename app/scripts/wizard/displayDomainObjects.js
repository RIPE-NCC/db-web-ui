/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DisplayDomainObjectsController', ['$scope', '$state', '$stateParams', 'MessageStore', 'WhoisResources', 'AlertService',
        function ($scope, $state, $stateParams, MessageStore, WhoisResources, AlertService) {

            $scope.source = $stateParams.source;

            var result = MessageStore.get('result');
            $scope.prefix = result.prefix;

            var whoisResources = WhoisResources.wrapWhoisResources(result.whoisResources);
            $scope.objects = whoisResources.objects.object;

            AlertService.addErrors(whoisResources);

            $scope.navigateToSelect = function () {
                $state.transitionTo('webupdates.select');
            };

        }])
})();
