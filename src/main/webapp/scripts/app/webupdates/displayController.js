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
    var whoisResources = MessageStore.get($scope.name);
    if (whoisResources) {
        // Use version that we was just before created or modified
        $scope.attributes = WhoisResourcesUtil.getAttributes(whoisResources);
        $scope.warnings = WhoisResourcesUtil.getGlobalWarnings(whoisResources);
    } else {
        // Fetch fresh value from rest
        //$resource('whois/:source/:objectType', {source: $scope.source, objectType: $scope.objectType})
        //    .get(
        //    function(resource){
        //        $scope.attributes = WhoisResourcesUtil.getAttributes(resource);
        //        $scope.errors = [];
        //        $scope.warnings = WhoisResourcesUtil.getGlobalWarnings(resource);
        //    },
        //    function(response){
        //        var resource = response.data;
        //        $scope.errors = WhoisResourcesUtil.getGlobalErrors(resource);
        //        $scope.warnings = WhoisResourcesUtil.getGlobalWarnings(resource);
        //    });
    }

    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };

}]);
