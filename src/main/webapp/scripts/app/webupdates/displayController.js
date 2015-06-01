'use strict';

angular.module('webUpdates')
.controller('DisplayController', ['$scope', '$stateParams', '$state', 'MessageStore',
function ($scope, $stateParams, $state, MessageStore) {

    // extract parameters from the url
    $scope.objectType = $stateParams.objectType;
    $scope.name = $stateParams.name;

    var getAttributeValues = function (type, name) {
        var object = MessageStore.get(name);
        if (object === null) {
            return undefined;
        }

        return object.attributes.attribute;
    };

    // fetch just created object from temporary store
    $scope.attributes = getAttributeValues($scope.objectType, $scope.name);

    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };

}]);
