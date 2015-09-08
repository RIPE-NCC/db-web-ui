
/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('CreateSelfMaintainedMaintainerController', ['$scope', '$state', '$log', '$stateParams', 'WhoisResources', 'AlertService', 'UserInfoService', 'RestService', 'MessageStore',
        function ($scope, $state, $log, $stateParams, WhoisResources, AlertService, UserInfoService, RestService, MessageStore) {

            $scope.adminC = {
                object: [],
                alternatives: []
            };

            AlertService.clearErrors();

            // workaround for problem with order of loading ui-select fragments
            $scope.uiSelectTemplateReady = false;
            RestService.fetchUiSelectResources().then(function () {
                $scope.uiSelectTemplateReady = true;
            });

            var MNT_TYPE = 'mntner';
            $scope.source = $stateParams.source;
            if( !_.isUndefined($stateParams.admin)) {
                var item = {type:'person', key:$stateParams.admin};
                $scope.adminC.object.push(item);
            }
            $scope.maintainerAttributes = WhoisResources.wrapAndEnrichAttributes(MNT_TYPE, WhoisResources.getMandatoryAttributesOnObjectType(MNT_TYPE));

            $scope.admincDescription = WhoisResources.getAttributeDocumentation($scope.objectType, 'admin-c');
            $scope.admincSyntax =      WhoisResources.getAttributeSyntax($scope.objectType, 'admin-c');

            $scope.submit = function () {
                $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);

                $scope.maintainerAttributes.setSingleAttributeOnName('upd-to', UserInfoService.getUserInfo().username);
                $scope.maintainerAttributes.setSingleAttributeOnName('auth', 'SSO ' + UserInfoService.getUserInfo().username);
                $scope.maintainerAttributes.setSingleAttributeOnName('source', $scope.source);

                var mntner = $scope.maintainerAttributes.getSingleAttributeOnName(MNT_TYPE);
                $scope.maintainerAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                $log.info('submit attrs:' + JSON.stringify($scope.maintainerAttributes));

                $scope.maintainerAttributes.clearErrors();
                if(!$scope.maintainerAttributes.validate()) {
                    $log.error('Error validating attributes');
                } else {
                   createObject();
                }

            };

            function createObject() {
                $scope.maintainerAttributes = $scope.maintainerAttributes.removeNullAttributes();

                var obj = WhoisResources.turnAttrsIntoWhoisObject($scope.maintainerAttributes);

                RestService.createObject($scope.source, MNT_TYPE, obj)
                    .then(function (resp) {
                        $log.info('autocomplete success:' + JSON.stringify(resp));
                        var whoisResources = WhoisResources.wrapWhoisResources(resp);

                        var primaryKey = whoisResources.getPrimaryKey();
                        MessageStore.add(primaryKey, whoisResources);

                        $state.transitionTo('display', {source: $scope.source, objectType: MNT_TYPE, name: primaryKey});
                    }, function(error) {
                        $log.error('create error:' +  JSON.stringify(error));
                        AlertService.populateFieldSpecificErrors(MNT_TYPE, $scope.maintainerAttributes, error.data);
                        AlertService.showWhoisResourceErrors(MNT_TYPE, error.data);
                    }
                );
            }

            $scope.adminCAutocomplete = function (query) {
                // need to typed characters
                if (query.length >= 2) {
                        RestService.autocomplete( 'admin-c', query, true,['person','role']).then(
                        function (data) {
                            $log.info('autocomplete success:' + JSON.stringify(data));
                            // mark new
                            $scope.adminC.alternatives = _stripAlreadySelected(data);
                        },
                        function(error) {
                            $log.error('autocomplete error:' +  JSON.stringify(error));
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
                $log.info('onAdminCAdded:' + JSON.stringify(item));
                $scope.maintainerAttributes = $scope.maintainerAttributes.addAttributeAfterType({name: 'admin-c', value: item.key}, {name: 'admin-c'});
                $scope.maintainerAttributes = WhoisResources.enrichAttributesWithMetaInfo(MNT_TYPE, $scope.maintainerAttributes);
                $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);
            };

            $scope.onAdminCRemoved = function (item) {
                $log.info('onAdminCRemoved:' + JSON.stringify(item));
                _.remove($scope.maintainerAttributes, function (i) {
                    return i.name === 'admin-c' && i.value === item.key;
                });
            };

        }]);

