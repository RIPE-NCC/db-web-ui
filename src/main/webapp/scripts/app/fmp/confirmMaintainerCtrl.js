'use strict';

angular.module('fmp')
    .controller('ConfirmMaintainerCtrl', ['$scope', '$stateParams', '$location', 'EmailLink',
        function ($scope, $stateParams, $location, EmailLink) {

            if ($stateParams.hash === undefined) {
                $scope.state = 'fail';
            } else {
                $scope.localHash = $stateParams.hash;
                EmailLink.get({hash: $scope.localHash}, function (link) {
                    if (!link.hasOwnProperty('expiredDate') || moment(link.expiredDate, moment.ISO_8601).isBefore(moment())) {
                        $location.path('/legacy');
                    } else {
                        $scope.key = link.mntner;
                        $scope.mntnerModificationUrl = _makeModificationUrl($scope.key);
                        $scope.email = link.email;
                        $scope.user = link.username;
                        $scope.state = 'init';
                        if (link.currentUserAlreadyManagesMntner === true) {
                            $scope.state = 'currentUserAlreadyManagesMntner';
                        }
                    }

                }, function (data) {
                    if (data.status === 403) {
                        $scope.state = 'notloggedin';
                    } else {
                        $location.path('/legacy');
                    }
                });
            }

            $scope.associate = function () {
                EmailLink.update({hash: $scope.localHash}, {hash: $scope.localHash}, function () {
                    $scope.state = 'success';
                }, function (data) {
                    if (data.status === 400 && data.data !== undefined && data.data.match(/already contains SSO/).length === 1) {
                        $scope.reason = data.data;
                    }
                    $scope.state = 'fail';
                });
            };

            $scope.cancelAssociate = function () {
                $scope.state = 'cancel';
            };

            function _makeModificationUrl(key) {
                return '/db-web-ui/#/webupdates/modify/RIPE/mntner/' + key;
            }
        }]
    );
