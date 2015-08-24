'use strict';

angular.module('webUpdates').controller('ModalAuthenticationController', ['$scope', '$log', '$modalInstance',  'WhoisResources', 'RestService', 'UserInfoService', 'CredentialsService', 'source', 'mntners',
    function ($scope, $log, $modalInstance, WhoisResources, RestService, UserInfoService, CredentialsService, source, mntners) {

        $scope.mntners = mntners;
        $scope.selected = {
            item: $scope.mntners[0],
            password: '',
            associate: true,
            message: undefined
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.ok = function () {

            if( $scope.selected.password.length === 0 ) {
                $scope.selected.message = 'Password for mntner: \'' + $scope.selected.item.key + '\'' + ' too short';
                return;
            }

            RestService.authenticate(source, 'mntner', $scope.selected.item.key, $scope.selected.password).then(
                function (result) {
                    var whoisResources = WhoisResources.wrapWhoisResources(result);

                    if (whoisResources.isFiltered()) {
                        $scope.selected.message =
                            'You have not supplied the correct password for mntner: \'' + $scope.selected.item.key + '\'';
                        return;
                    }

                    CredentialsService.setCredentials($scope.selected.item.key, $scope.selected.password);

                    var ssoUserName = UserInfoService.getUsername();
                    if( $scope.selected.associate && ssoUserName ) {

                        // append auth-md5 attribute
                        var attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes()).addAttributeAfterType({
                            name: 'auth',
                            value: 'SSO ' + ssoUserName
                        }, {name: 'auth'});

                        // do adjust the maintainer
                        RestService.associateSSOMntner(whoisResources.getSource(),'mntner', $scope.selected.item.key,
                            WhoisResources.turnAttrsIntoWhoisObject(attributes), $scope.selected.password) .then(
                            function (resp) {
                                $scope.selected.item.mine = true;
                                CredentialsService.removeCredentials(); //i because ts now an sso mntner
                                // report success back
                                $modalInstance.close({selectedItem:$scope.selected.item, response: resp});

                            }, function(error) {
                                $log.error('Association error:' + JSON.stringify(error));

                            });
                    } else {
                        $log.debug('No need to associate');
                        // report success back
                        $modalInstance.close({selectedItem:$scope.selected.item});
                    }


                }, function( error ) {
                    $log.error('Authentication error:' + JSON.stringify(error) );

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