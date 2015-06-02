'use strict';

angular.module('webUpdates')
.controller('DisplayController', ['$scope', '$stateParams', '$state', '$resource', 'WhoisResourcesUtil','MessageStore',
function ($scope, $stateParams, $state, $resource, WhoisResourcesUtil, MessageStore) {

    // extract parameters from the url
    $scope.objectType = $stateParams.objectType;
    $scope.name = $stateParams.name;

    // Initalize the UI
    $scope.errors = [];
    $scope.warnings = [];

    // fetch just created object from temporary store
    var whoisResources = WhoisResourcesUtil.wrapWhoisResources(MessageStore.get($scope.name));
    if (whoisResources) {
        // Use version that we was just before created or modified
        $scope.attributes = whoisResources.getAttributes();
        $scope.warnings = whoisResources.getGlobalWarnings();
    } else {
        // TODO Fetch fresh value via HTTP-GET
    }

    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };

}]);
