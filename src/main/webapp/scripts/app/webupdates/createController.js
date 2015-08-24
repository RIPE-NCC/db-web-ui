/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('CreateController', ['$scope', '$stateParams', '$state', '$log', 'WhoisResources', 'MessageStore', 'CredentialsService','RestService', '$q', 'ModalService', 'MntnerService', 'AlertService',
        function ($scope, $stateParams, $state, $log, WhoisResources, MessageStore, CredentialsService, RestService, $q, ModalService, MntnerService, AlertService) {

            // exposed methods called from html fragment
            $scope.onMntnerAdded = onMntnerAdded;
            $scope.onMntnerRemoved = onMntnerRemoved;

            $scope.isMine = isMine;
            $scope.hasSSo = hasSSo;
            $scope.hasPgp = hasPgp;
            $scope.hasMd5 = hasMd5;
            $scope.isNew = isNew;
            $scope.needToLockLastMntner = needToLockLastMntner;

            $scope.mntnerAutocomplete = mntnerAutocomplete;
            $scope.referenceAutocomplete = referenceAutocomplete;

            $scope.hasMntners = hasMntners;
            $scope.canAttributeBeDuplicated = canAttributeBeDuplicated;
            $scope.duplicateAttribute = duplicateAttribute;
            $scope.canAttributeBeRemoved = canAttributeBeRemoved;
            $scope.removeAttribute = removeAttribute;

            $scope.displayAddAttributeDialog = displayAddAttributeDialog;
            $scope.addSelectedAttribute = addSelectedAttribute;

            $scope.displayMd5DialogDialog = displayMd5DialogDialog;

            $scope.deleteObject = deleteObject;

            $scope.submit = submit;
            $scope.cancel = cancel;

            _initialisePage();

            function _initialisePage() {

                AlertService.clearErrors();

                // workaround for problem with order of loading ui-select fragments
                $scope.uiSelectTemplateReady = false;
                RestService.fetchUiSelectResources().then(function () {
                    $scope.uiSelectTemplateReady = true;
                });

                // extract parameters from the url
                $scope.source = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.name = $stateParams.name;

                // initialize data
                $scope.maintainers = {
                    sso: [],
                    objectOriginal:[],
                    object: [],
                    alternatives: [],
                };

                $scope.attributes = [];

                $scope.mntbyDescription = WhoisResources.getAttributeDocumentation($scope.objectType, 'mnt-by');
                $scope.mntbySyntax =      WhoisResources.getAttributeSyntax($scope.objectType, 'mnt-by');

                $scope.CREATE_OPERATION = 'Create';
                $scope.MODIFY_OPERATION = 'Modify';

                // Determine if this is a create or a modify
                if (!$scope.name) {
                    $scope.operation = $scope.CREATE_OPERATION;

                    // Populate empty attributes based on meta-info
                    var mandatoryAttributesOnObjectType = WhoisResources.getMandatoryAttributesOnObjectType($scope.objectType);
                    if(_.isEmpty(mandatoryAttributesOnObjectType)) {
                        $state.transitionTo('notFound');
                        return;
                    }

                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, mandatoryAttributesOnObjectType);
                    $scope.attributes.setSingleAttributeOnName('source', $scope.source);
                    $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                    $scope.attributes.setSingleAttributeOnName('key-cert', 'AUTO-1');

                    _fetchDataForCreate();

                } else {
                    $scope.operation = $scope.MODIFY_OPERATION;

                    // Start empty, and populate with rest-result
                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType,[]);

                    _fetchDataForModify();
                }
            }

            /*
             * Methods called from the html-teplate
             */

            function onMntnerAdded(item)   {

                // enrich with new-flag
                $scope.maintainers.object = MntnerService.enrichWithNewStatus($scope.maintainers.objectOriginal, $scope.maintainers.object);

                // adjust attributes
                _copyAddedMntnerToAttributes(item.key);

                if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                    _performAuthentication();
                    return;
                }

                $log.debug('onMntnerAdded:'  + JSON.stringify(item) + ' object mntners now:' + JSON.stringify($scope.maintainers.object));
                $log.debug('onMntnerAdded: attributes' + JSON.stringify($scope.attributes));
            }

            function onMntnerRemoved(item) {

                if ($scope.maintainers.object.length === 0) {
                    // make sure we do not remove the last mntner which act as anchor
                    _keepSingleMntnerInAttrsWithoutValue();
                } else {
                    // remove it from the attributes right away
                    _removeMntnerFromAttrs(item);
                }

                $log.debug('onMntnerRemoved: ' + JSON.stringify(item) + ' object mntners now:' +  JSON.stringify($scope.maintainers.object));
                $log.debug('onMntnerRemoved: attributes' + JSON.stringify($scope.attributes));
            }

            function isMine(mntner) {
                if (!mntner.mine) {
                    return false;
                } else {
                    return mntner.mine;
                }
            }

            function hasSSo(mntner) {
                if(_.isUndefined(mntner.auth)) {
                    return false;
                }
                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'SSO');
                });
            }

            function hasPgp(mntner) {
                if(_.isUndefined(mntner.auth)) {
                    return false;
                }
                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'PGP');
                });
            }

            function hasMd5(mntner) {
                if(_.isUndefined(mntner.auth)) {
                    return false;
                }

                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'MD5');
                });
            }

            function isNew(mntner) {
                if(_.isUndefined(mntner.isNew)) {
                    return false;
                }
                return mntner.isNew;
            }

            function needToLockLastMntner() {
                if( $scope.name && $scope.maintainers.object.length === 1 ) {
                    // only lock last for modify
                    return true;
                }
                return false;
            }

            function mntnerAutocomplete(query) {
                // need to typed characters
                if (query.length >= 2) {
                    RestService.autocomplete( 'mnt-by', query, true, ['auth']).then(
                        function (data) {
                            // mark new
                            $scope.maintainers.alternatives = MntnerService.enrichWithNewStatus($scope.maintainers.objectOriginal,
                                // prevent mntners on selected list to appear
                                    _stripAlreadySelected(_enrichWithMine(data)));
                        }
                    );
                }
            }

            function referenceAutocomplete(attrType, query, refs) {
                if (!refs || refs.length === 0) {
                    // No suggestions since not a reference
                    return [];
                } else {
                    return RestService.autocomplete(attrType, query, false, []).then(
                        function (resp) {
                            return resp;
                        }, function () {
                            return [];
                        });
                }
            }

            function hasMntners() {
                return $scope.maintainers.object.length > 0;
            }

            function canAttributeBeDuplicated(attr) {
                return $scope.attributes.canAttributeBeDuplicated(attr);
            }

            function duplicateAttribute(attr) {
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.duplicateAttribute(attr));
                $log.debug('duplicateAttribute: attributes' + JSON.stringify($scope.attributes));
            }

            function canAttributeBeRemoved(attr) {
                return $scope.attributes.canAttributeBeRemoved(attr);
            }

            function removeAttribute(attr) {
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.removeAttribute(attr));
                $log.debug('removeAttribute: attributes' + JSON.stringify($scope.attributes));
            }

            function displayAddAttributeDialog(attr) {
                ModalService.openAddAttributeModal(WhoisResources.getAddableAttributes($scope.objectType))
                    .then(function (selectedItem) { addSelectedAttribute(selectedItem, attr); });
            }

            function addSelectedAttribute(selectedAttributeType, attr) {
                var attrs = $scope.attributes.addAttributeAfter(selectedAttributeType, attr);
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, attrs);
            }

            function displayMd5DialogDialog(attr) {
                ModalService.openMd5Modal( ).then(
                    function(authLine) {
                        attr.value = authLine;
                    }
                );
            }

            function deleteObject() {
                ModalService.openDeleteObjectModal($scope.source, $scope.objectType, $scope.name).then(
                    function() {},
                    function(errorResp) {
                        try {
                            var whoisResources = _wrapAndEnrichResources(errorResp);
                            AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, errorResp);
                            AlertService.setErrors(whoisResources);
                        }
                        catch(err) {
                            AlertService.setGlobalError('Error deleting object. Please reload and try again.');
                        }
                    }
                );
            }

            function submit() {

                function _onSubmitSuccess(resp) {
                    var whoisResources = WhoisResources.wrapWhoisResources(resp);
                    // stick created object in temporary store, so display-screen can fetch it from here
                    MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);

                    // make transition to next display screen
                    _navigateToDisplayPage($scope.source, $scope.objectType,  whoisResources.getPrimaryKey(),  $scope.operation);
                }

                function _onSubmitError(resp) {
                    if (!resp.data) {
                        // TIMEOUT: to be handled globally by response interceptor
                    } else {
                        var whoisResources = _wrapAndEnrichResources(resp.data);
                        _validateForm();
                        AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, resp.data);
                        AlertService.setErrors(whoisResources);
                    }
                }

                if (_validateForm()) {
                    _stripNulls();
                    AlertService.clearErrors();

                    if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                        _performAuthentication();
                        return;
                    }

                    var password;
                    if( CredentialsService.hasCredentials() ) {
                        password = CredentialsService.getCredentials().successfulPassword;
                    }

                    if (!$scope.name) {

                        RestService.createObject($scope.source, $scope.objectType,
                            WhoisResources.turnAttrsIntoWhoisObject($scope.attributes), password).then(
                            _onSubmitSuccess,
                            _onSubmitError);

                    } else {
                        RestService.modifyObject($scope.source, $scope.objectType, $scope.name,
                            WhoisResources.turnAttrsIntoWhoisObject($scope.attributes), password).then(
                            _onSubmitSuccess,
                            _onSubmitError);
                    }
                }
            }

            function cancel() {
                if ( window.confirm('Are you sure?') ) {
                    window.history.back();
                }
            }

            /*
             * private methods
             */

            function _fetchDataForCreate() {
                RestService.fetchMntnersForSSOAccount().then(
                    function(results) {
                        $scope.maintainers.sso = results;
                        if ($scope.maintainers.sso.length > 0) {

                            $scope.maintainers.objectOriginal = [];
                            // pupulate ui-select box with sso-mntners
                            $scope.maintainers.object = _.cloneDeep($scope.maintainers.sso);

                            // copy mntners to attributes (for later submit)
                            var mntnerAttrs = _.map($scope.maintainers.sso, function (i) {
                                return {name: 'mnt-by', value: i.key};
                            });
                            $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.addAttrsSorted('mnt-by', mntnerAttrs));

                            $log.info('mntners-sso:'+ JSON.stringify($scope.maintainers.sso));
                            $log.info('mntners-object-original:'+ JSON.stringify($scope.maintainers.objectOriginal));
                            $log.info('mntners-object:'+ JSON.stringify($scope.maintainers.object));

                        }
                    }, function(error) {
                        $log.error('Error fetching mntners for SSO:' + JSON.stringify(error));
                        AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                    }
                );
            }

            function _fetchDataForModify() {

                var password = null;
                if( CredentialsService.hasCredentials()) {
                    password = CredentialsService.getCredentials().successfulPassword;
                }
                // wait untill both have completed
                $q.all( { mntners:        RestService.fetchMntnersForSSOAccount(),
                          objectToModify: RestService.fetchObject($scope.source, $scope.objectType, $scope.name, password)}).then(
                    function (results) {

                        $log.info('object to modify:'+ JSON.stringify(results.objectToModify));

                        // store mntners for SSO account
                        $scope.maintainers.sso = results.mntners;
                        $log.info('maintainers.sso:'+ JSON.stringify($scope.maintainers.sso));

                        // store object to modify
                        _wrapAndEnrichResources(results.objectToModify);

                        // this is where we must authenticate against
                        $scope.maintainers.objectOriginal = _extractEnrichMntnersFromObject($scope.attributes);

                        // starting point for further editing
                        $scope.maintainers.object = _extractEnrichMntnersFromObject($scope.attributes);

                        // save object for later diff in display-screen
                        MessageStore.add('DIFF', _.cloneDeep($scope.attributes));

                        // fetch details of all selected maintainers concurrently
                        RestService.detailsForMntners($scope.maintainers.object).then(
                            function( result ) {
                                // result returns an array for each mntner

                                $scope.maintainers.objectOriginal = _.flatten(result);
                                $log.info('mntners-object-original:'+ JSON.stringify($scope.maintainers.objectOriginal));

                                // of course none of the initial ones are new
                                $scope.maintainers.object = MntnerService.enrichWithNewStatus($scope.maintainers.objectOriginal, _.flatten(result));
                                $log.info('mntners-object:'+ JSON.stringify($scope.maintainers.object));

                                if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                                    _performAuthentication();
                                    return;
                                }
                            }, function(error) {
                                $log.error('Error fetching sso-mntners details' + JSON.stringify(error));
                                AlertService.setGlobalError('Error fetching maintainer details');
                            });
                    }
                ).catch(
                    function (error) {
                        if( error && error.data) {
                            $log.error('Error fetching object:' + JSON.stringify(error));
                            var whoisResources = _wrapAndEnrichResources(error.data);
                            AlertService.setErrors(whoisResources);
                        } else {
                            $log.error('Error fetching sso-mntners for SSO:' + JSON.stringify(error));
                            AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        }
                    }
                );
            }

            function _copyAddedMntnerToAttributes(mntnerName) {
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.addAttrsSorted('mnt-by', [
                    { name: 'mnt-by', value: mntnerName}
                ]));
            }

            function _keepSingleMntnerInAttrsWithoutValue() {
                // make sure we do not remove the last mntner which act as anchor
                _.map($scope.attributes, function (attr) {
                    if (attr.name === 'mnt-by') {
                        attr.value = null;
                        return attr;
                    }
                    return attr;
                });
            }

            function _removeMntnerFromAttrs(item) {
                _.remove($scope.attributes, function (i) {
                    return i.name === 'mnt-by' && i.value === item.key;
                });
            }

            function _extractEnrichMntnersFromObject(attributes) {
                // get mntners from response
                var mntnersInObject = _.filter(attributes, function (i) {
                    return i.name === 'mnt-by';
                });

                // determine if mntner is mine
                var selected = _.map(mntnersInObject, function(mntnerAttr) {
                    return {
                        type:'mntner',
                        key: mntnerAttr.value,
                        mine: _.contains(_.map($scope.maintainers.sso, 'key'), mntnerAttr.value)
                    };
                });

                return selected;
            }

            function _isMntnerOnlist(selectedMntners, mntner) {
                var status = _.any(selectedMntners, function (m) {
                    return m.key === mntner.key;
                });
                return status;
            }

            function _stripAlreadySelected(mntners) {
                return _.filter(mntners, function (mntner) {
                    return !_isMntnerOnlist($scope.maintainers.object, mntner);
                });
            }

            function _validateForm() {
                return $scope.attributes.validate();
            }

            function _stripNulls() {
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.removeNullAttributes());
            }

            function _wrapAndEnrichResources(resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, whoisResources.getAttributes());
                }
                return whoisResources;
            }

            function _enrichWithMine(mntners) {
                return  _.map(mntners, function(mntner) {
                    // search in selected list
                    if(_isMntnerOnlist($scope.maintainers.sso, mntner)) {
                        mntner.mine = true;
                    } else {
                        mntner.mine = false;

                    }
                    return mntner;
                });
            }

            function _refreshObjectIfNeeded(associationResp) {
                if( $scope.operation === 'Modify' && $scope.objectType === 'mntner') {
                    if( associationResp ) {
                        _wrapAndEnrichResources(associationResp);
                    } else {
                        var password = null;
                        if (CredentialsService.hasCredentials()) {
                            password = CredentialsService.getCredentials().successfulPassword;
                        }
                        RestService.fetchObject($scope.source, $scope.objectType, $scope.name, password).then(
                            function (result) {
                                _wrapAndEnrichResources(result);

                                // save object for later diff in display-screen
                                MessageStore.add('DIFF', _.cloneDeep($scope.attributes));

                                $log.info('sso-mntners:' + JSON.stringify($scope.maintainers.sso));
                                $log.info('objectMaintainers:' + JSON.stringify($scope.maintainers.object));

                            }
                        );
                    }
                    $scope.maintainers.objectOriginal = _extractEnrichMntnersFromObject($scope.attributes);
                    $scope.maintainers.object = _extractEnrichMntnersFromObject($scope.attributes);

                }
            }

            function _navigateAway() {
                if( $scope.operation === 'Modify') {
                    _navigateToDisplayPage($scope.source, $scope.objectType, $scope.name, undefined);
                } else {
                    $state.transitionTo('select');
                }
            }

            function _navigateToDisplayPage(source, objectType, objectName, operation) {
                $state.transitionTo('display', {
                    source: source,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            }

            function _performAuthentication() {
                $log.info('Perform authentication');
                var mntnersWithPasswords = MntnerService.getMntnersForPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal,$scope.maintainers.object);
                if( mntnersWithPasswords.length === 0 ) {
                    AlertService.setGlobalError('You cannot modify this object through web updates because your SSO account is not associated with any of the maintainers on this object, and none of the maintainers have password');
                } else {

                    ModalService.openAuthenticationModal($scope.source, mntnersWithPasswords).then(
                        function (result) {
                            AlertService.clearErrors();

                            var selectedMntner = result.selectedItem;
                            $log.info('selected mntner:' + JSON.stringify(selectedMntner));
                            var associationResp = result.response;

                            if ($scope.isMine(selectedMntner)) {
                                // has been successfully associated in authentication modal

                                $scope.maintainers.sso.push(selectedMntner);
                                // mark starred in selected
                                $scope.maintainers.object = _enrichWithMine($scope.maintainers.object);
                            }
                            $log.info('After auth: maintainers.sso:' + JSON.stringify($scope.maintainers.sso));
                            $log.info('After auth: maintainers.object:' + JSON.stringify($scope.maintainers.object));

                            if( associationResp ) {
                                // use response from successfull association
                                _wrapAndEnrichResources(associationResp);
                            }
                            _refreshObjectIfNeeded(associationResp);

                        }, function () {
                            _navigateAway();
                        }
                    );
                }
            }

        }]);