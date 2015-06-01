'use strict';

angular.module('webUpdates')
.controller('DisplayController', ['$scope', '$stateParams', '$state', 'MessageStore',
function ($scope, $stateParams, $state, MessageStore) {

    // extract parameters from the url
    $scope.objectType = $stateParams.objectType;
    $scope.name = $stateParams.name;

    // fetch just created object from temporary store
    var whoisResources = MessageStore.get($scope.name);
    if (whoisResources) {
        $scope.attributes = whoisResources.objects.object[0].attributes.attribute;
    } else {
        // TODO fetch from rest
    }

    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };

}]);
