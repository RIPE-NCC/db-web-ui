
/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('CreateSelfMaintainedMaintainerController', ['$scope', '$state', '$stateParams', 'WhoisResources', 'AlertService', 'UserInfoService', 'RestService', 'MessageStore',
        function ($scope, $state, $stateParams, WhoisResources, AlertService, UserInfoService, RestService, MessageStore) {

            var MNT_TYPE = 'mntner';
            $scope.source = $stateParams.source;
            $scope.maintainerAttributes = _wrapAndEnrichAttributes(WhoisResources.getMandatoryAttributesOnObjectType(MNT_TYPE));

            $scope.submit = function () {
                $scope.maintainerAttributes.setSingleAttributeOnName('upd-to', UserInfoService.getUserInfo().username);
                $scope.maintainerAttributes.setSingleAttributeOnName('auth', 'SSO ' + UserInfoService.getUserInfo().username);
                $scope.maintainerAttributes.setSingleAttributeOnName('source', $scope.source);

                var mntner = $scope.maintainerAttributes.getSingleAttributeOnName('mntner');
                $scope.maintainerAttributes.setSingleAttributeOnName('mnt-by', mntner.value);

                $scope.maintainerAttributes.clearErrors();
                if($scope.maintainerAttributes.validate()) {
                   createObject();
                }

            };

            function createObject() {
                var embedAttributes = WhoisResources.turnAttrsIntoWhoisObject($scope.maintainerAttributes);

                RestService.createObject($scope.source, MNT_TYPE, embedAttributes)
                    .then(function (resp) {
                        var whoisResources = WhoisResources.wrapWhoisResources(resp);

                        var primaryKey = whoisResources.getPrimaryKey();
                        MessageStore.add(primaryKey, whoisResources);

                        $state.transitionTo('display', {source: $scope.source, objectType: 'mntner', name: primaryKey});
                    }, function(error) {
                        AlertService.populateFieldSpecificErrors('mntner', $scope.maintainerAttributes, error.data);
                        AlertService.showWhoisResourceErrors('mntner', error.data);
                    }
                );
            }

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

