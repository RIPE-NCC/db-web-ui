'use strict';

angular.module('textUpdates')
    .controller('TextUpdatesController', ['$scope', '$stateParams', '$state', '$resource', '$log', 'WhoisResources', 'MessageStore', 'RestService', 'AlertService', 'UserInfoService',
        function ($scope, $stateParams, $state, $resource, $log, WhoisResources, MessageStore, RestService, AlertService, UserInfoService) {

             _initialisePage();

            function _initialisePage() {

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.objectName = decodeURIComponent($stateParams.name);

                $log.debug('DisplayController: Url params: source:'+ $scope.objectSource + '. objectType:' + $scope.objectType +
                    ', objectName:' + $scope.objectName  );

             };

        }]);
