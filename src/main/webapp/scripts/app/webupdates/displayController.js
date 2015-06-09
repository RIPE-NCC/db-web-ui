'use strict';

angular.module('webUpdates')
.controller('DisplayController', ['$scope', '$stateParams', '$state', '$resource', 'WhoisResources','MessageStore',
function ($scope, $stateParams, $state, $resource, WhoisResources, MessageStore) {

    // extract parameters from the url
    $scope.objectSource = $stateParams.source;
    $scope.objectType = $stateParams.objectType;
    $scope.objectName = $stateParams.name;

    // Initalize the UI
    $scope.errors = [];
    $scope.warnings = [];

    var fetchObject = function() {
        $resource('api/whois/:source/:objectType/:objectName', {source: $scope.objectSource, objectType: $scope.objectType, objectName:$scope.objectName})
            .get(function (resp) {
                //console.log("web ok resp:" + JSON.stringify(resp));

                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
            }, function(resp) {
                //console.log("web error resp:" + JSON.stringify(resp));
                var whoisResources = WhoisResources.wrapWhoisResources(resp.data);
                if( ! _.isUndefined(whoisResources)) {
                    $scope.errors = whoisResources.getGlobalErrors();
                    $scope.warnings = whoisResources.getGlobalWarnings();
                }
            });
    };

    // fetch just created object from temporary store
    var cashed = MessageStore.get($scope.objectName);
    if( cashed) {
        var whoisResources = WhoisResources.wrapWhoisResources(cashed);
        //console.log("Using the store:" + JSON.stringify(whoisResources));
        // Use version that we was just before created or modified
        $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
        $scope.warnings = whoisResources.getGlobalWarnings();
    } else {
        //console.log("Fetch from web");
        fetchObject();
    }

    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };


}]);
