/*global angular*/
(function() {
'use strict';

angular.module('webUpdates').controller('ModalAuthenticationController', ['$scope', '$log', '$uibModalInstance', 'WhoisResources', 'RestService',
    'UserInfoService', 'CredentialsService', 'MntnerService', 'method', 'source', 'objectType', 'objectName', 'mntners', 'mntnersWithoutPassword', 'allowForcedDelete', 'isLirObject', 'Properties',
    function($scope, $log, $modalInstance, WhoisResources, RestService, UserInfoService, CredentialsService, MntnerService, method, source, objectType, objectName, mntners, mntnersWithoutPassword, allowForcedDelete, isLirObject, Properties) {

        $scope.mntners = mntners;
        $scope.mntnersWithoutPassword = mntnersWithoutPassword;
        $scope.source = source;
        $scope.objectType = objectType;
        $scope.objectName = objectName;
        $scope.selected = {
            item: $scope.mntners[0],
            password: '',
            associate: true,
            message: undefined
        };
        $scope.isLirObject = isLirObject;
        $scope.PORTAL_URL = Properties.PORTAL_URL;

        $scope.allowForceDelete = function () {
            if (method === 'ForceDelete') {
                return false;
            }
            return allowForcedDelete;
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.ok = function () {

            if ($scope.selected.password.length === 0 && $scope.selected.item) {
                $scope.selected.message = 'Password for mntner: \'' + $scope.selected.item.key + '\'' + ' too short';
                return;
            }

            if (!$scope.selected.item || !$scope.selected.item.key) {
                return;
            }
            RestService.authenticate(method, source, 'mntner', $scope.selected.item.key, $scope.selected.password).then(
                function (result) {
                    var whoisResources = result;

                    if (whoisResources.isFiltered()) {
                        $scope.selected.message =
                            'You have not supplied the correct password for mntner: \'' + $scope.selected.item.key + '\'';
                        return;
                    }

                    CredentialsService.setCredentials($scope.selected.item.key, $scope.selected.password);

                    UserInfoService.getUserOrgsAndRoles().then(function(userInfo) {
                        var ssoUserName = userInfo.user.username;
                        if ($scope.selected.associate && ssoUserName) {

                            // append auth-md5 attribute
                            var attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes()).addAttributeAfterType({
                                name: 'auth',
                                value: 'SSO ' + ssoUserName
                            }, {name: 'auth'});

                            // do adjust the maintainer
                            RestService.associateSSOMntner(whoisResources.getSource(), 'mntner', $scope.selected.item.key,
                                WhoisResources.turnAttrsIntoWhoisObject(attributes), $scope.selected.password).then(
                                function (resp) {
                                    $scope.selected.item.mine = true;
                                    CredentialsService.removeCredentials(); // because it's now an sso mntner
                                    // report success back
                                    $modalInstance.close({selectedItem: $scope.selected.item, response: resp});

                                }, function (error) {
                                    $log.error('Association error:' + angular.toJson(error));
                                    // remove modal anyway
                                    $modalInstance.close({selectedItem: $scope.selected.item});
                                });
                        } else {
                            $log.debug('No need to associate');
                            // report success back
                            $modalInstance.close({selectedItem: $scope.selected.item});
                        }
                    });
                }, function (error) {
                    $log.error('Authentication error:' + angular.toJson(error));

                    var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                    if (!_.isUndefined(whoisResources)) {
                        $scope.selected.message = _.reduce(whoisResources.getGlobalErrors(), function (total, msg) {
                            return total + '\n' + msg;
                        });
                    } else {
                        $scope.selected.message =
                            'Error performing validation for mntner: \'' + $scope.selected.item.key + '\'';
                    }
                }
            );
        };

    }]);
})();
