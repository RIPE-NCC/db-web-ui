'use strict';

angular.module('textUpdates')
    .controller('TextController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', 'WhoisResources', 'RestService', 'AlertService',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, WhoisResources, RestService, AlertService) {

            $scope.TOTAL_ATTR_LENGTH = 15;

            _initialisePage();

            function _initialisePage() {
                AlertService.clearErrors();

                $scope.restCalInProgress = false;

                $cookies.put('ui-mode','textupdates');


                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.objectName = decodeURIComponent($stateParams.name);

                $log.debug('TextUpdatesController: Url params:' +
                    ' source:'+ $scope.objectSource +
                    ', objectType:' + $scope.objectType +
                    ', objectName:' + $scope.objectName  );



            };


        }]);
