
/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('CreateSelfMaintainedMaintainerController', ['$scope', '$state', '$log', '$stateParams', 'WhoisResources', 'AlertService', 'UserInfoService', 'RestService', 'MessageStore',
        function ($scope, $state, $log, $stateParams, WhoisResources, AlertService, UserInfoService, RestService, MessageStore) {

            var MNT_TYPE = 'mntner';

            $scope.submit = submit;
            $scope.cancel = cancel;
            $scope.adminCAutocomplete = adminCAutocomplete;
            $scope.hasAdminC = hasAdminC;
            $scope.onAdminCAdded = onAdminCAdded;
            $scope.onAdminCRemoved = onAdminCRemoved;

            function _initialise() {
                AlertService.clearErrors();

                $scope.admincDescription = WhoisResources.getAttributeDocumentation($scope.objectType, 'admin-c');
                $scope.admincSyntax = WhoisResources.getAttributeSyntax($scope.objectType, 'admin-c');

                $scope.ssoUserName = undefined;

                $scope.adminC = {
                    object: [],
                    alternatives: []
                };

                // workaround for problem with order of loading ui-select fragments
                $scope.uiSelectTemplateReady = false;
                RestService.fetchUiSelectResources().then(function () {
                    $scope.uiSelectTemplateReady = true;
                });

                $scope.maintainerAttributes = WhoisResources.wrapAndEnrichAttributes(MNT_TYPE, WhoisResources.getMandatoryAttributesOnObjectType(MNT_TYPE));

                $scope.source = $stateParams.source;
                $scope.maintainerAttributes.setSingleAttributeOnName('source', $scope.source);

                if (!_.isUndefined($stateParams.admin)) {
                    var item = {type: 'person', key: $stateParams.admin};
                    $scope.adminC.object.push(item);
                    $scope.onAdminCAdded(item);
                }


                if( _.isUndefined(UserInfoService.getUsername()) ) {
                    // kick off ajax-call to fetch email address of logged-in user
                    UserInfoService.init(_onSsoInfoAvailable);
                } else {
                    $scope.maintainerAttributes.setSingleAttributeOnName('upd-to', UserInfoService.getUserInfo().username);
                    $scope.maintainerAttributes.setSingleAttributeOnName('auth', 'SSO ' + UserInfoService.getUserInfo().username);
                }
                $log.info('attrs-initial:' + JSON.stringify($scope.maintainerAttributes));
            }
            _initialise();

            function submit() {
                $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);

                var mntner = $scope.maintainerAttributes.getSingleAttributeOnName(MNT_TYPE);
                $scope.maintainerAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                $log.info('submit attrs:' + JSON.stringify($scope.maintainerAttributes));

                $scope.maintainerAttributes.clearErrors();
                if(!$scope.maintainerAttributes.validate()) {
                    $log.error('Error validating attributes');
                } else {
                   _createObject();
                }
            };

            function cancel() {
                if ( window.confirm('Are you sure?') ) {
                    window.history.back();
                }
            }

            function _createObject() {
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

            function adminCAutocomplete(query) {
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

            function hasAdminC() {
                return $scope.adminC.object.length > 0;
            };

            function onAdminCAdded(item) {
                $log.info('onAdminCAdded:' + JSON.stringify(item));
                $scope.maintainerAttributes = $scope.maintainerAttributes.addAttributeAfterType({name: 'admin-c', value: item.key}, {name: 'admin-c'});
                $scope.maintainerAttributes = WhoisResources.enrichAttributesWithMetaInfo(MNT_TYPE, $scope.maintainerAttributes);
                $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);
            };

            function onAdminCRemoved(item) {
                $log.info('onAdminCRemoved:' + JSON.stringify(item));
                _.remove($scope.maintainerAttributes, function (i) {
                    return i.name === 'admin-c' && i.value === item.key;
                });
            };

            function _onSsoInfoAvailable() {
                $log.info('_onSsoInfoAvailable:' + UserInfoService.getUsername());
                $scope.ssoUserName = UserInfoService.getUsername();
                if( $scope.ssoUserName ) {
                    $scope.maintainerAttributes.setSingleAttributeOnName('upd-to', UserInfoService.getUserInfo().username);
                    $scope.maintainerAttributes.setSingleAttributeOnName('auth', 'SSO ' + UserInfoService.getUserInfo().username);
                }
            }

        }]);

