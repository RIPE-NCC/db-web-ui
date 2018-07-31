/*global window: false */

(function () {
    'use strict';

    angular.module('webUpdates').controller('CreateSelfMaintainedMaintainerController', ['$scope', '$state', '$log', '$stateParams',
        'WhoisResources', 'AlertService', 'UserInfoService', 'RestService', 'MessageStore', 'ErrorReporterService', 'LinkService',

        function ($scope, $state, $log, $stateParams,
                  WhoisResources, AlertService, UserInfoService, RestService, MessageStore, ErrorReporterService, LinkService) {

            var MNT_TYPE = 'mntner';

            $scope.submit = submit;
            $scope.cancel = cancel;
            $scope.adminCAutocomplete = adminCAutocomplete;
            $scope.hasAdminC = hasAdminC;
            $scope.onAdminCAdded = onAdminCAdded;
            $scope.onAdminCRemoved = onAdminCRemoved;
            $scope.isFormValid = isFormValid;
            $scope.fieldVisited = fieldVisited;
            $scope.getAttributeDescription = getAttributeDescription;
            $scope.getAttributeSyntax = getAttributeSyntax;

            function _initialise() {

                $scope.submitInProgress = false;

                AlertService.clearErrors();

                $scope.admincDescription = WhoisResources.getAttributeDescription($scope.objectType, 'admin-c');
                $scope.admincSyntax = WhoisResources.getAttributeSyntax($scope.objectType, 'admin-c');

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

                // kick off ajax-call to fetch email address of logged-in user
                UserInfoService.getUserOrgsAndRoles().then(
                    function (result) {
                        $scope.maintainerAttributes.setSingleAttributeOnName('upd-to', result.user.username);
                        $scope.maintainerAttributes.setSingleAttributeOnName('auth', 'SSO ' + result.user.username);
                    }, function () {
                        AlertService.setGlobalError('Error fetching SSO information');
                    }
                );
            }

            _initialise();

            function submit() {
                _populateMissingAttributes();

                $log.info('submit attrs:' + JSON.stringify($scope.maintainerAttributes));

                $scope.maintainerAttributes.clearErrors();
                if (!$scope.maintainerAttributes.validate()) {
                    ErrorReporterService.log('Create', MNT_TYPE, AlertService.getErrors(), $scope.maintainerAttributes);
                } else {
                    _createObject();
                }
            }

            function isFormValid() {
                _populateMissingAttributes();
                return $scope.maintainerAttributes.validateWithoutSettingErrors();
            }

            function _populateMissingAttributes() {
                $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);

                var mntner = $scope.maintainerAttributes.getSingleAttributeOnName(MNT_TYPE);
                $scope.maintainerAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
            }

            function cancel() {
                if (window.confirm('Are you sure?')) {
                    $state.transitionTo('webupdates.select');
                }
            }

            function fieldVisited(attr) {
                RestService.autocomplete(attr.name, attr.value, true, []).then(
                    function (data) {
                        if (_.any(data, function (item) {
                                return item.type === attr.name && item.key.toLowerCase() === attr.value.toLowerCase();
                            })) {
                            attr.$$error = attr.name + ' ' + LinkService.getModifyLink($scope.source, attr.name, attr.value) + ' already exists';
                        } else {
                            attr.$$error = '';
                        }
                    }
                );
            }

            function _createObject() {
                $scope.maintainerAttributes = $scope.maintainerAttributes.removeNullAttributes();

                var obj = WhoisResources.turnAttrsIntoWhoisObject($scope.maintainerAttributes);

                $scope.submitInProgress = true;
                RestService.createObject($scope.source, MNT_TYPE, obj)
                    .then(function (resp) {
                            $scope.submitInProgress = false;

                            var primaryKey = resp.getPrimaryKey();
                            MessageStore.add(primaryKey, resp);

                            $state.transitionTo('webupdates.display', {source: $scope.source, objectType: MNT_TYPE, name: primaryKey});
                        },
                        function (error) {
                            $scope.submitInProgress = false;

                            AlertService.populateFieldSpecificErrors(MNT_TYPE, $scope.maintainerAttributes, error.data);
                            AlertService.showWhoisResourceErrors(MNT_TYPE, error.data);
                            ErrorReporterService.log('Create', MNT_TYPE, AlertService.getErrors(), $scope.maintainerAttributes);
                        }
                    );
            }

            function adminCAutocomplete(query) {
                RestService.autocomplete('admin-c', query, true, ['person', 'role']).then(
                    function (data) {
                        $log.debug('autocomplete success:' + JSON.stringify(data));
                        // mark new
                        $scope.adminC.alternatives = _stripAlreadySelected(data);
                    },
                    function (error) {
                        $log.error('autocomplete error:' + JSON.stringify(error));
                    }
                );
            }

            function _stripAlreadySelected(adminC) {
                return _.filter(adminC, function (adminC) {
                    return !$scope.adminC.object !== adminC;
                });
            }

            function hasAdminC() {
                return $scope.adminC.object.length > 0;
            }

            function onAdminCAdded(item) {
                $log.debug('onAdminCAdded:' + JSON.stringify(item));
                $scope.maintainerAttributes = $scope.maintainerAttributes.addAttributeAfterType({name: 'admin-c', value: item.key}, {name: 'admin-c'});
                $scope.maintainerAttributes = WhoisResources.enrichAttributesWithMetaInfo(MNT_TYPE, $scope.maintainerAttributes);
                $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);
            }

            function onAdminCRemoved(item) {
                $log.debug('onAdminCRemoved:' + JSON.stringify(item));
                _.remove($scope.maintainerAttributes, function (i) {
                    return i.name === 'admin-c' && i.value === item.key;
                });
            }

            function getAttributeDescription(attrName) {
                return WhoisResources.getAttributeDescription($scope.objectType, attrName);
            }

            function getAttributeSyntax(attrName) {
                return WhoisResources.getAttributeSyntax($scope.objectType, attrName);
            }

        }]);

})();
