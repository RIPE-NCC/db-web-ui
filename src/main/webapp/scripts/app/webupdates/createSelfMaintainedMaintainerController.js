
/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('CreateSelfMaintainedMaintainerController', ['$scope', '$stateParams', 'WhoisResources', 'AlertService', 'UserInfoService',
        function ($scope, $stateParams, WhoisResources, AlertService, UserInfoService) {

            $scope.source = $stateParams.source;
            $scope.maintainerAttributes = _wrapAndEnrichAttributes(WhoisResources.getMandatoryAttributesOnObjectType('mntner'));

            $scope.submit = function () {
                $scope.maintainerAttributes.setSingleAttributeOnName('upd-to', UserInfoService.getUserInfo().username);
                $scope.maintainerAttributes.setSingleAttributeOnName('auth', 'SSO ' + UserInfoService.getUserInfo().username);
                $scope.maintainerAttributes.setSingleAttributeOnName('source', $scope.source);
            };


            //TODO (TCP) - this is the same code found on createController. Think in a way to remove it from here.
            /*
             * Methods used to make sure that attributes have meta information and have utility functions
             */
            function _wrapAndEnrichAttributes(attrs) {
                return WhoisResources.wrapAttributes(
                    WhoisResources.enrichAttributesWithMetaInfo('mntner', attrs)
                );
            }


        }]);

