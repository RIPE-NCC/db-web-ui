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

            $scope.isMine = isMine;
            $scope.hasSSo = hasSSo;
            $scope.hasPgp = hasPgp;
            $scope.hasMd5 = hasMd5;
            $scope.isNew = isNew;
            $scope.needToLockLastMntner = needToLockLastMntner;

            $scope.mntnerAutocomplete = mntnerAutocomplete;

            $scope.hasMntners = hasMntners;
            /////////////Maintainer stuff end


            $scope.reclaim = reclaim;
            $scope.isFormValid = _isFormValid;

            var reclaimableObjectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

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

                _validateParams();

                /////////////Maintainer stuff begin
                // workaround for problem with order of loading ui-select fragments
                $scope.uiSelectTemplateReady = false;
                RestService.fetchUiSelectResources().then(
                    function () {
                        $scope.uiSelectTemplateReady = true;
                    });

                // initialize data
                $scope.maintainers = {
                    sso: [],
                    objectOriginal: [],
                    object: [],
                    alternatives: []
                };

                $scope.attributes = [];
                $scope.mntbyDescription = WhoisResources.getAttributeDescription($scope.objectType, 'mnt-by');
                $scope.mntbySyntax = WhoisResources.getAttributeSyntax($scope.objectType, 'mnt-by');

                /////////////Maintainer stuff end

                if (_isFormValid()){
                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, []);

                    _fetchDataForReclaim();
                }
            }

            function _isFormValid() {
                return ! AlertService.hasErrors();
            }

            function _validateParams(){
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


            /////////////Maintainer stuff begin

            function _fetchDataForReclaim() {

                var password = null;
                if (CredentialsService.hasCredentials()) {
                    password = CredentialsService.getCredentials().successfulPassword;
                }
                // wait untill both have completed
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
                        _wrapAndEnrichResources($scope.objectType,results.objectToModify);
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

                if (MntnerService.needsPasswordAuthentication([], $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                    _performAuthenticationReclaim();
                    return;
                }

                $log.debug('onMntnerAdded:' + JSON.stringify(item) + ' object mntners now:' + JSON.stringify($scope.maintainers.object));
                $log.debug('onMntnerAdded: attributes' + JSON.stringify($scope.attributes));
            }

            function onMntnerRemovedReclaim(item) {
                //DO NOTHING
            }

            function isMine(mntner) {
                if (!mntner.mine) {
                    return false;
                } else {
                    return mntner.mine;
                }
            }

            function hasSSo(mntner) {
                if (_.isUndefined(mntner.auth)) {
                    return false;
                }
                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'SSO');
                });
            }

            function hasPgp(mntner) {
                if (_.isUndefined(mntner.auth)) {
                    return false;
                }
                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'PGP');
                });
            }

            function hasMd5(mntner) {
                if (_.isUndefined(mntner.auth)) {
                    return false;
                }

                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'MD5');
                });
            }

            function isNew(mntner) {
                if (_.isUndefined(mntner.isNew)) {
                    return false;
                }
                return mntner.isNew;
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
                            _filterMntners(_enrichWithMine(data)));
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

            function _isMntnerOnlist(selectedMntners, mntner) {
                var status = _.any(selectedMntners, function (m) {
                    return m.key === mntner.key;
                });
                return status;
            }

            function _isRpslMntner(mntner) {
                return mntner.key === 'RIPE-NCC-RPSL-MNT';
            }

            function _filterMntners(mntners) {
                return _.filter(mntners, function (mntner) {
                    // prevent that RIPE-NCC-RPSL-MNT can be added to an object upon create of modify
                    // prevent same mntner to be added multiple times
                    return !_isRpslMntner(mntner) && !_isMntnerOnlist($scope.maintainers.object, mntner);
                });
            }

            function _enrichWithMine(mntners) {
                return _.map(mntners, function (mntner) {
                    // search in selected list
                    if (_isMntnerOnlist($scope.maintainers.sso, mntner)) {
                        mntner.mine = true;
                    } else {
                        mntner.mine = false;

                    }
                    return mntner;
                });
            }

            function _performAuthenticationReclaim() {
                $log.debug('Perform authentication');
                var mntnersWithPasswords = MntnerService.getMntnersForPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object);
                if (mntnersWithPasswords.length === 0) {
                    AlertService.setGlobalError('You cannot modify this object through web updates because your SSO account is not associated with any of the maintainers on this object, and none of the maintainers have password');
                } else {

                    ModalService.openAuthenticationModal($scope.objectSource, mntnersWithPasswords).then(
                        function (result) {
                            AlertService.clearErrors();

                            var selectedMntner = result.selectedItem;
                            $log.debug('selected mntner:' + JSON.stringify(selectedMntner));
                            var associationResp = result.response;
                            $log.debug('associationResp:' + JSON.stringify(associationResp));

                            if ($scope.isMine(selectedMntner)) {
                                // has been successfully associated in authentication modal

                                $scope.maintainers.sso.push(selectedMntner);
                                // mark starred in selected
                                $scope.maintainers.object = _enrichWithMine($scope.maintainers.object);
                            }
                            $log.debug('After auth: maintainers.sso:' + JSON.stringify($scope.maintainers.sso));
                            $log.debug('After auth: maintainers.object:' + JSON.stringify($scope.maintainers.object));

                            //_refreshObjectIfNeeded(associationResp);

                        }, function () {
                            _navigateAway();
                        }
                    );
                }
            }

            function _navigateAway() {
                $state.transitionTo('reclaim', {
                    source: $scope.selected.source,
                    objectType: $scope.selected.objectType,
                    name: $scope.selected.name
                });
            }
            /////////////Maintainer stuff end
        }]);
