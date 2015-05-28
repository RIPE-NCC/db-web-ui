'use strict';


angular.module('webUpdates')
.controller('DisplayController', ['$scope', '$stateParams',
function ($scope, $stateParams) {

    // extract parameters from the url
    $scope.objectType = $stateParams.objectType;
    $scope.name = $stateParams.name;

    $scope.attributes = [];


    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };

}]);
