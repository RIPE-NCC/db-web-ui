'use strict';

angular.module('fmp')
    .controller('SsoAddedCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
        $scope.mntnerKey = $stateParams.mntnerKey;
        $scope.user = $stateParams.user;
    }]);
