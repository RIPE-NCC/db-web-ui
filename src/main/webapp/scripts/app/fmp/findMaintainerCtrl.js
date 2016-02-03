'use strict';

angular.module('fmp')
    .controller('FindMaintainerCtrl', ['$scope', '$location', '$log', 'Maintainer', 'SendMail', 'Validate',

        function ($scope, $location, $log, Maintainer, SendMail, Validate) {

            $log.info('FindMaintainerCtrl');

            $scope.selectMaintainer = function () {

                $log.info('Search for mntner ' + $scope.maintainerKey);

                $scope.showSearchSpinner = true;
                $scope.warningMessage = null;
                $scope.infoMessage = null;
                $scope.selectedMaintainer = null;
                Maintainer.get({maintainerKey: $scope.maintainerKey}, function (result) {

                    $log.info('Found mntner ' + $scope.maintainerKey + ':' + JSON.stringify(result));

                    Validate.get({maintainerKey: $scope.maintainerKey}, function (validationResult) {
                            $scope.showSearchSpinner = false;

                            $log.info('Validated mntner ' + $scope.maintainerKey + ':' + JSON.stringify(validationResult));

                            $scope.selectedMaintainer = result.objects.object[0];
                            $scope.errorMessage = null;
                            $scope.infoMessage = null;

                            var updTos = $scope.selectedMaintainer.attributes.attribute.filter(function (elm) {
                                return elm.name === 'upd-to';
                            });
                            if (updTos.length > 0) {
                                $scope.email = updTos[0].value;
                            }

                            $scope.expiredLink = validationResult.expired;
                        },
                        function (data) {
                            $log.error('Error validating mntner ' + $scope.maintainerKey + ':' + JSON.stringify(data));

                            $location.path('/legacy/' + $scope.maintainerKey);
                        });
                }, function (data) {
                    $scope.showSearchSpinner = false;

                    $log.error('Error searching mntner ' + $scope.maintainerKey + ':' + JSON.stringify(data));

                    if (data.status === 403) {
                        $scope.errorMessage = data.data;
                    } else {
                        $scope.errorMessage = ' The Maintainer could not be found.';
                    }
                });
            };

            $scope.switchToManualResetProcess = function () {
                $location.path('/legacy/' + $scope.maintainerKey + '/voluntary');
            };

            $scope.validateEmail = function () {
                $scope.emailValidating = true;
                $scope.showEmailSpinner = true;
                SendMail.save({maintainerKey: $scope.maintainerKey},
                    function (result) {
                        $scope.infoMessage = result.email;
                        $scope.showEmailSpinner = false;
                    }, function (failData) {
                        $scope.showEmailSpinner = false;
                        if (failData.data.match(/unable to send email/i)) {
                            $scope.warningMessage = failData.data;
                        } else {
                            $location.path('/legacy/' + $scope.maintainerKey);
                        }
                    });
            };
        }]
    );
