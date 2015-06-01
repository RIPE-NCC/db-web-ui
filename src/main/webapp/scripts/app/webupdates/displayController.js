'use strict';

angular.module('webUpdates')
.controller('DisplayController', ['$scope', '$stateParams', '$state', 'MessageStore',
function ($scope, $stateParams, $state, MessageStore) {

    // extract parameters from the url
    $scope.objectType = $stateParams.objectType;
    $scope.name = $stateParams.name;

    console.log("display: type:" + $scope.objectType + " name:" + $scope.name );

    // fetch just created object from temporary store
    $scope.attributes = getAttributeValues($scope.objectType, $scope.name);

    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };

    var getAttributeValues = function (type, name) {
        var object = MessageStore.get(name);
        if (object == null) {
            console.log("No object found for key:" + name);
            return undefined;
        }

        console.log("object:" + JSON.stringify(object));
        return object.attributes.attribute;
    };

    }]);
