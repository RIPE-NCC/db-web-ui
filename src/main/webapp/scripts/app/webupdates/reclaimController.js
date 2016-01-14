/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimController', [
                '$scope', '$stateParams', '$state', '$log', '$q','WhoisResources', 'WebUpdatesCommons',
                 'RestService', 'MntnerService', 'AlertService', 'STATE',
        function ($scope, $stateParams, $state, $log, $q, WhoisResources, WebUpdatesCommons,
                  RestService, MntnerService, AlertService, STATE) {

            $scope.reclaim = reclaim;
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
                }

                $log.debug('ReclaimController: Url params: source:' + $scope.object.source + '. type:' + $scope.object.type + ', name:' + $scope.object.name);

                //The maintainers appearing on the horizontal box (not the dropdown area)
                // are stored to $scope.maintainers.object in the construct below
                $scope.maintainers = {
                    sso: [],
                    object: [],
                    objectOriginal:[], // needed to make MntnerService.performAuthentication happy
                };

                var hasError =  _validateParamsAndShowErrors();
                if( hasError === false ) {
                    _fetchDataForReclaim();
                }
            }

            function _getNameFromUrl() {
                if( !_.isUndefined($stateParams.name)) {
                   return decodeURIComponent($stateParams.name);
                }
                return undefined;
            }

            function _isFormValid() {
                return ! AlertService.hasErrors();
            }

            function _validateParamsAndShowErrors(){
                var hasError = false;
                var reclaimableObjectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

                if (! _.contains(reclaimableObjectTypes, $scope.object.type)){

                    var typesString = _.reduce(reclaimableObjectTypes, function(str, n) {
                        return str + ', ' + n;
                    });

                    AlertService.setGlobalError('Only ' + typesString + ' object types are reclaimable');
                    hasError = true;
                }

                if (_.isUndefined($scope.object.source)){
                    AlertService.setGlobalError('Source is missing');
                    hasError = true;
                }

                if (_.isUndefined($scope.object.name)){
                    AlertService.setGlobalError('Object key is missing');
                    hasError = true;
                }

                return hasError;
            }

            function _fetchDataForReclaim() {

                // wait until all three have completed
                $scope.restCallInProgress = true;
                $q.all({
                    objectToModify: RestService.fetchObject($scope.object.source, $scope.object.type, $scope.object.name),
                    ssoMntners: RestService.fetchMntnersForSSOAccount(),
                    objectMntners: RestService.getMntnersToReclaim($scope.object.source, $scope.object.type, $scope.object.name),
                }).then(
                    function (results) {
                        $scope.restCallInProgress = false;

                        // store object to modify
                        $log.debug('object to modify:' + JSON.stringify(results.objectToModify));
                        _wrapAndEnrichResources($scope.object.type, results.objectToModify);

                        // store mntners for SSO account
                        $scope.maintainers.sso = results.ssoMntners;
                        $log.debug('maintainers.sso:' + JSON.stringify($scope.maintainers.sso));

                        // store mntners that can be used to reclaim object
                        if( results.objectMntners.length === 0 ) {
                            AlertService.setGlobalError('No mntners found to reclaim this object');
                            return;
                        }
                        $log.debug('objectMntners:' + JSON.stringify(results.objectMntners));

                        // fetch details of all selected maintainers concurrently
                        $scope.restCallInProgress = true;
                        RestService.detailsForMntners(results.objectMntners).then(
                            function (enrichedMntners) {
                                $scope.restCallInProgress = false;

                                $scope.maintainers.object = enrichedMntners;
                                $log.debug('maintainers.object:' + JSON.stringify($scope.maintainers.object ));

                                _use_dryrun_delete_to_detect_auth_candidates();

                            },
                            function (error) {
                                $scope.restCallInProgress = false;
                                $log.error('Error fetching mntner details' + JSON.stringify(error));
                                AlertService.setGlobalError('Error fetching maintainer details');
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
                            AlertService.setGlobalError('Error fetching maintainers to reclaim this object');
                        }
                    }
                );
            }

            function _use_dryrun_delete_to_detect_auth_candidates() {
                $scope.restCallInProgress = true;
                RestService.deleteObject($scope.object.source, $scope.object.type, $scope.object.name, 'dry-run', false,  [], true).then(
                    function(resp) {
                        $scope.restCallInProgress = false;
                        $log.debug('auth can be performed without interactive popup');
                    },
                    function(error) {
                        $scope.restCallInProgress = false;
                        var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                        if( whoisResources.getRequiresAdminRightFromError()) {
                            AlertService.setGlobalError('Deleting this object requires administrative authorisation');
                        } else {
                            var authCandidates = _.filter(whoisResources.getAuthenticationCandidatesFromError(), function (mntner) {
                                return !mntner.startsWith('RIPE-NCC-');
                            });
                            $log.debug('auth candidates:' + authCandidates);
                            // TODO: this should return the same thing as our reclaim service
                            if( authCandidates.length != $scope.maintainers.object.length) {
                                $log.error("Different mechanisms deliver different results:");
                                $log.error("Via service:" + $scope.maintainers.object);
                                $log.error("Via dry-run-delete error:" + authCandidates);
                            }
                        }
                    }
                );
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

            function reclaim () {
                if (_isFormValid()){
                    if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, [], $scope.maintainers.object)) {
                        $log.debug("Need auth");
                        _performAuthentication();
                    } else {
                        $log.debug("No auth needed");
                        _onSuccessfulAuthentication();
                    }
                }
            }

            function _performAuthentication() {
               WebUpdatesCommons.performAuthentication(
                    $scope.maintainers,
                    'Reclaim',
                    $scope.object.source,
                    $scope.object.type,
                    $scope.object.name,
                    _onSuccessfulAuthentication,
                    cancel)
            }

            function _onSuccessfulAuthentication() {
                $log.debug("Nav to delete screen");
                WebUpdatesCommons.navigateToDelete($scope.object.source, $scope.object.type, $scope.object.name, STATE.RECLAIM);
            }

        }]);
