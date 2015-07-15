angular.module('webUpdates').controller('ModalAuthenticationController', ['$scope', '$modalInstance',  'WhoisResources', 'RestService', 'UserInfoService', 'CredentialsService', 'source', 'mntners',
    function ($scope, $modalInstance, WhoisResources, RestService, UserInfoService, CredentialsService, source, mntners) {

        $scope.mntners = mntners;
        $scope.selected = {
            item: $scope.mntners[0],
            password: '',
            associate: false,
            message: undefined
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.ok = function () {

            if( $scope.selected.password.length == 0 ) {

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
                    console.log("ssoUserName:" + ssoUserName);
                    if( $scope.selected.associate && ssoUserName ) {
                        var attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes()).addAttributeAfterType({
                            name: 'auth',
                            value: 'SSO ' + ssoUserName
                        }, {name: 'auth'});

                        RestService.associateSSOMntner(whoisResources.getSource(),
                            whoisResources.getObjectType(),
                            whoisResources.getPrimaryKey(),
                            WhoisResources.embedAttributes(attributes), $scope.selected.password)
                            .then(
                            function (resp) {
                                $scope.selected.item.mine = true;
                                CredentialsService.removeCredentials();
                            });
                        _associate(whoisResources, attributes, ssoUserName, $scope.selected.password, new function () {

                        });
                    }

                    $modalInstance.close($scope.selected.item);

                }, function( error ) {
                    console.log('server error in modal:' + JSON.stringify(error) );

                    var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                    if (!_.isUndefined(whoisResources)) {
                        console.log('whois error response in modal');
                        $scope.selected.message = _.reduce(whoisResources.getGlobalErrors(), function (total, n) {
                            return total + '\n' + n;
                        });
                    } else {
                        $scope.selected.message =
                            'Error performing validation for mntner: \'' + $scope.selected.item.key + '\'';
                    }
                }
            );
        };

        function _associate(whoisResources, attributes, ssoUsername, mntnerPassword, callback) {

            var attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes()).addAttributeAfterType({
                name: 'auth',
                value: 'SSO ' + ssoUsername
            }, {name: 'auth'});

            RestService.associateSSOMntner(whoisResources.getSource(), whoisResources.getObjectType(), whoisResources.getPrimaryKey(),
                WhoisResources.embedAttributes(attributes), mntnerPassword).then();
        }
    }]);
