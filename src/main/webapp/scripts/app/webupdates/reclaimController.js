/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimController', [
                '$scope', '$stateParams', '$state', '$log', '$window', 'WhoisResources', 'WebUpdatesCommons',
                'CredentialsService', 'RestService', '$q', 'ModalService', 'MntnerService', 'AlertService', 'STATE',
        function ($scope, $stateParams, $state, $log, $window, WhoisResources, WebUpdatesCommons,
                CredentialsService, RestService, $q, ModalService, MntnerService, AlertService, STATE) {


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
                    objectOriginal:[],
                    selected: undefined
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
                return !_.isUndefined($scope.maintainers.selected);
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

                // wait until both have completed
                $scope.restCallInProgress = true;
                $q.all({
                    objectToModify: RestService.fetchObject($scope.object.source, $scope.object.type, $scope.object.name),
                    ssoMntners: RestService.fetchMntnersForSSOAccount(),
                    objectMntners: RestService.getMntnersToReclaim($scope.object.source, $scope.object.type, $scope.object.name)
                }).then(
                    function (results) {
                        $scope.restCallInProgress = false;

                        // store object to modify
                        $log.debug('object to modify:' + JSON.stringify(results.objectToModify));
                        _wrapAndEnrichResources($scope.object.type, results.objectToModify);

                        // store mntners for SSO account
                        $scope.maintainers.sso = results.ssoMntners;
                        $log.debug('ssoMntners:' + JSON.stringify($scope.maintainers.sso));

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

                                $scope.maintainers.object = MntnerService.getMntnersForPasswordAuthentication($scope.maintainers.sso, enrichedMntners, []);
                                if( results.objectMntners.length === 0 ) {
                                    AlertService.setGlobalError('No mntners with password found to reclaim this object');
                                    return;
                                }
                                $scope.maintainers.selected = $scope.maintainers.object[0];

                            }, function (error) {
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
                    // TODO: check if authentication dialog is needefd
                    if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, [], $scope.maintainers.object)) {
                        _performAuthentication();
                        return;
                    }

                }
            }

            function _performAuthentication() {
                WebUpdatesCommons.performAuthentication(
                    $scope.maintainers,
                    $scope.object.source,
                    $scope.object.type,
                    $scope.object.name,
                    _onSuccessfulAuthentication,
                    cancel)
            }

            function _onSuccessfulAuthentication() {
                WebUpdatesCommons.navigateToDelete($scope.object.source, $scope.object.type, $scope.object.name, STATE.RECLAIM);
            }

            function _navigateToReclaim() {
                $state.transitionTo(STATE.RECLAIM, {
                    source: $scope.objectSource,
                    objectType: $scope.objectType,
                    name: $scope.objectName
                });
            }

        }]);
