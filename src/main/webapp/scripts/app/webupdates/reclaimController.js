/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimController', [
                '$scope', '$stateParams', '$state', '$log', '$window', 'WhoisResources', 'WebUpdatesCommons',
                'CredentialsService', 'RestService', '$q', 'ModalService', 'MntnerService', 'AlertService', 'STATE',
        function ($scope, $stateParams, $state, $log, $window, WhoisResources, WebUpdatesCommons,
                CredentialsService, RestService, $q, ModalService, MntnerService, AlertService, STATE) {

            /////////////Maintainer stuff begin
            $scope.onMntnerAdded = onMntnerAddedReclaim;
            $scope.onMntnerRemoved = onMntnerRemovedReclaim;

            $scope.isMine = MntnerService.isMine;
            $scope.hasSSo = MntnerService.hasSSo;
            $scope.hasPgp = MntnerService.hasPgp;
            $scope.hasMd5 = MntnerService.hasMd5;
            $scope.isNew = MntnerService.isNew;

            $scope.needToLockLastMntner = needToLockLastMntner;
            $scope.mntnerAutocomplete = mntnerAutocomplete;
            $scope.hasMntners = hasMntners;
            /////////////Maintainer stuff end

            $scope.reclaim = reclaim;
            $scope.isFormValid = _isFormValid;

            _initialisePage();

            function _initialisePage() {

                $scope.restCallInProgress = false;

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.objectType = $stateParams.objectType;

                if( !_.isUndefined($stateParams.name)) {
                    $scope.objectName = decodeURIComponent($stateParams.name);
                }
                $log.debug('Url params: source:' + $scope.objectSource + '. type:' + $scope.objectType + ', uid:' + $scope.objectName);

                $scope.mntbyDescription = MntnerService.mntbyDescription;
                $scope.mntbySyntax = MntnerService.mntbySyntax;
                $scope.attributes = [];

                // workaround for problem with order of loading ui-select fragments
                $scope.uiSelectTemplateReady = false;
                RestService.fetchUiSelectResources().then(
                    function () {
                        $scope.uiSelectTemplateReady = true;
                    });

                $scope.maintainers = {
                    sso: [],
                    objectOriginal: [],
                    object: [],
                    alternatives: []
                };

                _validateParamsAndShowErrors();

                if (_isFormValid()){
                    _fetchDataForReclaim();
                }
            }

            function _isFormValid() {
                return ! AlertService.hasErrors();
            }

            function _validateParamsAndShowErrors(){
                var reclaimableObjectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

                if (! _.contains(reclaimableObjectTypes, $scope.objectType)){

                    var typesString = _.reduce(reclaimableObjectTypes, function(str, n) {
                        return str + ', ' + n;
                    });

                    AlertService.setGlobalError('Only ' + typesString + ' object types are reclaimable');
                }

                if (_.isUndefined($scope.objectSource)){
                    AlertService.setGlobalError('Source is missing');
                }

                if (_.isUndefined($scope.objectName)){
                    AlertService.setGlobalError('Object key is missing');
                }
            }

            function reclaim () {
                if (_isFormValid()){
                    $state.transitionTo('delete', {
                        source: $scope.objectSource,
                        objectType: $scope.objectType,
                        name: $scope.objectName,
                        onCancel: STATE.RECLAIM
                    });
                }
            }

            function _fetchDataForReclaim() {

                var password = null;
                if (CredentialsService.hasCredentials()) {
                    password = CredentialsService.getCredentials().successfulPassword;
                }
                // wait until both have completed
                $scope.restCallInProgress = true;
                $q.all({
                    mntners: RestService.fetchMntnersForSSOAccount(),
                    objectToModify: RestService.fetchObject($scope.objectSource, $scope.objectType, $scope.objectName, password)
                }).then(
                    function (results) {
                        $scope.restCallInProgress = false;

                        $log.debug('object to modify:' + JSON.stringify(results.objectToModify));

                        // store mntners for SSO account
                        $scope.maintainers.sso = results.mntners;
                        $log.debug('maintainers.sso:' + JSON.stringify($scope.maintainers.sso));

                        // store object to modify
                        _wrapAndEnrichResources($scope.objectType, results.objectToModify);

                        //BUG: wrapAndEnrichResources strips attributes from 'link', so next line does not have effect.
                        WebUpdatesCommons.addLinkToReferenceAttributes($scope.attributes, $scope.objectSource);

                        $scope.maintainers.objectOriginal = [];
                        $scope.maintainers.object = _.cloneDeep($scope.maintainers.sso);

                        // fetch details of all selected maintainers concurrently
                        $scope.restCallInProgress = true;
                        RestService.detailsForMntners($scope.maintainers.object).then(
                            function (result) {
                                $scope.restCallInProgress = false;

                                $scope.maintainers.object = MntnerService.enrichWithNewStatus($scope.maintainers.objectOriginal, _.flatten(result));
                                $log.debug('mntners-object:' + JSON.stringify($scope.maintainers.object));

                            }, function (error) {
                                $scope.restCallInProgress = false;
                                $log.error('Error fetching sso-mntners details' + JSON.stringify(error));
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
                            $log.error('Error fetching sso-mntners for SSO:' + JSON.stringify(error));
                            AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        }
                    }
                );
            }

            function hasMntners() {
                return $scope.maintainers.object.length > 0;
            }

            function onMntnerAddedReclaim(item) {

                // enrich with new-flag
                $scope.maintainers.object = MntnerService.enrichWithNewStatus($scope.maintainers.objectOriginal, $scope.maintainers.object);

                if (needsPasswordAuthenticationForReclaim($scope.maintainers.object)) {
                    WebUpdatesCommons.performAuthentication($scope.maintainers, $scope.objectSource, _onSuccessfulAuthentication, _navigateToReclaim);
                    return;
                }

                $log.debug('onMntnerAdded:' + JSON.stringify(item) + ' object mntners now:' + JSON.stringify($scope.maintainers.object));
                $log.debug('onMntnerAdded: attributes' + JSON.stringify($scope.attributes));
            }

            function _onSuccessfulAuthentication(maintainers){
                $scope.maintainers = maintainers;
            }

            function onMntnerRemovedReclaim(item) {
                //DO NOTHING
            }

            function needToLockLastMntner() {
                if ($scope.name && $scope.maintainers.object.length === 1) {
                    // only lock last for modify
                    return true;
                }
                return false;
            }

            function mntnerAutocomplete(query) {
                // need to typed characters
                RestService.autocomplete('mnt-by', query, true, ['auth']).then(
                    function (data) {
                        // mark new
                        $scope.maintainers.alternatives = MntnerService.enrichWithNewStatus($scope.maintainers.objectOriginal,
                            _filterMntners(MntnerService.enrichWithMine($scope.maintainers.sso, data)));
                    }
                );
            }

            function _wrapAndEnrichResources(objectType, resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes(objectType, whoisResources.getAttributes());
                }
                return whoisResources;
            }

            function _filterMntners(mntners) {
                return _.filter(mntners, function (mntner) {
                    // prevent that RIPE-NCC-RPSL-MNT can be added to an object upon create of modify
                    // prevent same mntner to be added multiple times
                    return ! MntnerService.isRpslMntner(mntner) && ! MntnerService.isMntnerOnlist($scope.maintainers.object, mntner);
                });
            }

            function needsPasswordAuthenticationForReclaim(objectMaintainers){
                return MntnerService.needsPasswordAuthentication([], [], objectMaintainers);
            }

            function _navigateToReclaim() {
                $state.transitionTo('reclaim', {
                    source: $scope.objectSource,
                    objectType: $scope.objectType,
                    name: $scope.objectName
                });
            }
        }]);
