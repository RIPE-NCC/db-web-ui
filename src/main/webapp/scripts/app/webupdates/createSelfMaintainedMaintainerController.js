
/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('CreateSelfMaintainedMaintainerController', ['$scope', '$state', '$stateParams', 'WhoisResources', 'AlertService', 'UserInfoService', 'RestService', 'MessageStore',
        function ($scope, $state, $stateParams, WhoisResources, AlertService, UserInfoService, RestService, MessageStore) {

            // workaround for problem with order of loading ui-select fragments
            $scope.uiSelectTemplateReady = false;
            RestService.fetchUiSelectResources().then(function () {
                $scope.uiSelectTemplateReady = true;
            });

            var MNT_TYPE = 'mntner';
            $scope.source = $stateParams.source;
            $scope.maintainerAttributes = _wrapAndEnrichAttributes(WhoisResources.getMandatoryAttributesOnObjectType(MNT_TYPE));

            $scope.submit = function () {
                $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);

                $scope.maintainerAttributes.setSingleAttributeOnName('upd-to', UserInfoService.getUserInfo().username);
                $scope.maintainerAttributes.setSingleAttributeOnName('auth', 'SSO ' + UserInfoService.getUserInfo().username);
                $scope.maintainerAttributes.setSingleAttributeOnName('source', $scope.source);

                var mntner = $scope.maintainerAttributes.getSingleAttributeOnName(MNT_TYPE);
                $scope.maintainerAttributes.setSingleAttributeOnName('mnt-by', mntner.value);

                $scope.maintainerAttributes.clearErrors();
                if($scope.maintainerAttributes.validate()) {
                   createObject();
                }

            };

            function createObject() {
                $scope.maintainerAttributes = $scope.maintainerAttributes.removeNullAttributes();

                var embedAttributes = WhoisResources.turnAttrsIntoWhoisObject($scope.maintainerAttributes);

                RestService.createObject($scope.source, MNT_TYPE, embedAttributes)
                    .then(function (resp) {
                        var whoisResources = WhoisResources.wrapWhoisResources(resp);

                        var primaryKey = whoisResources.getPrimaryKey();
                        MessageStore.add(primaryKey, whoisResources);

                        $state.transitionTo('display', {source: $scope.source, objectType: MNT_TYPE, name: primaryKey});
                    }, function(error) {
                        AlertService.populateFieldSpecificErrors(MNT_TYPE, $scope.maintainerAttributes, error.data);
                        AlertService.showWhoisResourceErrors(MNT_TYPE, error.data);
                    }
                );
            }

            //TODO (TCP) - this is the same code found on createController. Think in a way to remove it from here.
            /*
             * Methods used to make sure that attributes have meta information and have utility functions
             */
            function _wrapAndEnrichAttributes(attrs) {
                return WhoisResources.wrapAttributes(
                    WhoisResources.enrichAttributesWithMetaInfo(MNT_TYPE, attrs)
                );
            }

            $scope.adminC = {
                object: [],
                alternatives: []
            };

            $scope.adminCAutocomplete = function (query) {
                // need to typed characters
                if (query.length >= 2) {
                    RestService.autocomplete( 'admin-c', query, true).then(
                        function (data) {
                            // mark new
                            $scope.adminC.alternatives = _stripAlreadySelected(data);
                        }
                    );
                }
            }

            function _stripAlreadySelected(adminC) {
                return _.filter(adminC, function (adminC) {
                    return !$scope.adminC.object !== adminC;
                });
            };

            $scope.hasAdminC = function() {
                return $scope.adminC.object.length > 0;
            };

            $scope.onAdminCAdded = function (item) {
                $scope.maintainerAttributes = $scope.maintainerAttributes.addAttributeAfterType({name: 'admin-c', value: item.key}, {name: 'admin-c'});
                $scope.maintainerAttributes = WhoisResources.enrichAttributesWithMetaInfo(MNT_TYPE, $scope.maintainerAttributes);
                $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);
            };

            $scope.onAdminCRemoved = function (item) {
                _.remove($scope.maintainerAttributes, function (i) {
                    return i.name === 'admin-c' && i.value === item.key;
                });
            };

        }]);

