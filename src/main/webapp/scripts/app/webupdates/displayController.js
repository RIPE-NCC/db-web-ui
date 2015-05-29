'use strict';


angular.module('webUpdates')
.controller('DisplayController', ['$scope', '$stateParams', '$state', 'MessageBus',
function ($scope, $stateParams, $state, MessageBus) {

    // TODO - handle object not found
    var object = MessageBus.get('objectCreated');
    $scope.attributes = object.attributes.attribute;

    // extract parameters from the url
    $scope.objectType = $stateParams.objectType;
    $scope.name = $stateParams.name;


    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };

}]);
