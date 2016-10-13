/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DisplayDomainObjectsController', ['$scope', '$state', 'MessageStore', 'WhoisResources',
        function ($scope, $state, MessageStore, WhoisResources) {

            $scope.objects = WhoisResources.wrapWhoisResources(MessageStore.get('domains')).objects.whoisObjects;


            $scope.navigateToSelect = function () {
                $state.transitionTo('webupdates.select');
            };

        }])
})();
