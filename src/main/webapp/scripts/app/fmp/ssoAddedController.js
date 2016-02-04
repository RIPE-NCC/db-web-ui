'use strict';

angular.module('fmp')
    .controller('SsoAddedCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
        $scope.user = $stateParams.user;
    }]);
