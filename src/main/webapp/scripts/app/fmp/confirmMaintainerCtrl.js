'use strict';

angular.module('fmp')
    .controller('ConfirmMaintainerCtrl', ['$scope', '$log', '$stateParams', '$state', '$location', 'AlertService', 'EmailLink',
            function ($scope, $log, $stateParams, $state, $location, AlertService, EmailLink) {
                AlertService.clearErrors();

                $log.info('ConfirmMaintainerCtrl starts');

                $scope.key = '';
                $scope.mntnerModificationUrl = undefined;
                $scope.email = undefined;
                $scope.user = undefined;
                $scope.hashOk = false;

                if ($stateParams.hash === undefined) {
                    AlertService.setGlobalError('No hash passed along');
                    return;
                }

                $scope.localHash = $stateParams.hash;

                EmailLink.get({hash: $scope.localHash}, function (link) {

                    $log.info('Successfully fetched email-link');

                    $scope.key = link.mntner;
                    $scope.email = link.email;
                    $scope.user = link.username;

                    if (!link.hasOwnProperty('expiredDate') || moment(link.expiredDate, moment.ISO_8601).isBefore(moment())) {
                        AlertService.addGlobalWarning('Your link has expired');
                        return;
                    }

                    if (link.currentUserAlreadyManagesMntner === true) {
                        AlertService.addGlobalWarning(
                            'Your RIPE NCC Access account is already associated with this mntner. ' +
                            'You can modify this mntner.');
                        return;
                    }

                    $scope.hashOk = true;
                    AlertService.addGlobalInfo('You are logged in with the RIPE NCC Access account ' + $scope.user );

                }, function (error) {

                    $log.error('Error fetching email-link:' + error.data);
                    AlertService.setGlobalError('Error fetching email-link');

                });

                $scope.associate = function () {
                    EmailLink.update({hash: $scope.localHash}, {hash: $scope.localHash}, function (resp) {

                        _navigateToSsoAdded($scope.key, $scope.user);

                    }, function (error) {

                        if (error.status === 400 && !_.isUndefined(error.data) && error.data.match(/already contains SSO/).length === 1) {
                            AlertService.setGlobalError(error.data);
                        } else {
                            AlertService.setGlobalError(
                                '<p>An error occurred while adding the RIPE NCC Access account to the <span class="mntner">MNTNER</span> object.</p>' +
                                '<p>No changes were made to the <span class="mntner">MNTNER</span> object ' + $scope.key + '.</p>' +
                                '<p>If this error continues, please contact us at <a href="mailto:ripe-dbm@ripe.net">ripe-dbm@ripe.net</a> for assistance.</p>');
                        }
                    });
                };

                $scope.cancelAssociate = function () {
                    AlertService.clearErrors();
                    AlertService.addGlobalWarning(
                        '<p>No changes were made to the <span class="mntner">MNTNER</span> object ' + $scope.key + '.</p>' +
                        '<p>If you wish to add a different RIPE NCC Access account to your <strong>MNTNER</strong> object:' +
                        '<ol>' +
                        '<li>Sign out of RIPE NCC Access.</li>' +
                        '<li>Sign back in to RIPE NCC Access with the account you wish to use.</li>' +
                        '<li>Click on the link in the instruction email again.</li>' +
                        '</ol>');
                };

                function _navigateToSsoAdded(maintainerKey, user) {
                    $state.transitionTo('fmp.ssoAdded', {
                        maintainerKey: maintainerKey,
                        user: user
                    });
                }

                function _navigateToLegacy(maintainerKey) {
                    $state.transitionTo('fmp.legacy', {
                        maintainerKey: maintainerKey
                    });
                }
            }
        ]
    );
