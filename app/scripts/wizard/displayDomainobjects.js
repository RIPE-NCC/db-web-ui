/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DisplayDomainObjectsController', ['$scope', '$state', 'MessageStore', 'WhoisResources', 'AlertService',
        function ($scope, $state, MessageStore, WhoisResources, AlertService) {

            var whoisResources = WhoisResources.wrapWhoisResources(MessageStore.get('domains'));
            $scope.objects = whoisResources.objects.object;

            AlertService.addErrors(whoisResources);

            $scope.navigateToSelect = function () {
                $state.transitionTo('webupdates.select');
            };

        }])
})();
