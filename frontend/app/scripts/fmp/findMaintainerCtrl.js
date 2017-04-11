/*global angular*/

(function () {
    'use strict';

    angular.module('fmp').controller('FindMaintainerCtrl', ['$scope', '$log', '$state', 'AlertService', 'Maintainer', 'SendMail', 'Validate', 'UserInfo',

        function ($scope, $log, $state, AlertService, Maintainer, SendMail, Validate, UserInfo) {
            AlertService.clearErrors();

            $log.info('FindMaintainerCtrl starts');

            $scope.mntnerFound = false;
            $scope.selectedMaintainer = undefined;
            $scope.email = undefined;

            UserInfo.get({}, function (resp) {
                $log.info('User is logged in:' + JSON.stringify(resp));

            }, function (error) {
                $log.info('User is not logged in: ' + JSON.stringify(error));
                _navigateToRequireLogin();
            });

            $scope.selectMaintainer = function () {

                $log.info('Search for mntner ' + $scope.maintainerKey);
                Maintainer.get({maintainerKey: $scope.maintainerKey}, function (result) {
                    $log.info('Found mntner ' + $scope.maintainerKey + ':' + JSON.stringify(result));
                    Validate.get({maintainerKey: $scope.maintainerKey}, function (validationResult) {

                            $log.info('Validated mntner ' + $scope.maintainerKey + ':' + JSON.stringify(validationResult));

                            $scope.mntnerFound = true;
                            $scope.selectedMaintainer = result.objects.object[0];
                            $scope.email = _.find($scope.selectedMaintainer.attributes.attribute, function (elm) {
                                    return elm.name === 'upd-to';
                                }).value;

                            if (validationResult.expired === false) {
                                AlertService.addGlobalWarning(
                                    'There is already an open request to reset the password of this maintainer. ' +
                                    'Proceeding now will cancel the earlier request.');
                            }
                        },
                        function (error) {
                            $log.error('Error validating mntner ' + $scope.maintainerKey + ':' + JSON.stringify(error));
                            _navigateToLegacy($scope.maintainerKey);
                        });
                }, function (error) {
                    $log.error('Error searching mntner ' + $scope.maintainerKey + ':' + JSON.stringify(error));
                    if (error.status === 404) {
                        AlertService.setGlobalError('The Maintainer could not be found.');
                    } else {
                        AlertService.setGlobalError('Error fetching maintainer');
                    }
                });
            };

            $scope.switchToManualResetProcess = function () {
                $log.info('Switch to voluntary manual');
                _navigateVoluntarilyToLegacy($scope.maintainerKey);
            };

            $scope.validateEmail = function () {
                SendMail.save({maintainerKey: $scope.maintainerKey},
                    function () {
                        $log.info('Successfully validated email');
                        _navigateToEmailSent($scope.maintainerKey, $scope.email);

                    },
                    function (error) {
                        $log.error('Error validating email:' + JSON.stringify(error));
                        if (error.status !== 401 && error.status !== 403) {
                            if (_.isUndefined(error.data)) {
                                AlertService.setGlobalError('Error sending email');
                            } else if (error.data.match(/unable to send email/i)) {
                                AlertService.setGlobalError(error.data);
                            }
                            _navigateToLegacy($scope.maintainerKey);
                        }
                    });
            };

            function _navigateToLegacy(maintainerKey) {
                $state.transitionTo('fmp.legacy', {
                    maintainerKey: maintainerKey
                });
            }

            function _navigateVoluntarilyToLegacy(maintainerKey) {
                $state.transitionTo('fmp.voluntary', {
                    maintainerKey: maintainerKey
                });
            }

            function _navigateToRequireLogin() {
                $state.transitionTo('fmp.requireLogin');
            }

            function _navigateToEmailSent(maintainerKey, email) {
                $state.transitionTo('fmp.mailSent', {
                    maintainerKey: maintainerKey,
                    email: email
                });
            }
        }]);

})();
