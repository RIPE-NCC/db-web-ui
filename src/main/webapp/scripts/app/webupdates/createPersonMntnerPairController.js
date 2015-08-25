
'use strict';

angular.module('webUpdates')
    .controller('CreatePersonMntnerPairController', [
        '$scope', '$state', '$log', '$stateParams', 'WhoisResources', 'AlertService', 'UserInfoService', 'RestService', 'MessageStore',
        function ($scope, $state, $log, $stateParams, WhoisResources, AlertService, UserInfoService, RestService, MessageStore) {



            $scope.name = 'Placeholder';
            $scope.address = '';
            $scope.phone = '';
            $scope.mntner = '';

            $scope.source = $stateParams.source;



}]);
