/*global angular */

(function () {
    'use strict';

    angular.module('webUpdates').controller('ForceDeleteController', [
        '$scope', '$stateParams', '$state', '$log', '$q', 'WhoisResources', 'WebUpdatesCommons',
        'RestService', 'MntnerService', 'AlertService', 'STATE',

        function ($scope, $stateParams, $state, $log, $q, WhoisResources, WebUpdatesCommons,
                  RestService, MntnerService, AlertService, STATE) {

            $scope.forceDelete = forceDelete;
            $scope.cancel = cancel;
            $scope.isFormValid = _isFormValid;

            _initialisePage();

            function _initialisePage() {

                $scope.restCallInProgress = false;

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.object = {
                    source: $stateParams.source,
                    type: $stateParams.objectType,
                    name: _getNameFromUrl(),
                    attributes: []
                };

                $log.debug('ForceDeleteController: Url params: source:' + $scope.object.source + '. type:' + $scope.object.type + ', name: ' + $scope.object.name);

                //The maintainers appearing on the horizontal box (not the dropdown area)
                // are stored to $scope.maintainers.object in the construct below
                $scope.maintainers = {
                    sso: [],
                    object: [],
                    objectOriginal: [] // needed to make MntnerService.performAuthentication happy
                };

                var hasError = _validateParamsAndShowErrors();
                if (hasError === false) {
                    _fetchDataForForceDelete();
                }
            }

            function _getNameFromUrl() {
                if (!_.isUndefined($stateParams.name)) {
                    return decodeURIComponent($stateParams.name);
                }
            }

            function _isFormValid() {
                return !AlertService.hasErrors();
            }

            function _validateParamsAndShowErrors() {
                var hasError = false;
                var forceDeletableObjectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

                if (!_.contains(forceDeletableObjectTypes, $scope.object.type)) {

                    var typesString = _.reduce(forceDeletableObjectTypes, function (str, n) {
                        return str + ', ' + n;
                    });

                    AlertService.setGlobalError('Only ' + typesString + ' object types are force-deletable');
                    hasError = true;
                }

                if (_.isUndefined($scope.object.source)) {
                    AlertService.setGlobalError('Source is missing');
                    hasError = true;
                }

                if (_.isUndefined($scope.object.name)) {
                    AlertService.setGlobalError('Object key is missing');
                    hasError = true;
                }

                return hasError;
            }

            function _fetchDataForForceDelete() {

                // wait until all three have completed
                $scope.restCallInProgress = true;
                $q.all({
                    objectToModify: RestService.fetchObject($scope.object.source, $scope.object.type, $scope.object.name),
                    ssoMntners: RestService.fetchMntnersForSSOAccount()
                }).then(
                    function (results) {
                        $scope.restCallInProgress = false;

                        // store object to modify
                        $log.debug('object to modify:' + JSON.stringify(results.objectToModify));
                        _wrapAndEnrichResources($scope.object.type, results.objectToModify);

                        // store mntners for SSO account
                        $scope.maintainers.sso = results.ssoMntners;
                        $log.debug('maintainers.sso:' + JSON.stringify($scope.maintainers.sso));

                        useDryRunDeleteToDetectAuthCandidates().then(
                            function (authCandidates) {
                                var objectMntners = _.map(authCandidates, function (item) {
                                    return {
                                        key: item,
                                        type: 'mntner'
                                    };
                                });

                                // fetch details of all selected maintainers concurrently
                                $scope.restCallInProgress = true;
                                RestService.detailsForMntners(objectMntners).then(
                                    function (enrichedMntners) {
                                        $scope.restCallInProgress = false;

                                        $scope.maintainers.object = enrichedMntners;
                                        $log.debug('maintainers.object:' + JSON.stringify($scope.maintainers.object));

                                    },
                                    function (error) {
                                        $scope.restCallInProgress = false;
                                        $log.error('Error fetching mntner details' + JSON.stringify(error));
                                        AlertService.setGlobalError('Error fetching maintainer details');
                                    });

                            }, function (errorMsg) {
                                AlertService.setGlobalError(errorMsg);
                            });
                    }
                ).catch(
                    function (error) {
                        $scope.restCallInProgress = false;
                        if (error && error.data) {
                            $log.error('Error fetching object:' + JSON.stringify(error));
                            var whoisResources = _wrapAndEnrichResources($scope.objectType, error.data);
                            AlertService.setErrors(whoisResources);
                        } else {
                            $log.error('Error fetching mntner information:' + JSON.stringify(error));
                            AlertService.setGlobalError('Error fetching maintainers to force delete this object');
                        }
                    }
                );
            }

            function useDryRunDeleteToDetectAuthCandidates() {
                var deferredObject = $q.defer();

                $scope.restCallInProgress = true;
                RestService.deleteObject($scope.object.source, $scope.object.type, $scope.object.name, 'dry-run', false, [], true).then(
                    function () {
                        $scope.restCallInProgress = false;
                        $log.debug('auth can be performed without interactive popup');
                        deferredObject.resolve([]);
                    },
                    function (error) {
                        $scope.restCallInProgress = false;
                        // we expect an error: from the error we except auth candidates
                        var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                        if (whoisResources.getRequiresAdminRightFromError()) {
                            deferredObject.reject('Deleting this object requires administrative authorisation');
                        } else {
                            // strip RIPE-NCC- mntners
                            var authCandidates = whoisResources.getAuthenticationCandidatesFromError();
                            authCandidates = _.filter(authCandidates, function (mntner) {
                                return !(_.startsWith(mntner, 'RIPE-NCC-'));
                            });
                            deferredObject.resolve(_.map(authCandidates, function (item) {
                                return _.trim(item);
                            }));
                        }
                    }
                );
                return deferredObject.promise;
            }

            function _wrapAndEnrichResources(objectType, resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    $scope.object.attributes = WhoisResources.wrapAndEnrichAttributes(objectType, whoisResources.getAttributes());
                }
                return whoisResources;
            }

            function cancel() {
                WebUpdatesCommons.navigateToDisplay($scope.object.source, $scope.object.type, $scope.object.name, undefined);
            }

            function forceDelete() {
                if (_isFormValid()) {
                    if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, [], $scope.maintainers.object)) {
                        $log.debug('Need auth');
                        _performAuthentication();
                    } else {
                        $log.debug('No auth needed');
                        _onSuccessfulAuthentication();
                    }
                }
            }

            function _performAuthentication() {
                var authParams = {
                    maintainers: $scope.maintainers,
                    operation: 'ForceDelete',
                    object: {
                        source: $scope.object.source,
                        type: $scope.object.type,
                        name: $scope.object.name
                    },
                    isLirObject: null,
                    successClbk:_onSuccessfulAuthentication,
                    failureClbk: cancel
                };
                WebUpdatesCommons.performAuthentication(authParams);
            }

            function _onSuccessfulAuthentication() {
                $log.debug('Navigate to force delete screen');
                WebUpdatesCommons.navigateToDelete($scope.object.source, $scope.object.type, $scope.object.name, STATE.FORCE_DELETE);
            }

        }]);
})();
