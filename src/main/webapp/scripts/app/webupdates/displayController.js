'use strict';

angular.module('webUpdates')
.controller('DisplayController', ['$scope', '$stateParams', '$state', 'MessageStore',
function ($scope, $stateParams, $state, MessageStore) {

    // extract parameters from the url
    $scope.objectType = $stateParams.objectType;
    $scope.name = $stateParams.name;

    console.log("display: type:" + $scope.objectType + " name:" + $scope.name );

    // fetch just created object from temporary store
    var object = MessageStore.get($scope.name);
    if (object == null) {
        console.log("No object found for key:" + $scope.name);
        // TODO fetch from rest
    } else {
        console.log("object:" + JSON.stringify(object));
        $scope.attributes = object.attributes.attribute;
    }

    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };

}]);
