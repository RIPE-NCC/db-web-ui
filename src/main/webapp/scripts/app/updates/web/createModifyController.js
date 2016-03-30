/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('CreateModifyController', ['$scope', '$stateParams', '$state', '$log', '$window', '$q', '$sce',
                'WhoisResources', 'MessageStore', 'CredentialsService', 'RestService',  'ModalService',
                'MntnerService', 'AlertService', 'ErrorReporterService', 'LinkService',

                'WebUpdatesCommons', 'OrganisationHelper', 'STATE', 'PreferenceService', 'EnumService', 'CharsetTools', 'ScreenLogicInterceptor',
        function ($scope, $stateParams, $state, $log, $window, $q, $sce,
                  WhoisResources, MessageStore, CredentialsService, RestService, ModalService,
                  MntnerService, AlertService, ErrorReporterService, LinkService,
                  WebUpdatesCommons, OrganisationHelper, STATE, PreferenceService, EnumService, CharsetTools, ScreenLogicInterceptor) {

            // exposed methods called from html fragment
            $scope.switchToTextMode = switchToTextMode;
            $scope.onMntnerAdded = onMntnerAdded;
            $scope.onMntnerRemoved = onMntnerRemoved;

            $scope.isMine = MntnerService.isMine;
            $scope.isRemoveable = MntnerService.isRemoveable;
            $scope.hasSSo = MntnerService.hasSSo;
            $scope.hasPgp = MntnerService.hasPgp;
            $scope.hasMd5 = MntnerService.hasMd5;
            $scope.isNew = MntnerService.isNew;
            $scope.isModifyWithSingleMntnerRemaining = isModifyWithSingleMntnerRemaining;

            $scope.mntnerAutocomplete = mntnerAutocomplete;
            $scope.referenceAutocomplete = referenceAutocomplete;
            $scope.isEnum = isEnum;
            $scope.enumAutocomplete = enumAutocomplete;
            $scope.displayEnumValue = displayEnumValue;
            $scope.getAttributeShortDescription = getAttributeShortDescription;
            $scope.getAttributeDescription = getAttributeDescription;
            $scope.getAttributeSyntax = getAttributeSyntax;

            $scope.hasMntners = hasMntners;
            $scope.canAttributeBeDuplicated = canAttributeBeDuplicated;
            $scope.duplicateAttribute = duplicateAttribute;
            $scope.canAttributeBeRemoved = canAttributeBeRemoved;
            $scope.removeAttribute = removeAttribute;

            $scope.displayAddAttributeDialog = displayAddAttributeDialog;
            $scope.addSelectedAttribute = addSelectedAttribute;

            $scope.displayMd5DialogDialog = displayMd5DialogDialog;
            $scope.fieldVisited = fieldVisited;
            $scope.deleteObject = deleteObject;

            $scope.hasErrors = hasErrors;
            $scope.submit = submit;
            $scope.cancel = cancel;
            $scope.isFormValid = isFormValid;
            $scope.isToBeDisabled = isToBeDisabled;
            $scope.isBrowserAutoComplete = isBrowserAutoComplete;
            $scope.createRoleForAbuseCAttribute = createRoleForAbuseCAttribute;

            _initialisePage();

            function _initialisePage() {

                $scope.restCalInProgress = false;

                AlertService.clearErrors();

                // workaround for problem with order of loading ui-select fragments
                $scope.uiSelectTemplateReady = false;
                RestService.fetchUiSelectResources().then(
                    function () {
                        $scope.uiSelectTemplateReady = true;
                    });

                // extract parameters from the url
                $scope.source = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                if (!_.isUndefined($stateParams.name)) {
                    $scope.name = decodeURIComponent($stateParams.name);
                }
                var noRedirect = $stateParams.noRedirect;

                $log.debug('Url params: source:' + $scope.source +
                    '. type:' + $scope.objectType +
                    ', uid:' + $scope.name +
                    ', noRedirect:' + noRedirect);

                // switch to text-screen if cookie says so and cookie is not to be ignored
                if( PreferenceService.isTextMode() && ! noRedirect === true ) {
                    switchToTextMode();
                }

                // initialize data
                $scope.maintainers = {
                    sso: [],
                    objectOriginal: [],
                    object: [],
                    alternatives: []
                };

                $scope.attributes = [];

                $scope.mntbyDescription = MntnerService.mntbyDescription($scope.objectType);
                $scope.mntbySyntax = MntnerService.mntbySyntax($scope.objectType);

                $scope.CREATE_OPERATION = 'Create';
                $scope.MODIFY_OPERATION = 'Modify';
                $scope.PENDING_OPERATION = 'Pending';

                // Determine if this is a create or a modify
                if (!$scope.name) {
                    $scope.operation = $scope.CREATE_OPERATION;

                    // Populate empty attributes based on meta-info
                    var mandatoryAttributesOnObjectType = WhoisResources.getMandatoryAttributesOnObjectType($scope.objectType);
                    if (_.isEmpty(mandatoryAttributesOnObjectType)) {
                        $state.transitionTo('notFound');
                        return;
                    }

                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, mandatoryAttributesOnObjectType);
                    _fetchDataForCreate();

                } else {
                    $scope.operation = $scope.MODIFY_OPERATION;

                    // Start empty, and populate with rest-result
                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, []);

                    _fetchDataForModify();
                }
            }

            /*
             * Methods called from the html-teplate
             */

            function createRoleForAbuseCAttribute() {
                var maintainers = _.map($scope.maintainers.object, function(o) {
                    return {name: 'mnt-by', value: o.key};
                });
                var abuseAttr = $scope.attributes.getSingleAttributeOnName('abuse-c');
                abuseAttr.$$error = undefined;
                abuseAttr.$$success = undefined;
                ModalService.openCreateRoleForAbuseCAttribute($scope.source, maintainers, _getPasswordsForRestCall()).then(
                    function (roleAttrs) {
                        $scope.roleForAbuseC = WhoisResources.wrapAndEnrichAttributes('role', roleAttrs);
                        $scope.attributes.setSingleAttributeOnName('abuse-c', $scope.roleForAbuseC.getSingleAttributeOnName('nic-hdl').value);
                        abuseAttr.$$success = 'Role object for abuse-c successfully created';
                    }, function (error) {
                        if(error != "cancel") { //dismissing modal will hit this function with the string "cancel" in error arg
                            //TODO: pass more specific errors from REST? [RM]
                            abuseAttr.$$error = 'The role object for the abuse-c attribute was not created';
                        }
                    }
                );
            }

            function onMntnerAdded(item) {

                // enrich with new-flag
                $scope.maintainers.object = MntnerService.enrichWithNewStatus($scope.maintainers.objectOriginal, $scope.maintainers.object);

                // adjust attributes
                _copyAddedMntnerToAttributes(item.key);

                if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                    _performAuthentication();
                    return;
                }

                $log.debug('onMntnerAdded:' + JSON.stringify(item) + ' object mntners now:' + JSON.stringify($scope.maintainers.object));
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

                $log.debug('onMntnerRemoved: ' + JSON.stringify(item) + ' object mntners now:' + JSON.stringify($scope.maintainers.object));
                $log.debug('onMntnerRemoved: attributes' + JSON.stringify($scope.attributes));
            }

            function isModifyWithSingleMntnerRemaining() {
                if ($scope.operation === 'Modify' && $scope.maintainers.object.length === 1) {
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
                        $scope.maintainers.alternatives = MntnerService.stripNccMntners(MntnerService.enrichWithNewStatus($scope.maintainers.objectOriginal,
                            _filterAutocompleteMntners(_enrichWithMine(data))), true);
                    }
                );
            }

            function _addNiceAutocompleteName(items, attrName) {
                return _.map(items, function (item) {
                    var name = '';
                    var separator = ' / ';
                    if (item.person != null) {
                        name = item.person;
                    } else if (item.role != null) {
                        name = item.role;
                        if (attrName === 'abuse-c' && item['abuse-mailbox'] != null) {
                            name = name.concat( separator + item['abuse-mailbox']);
                        }
                    } else if (item['org-name'] != null) {
                        name = item['org-name'];
                    } else if (item['descr'] != null) {
                        name = item['descr'].join();
                    } else if (item['owner'] != null) {
                        name = item['owner'].join();
                    } else {
                        separator = '';
                    }

                    item.readableName = $sce.trustAsHtml(_escape(item.key + separator + name));
                    return item;
                });
            }

            function _escape(input) {
                return input.replace(/</g,'&lt;').replace(/>/g, '&gt;');
            }

            function enumAutocomplete(attribute) {
                if( !isEnum(attribute)) {
                    return [];
                }
                return EnumService.get($scope.objectType, attribute.name);
            }

            function displayEnumValue(item) {
                if ( item.key === item.value ) {
                    return item.key;
                }
                return item.value + ' [' + item.key.toUpperCase() + ']';
            }

            function _isServerLookupKey(refs) {
                return !(_.isUndefined(refs) || refs.length === 0 );
            }

            function referenceAutocomplete(attribute, userInput) {
                var attrName = attribute.name;
                var refs = attribute.$$meta.$$refs;

                var utf8Substituted = _warnForNonSubstitutableUtf8(attribute, userInput);
                if( utf8Substituted && _isServerLookupKey(refs)) {
                    return RestService.autocompleteAdvanced(userInput, refs).then(
                        function (resp) {
                            return _addNiceAutocompleteName(_filterBasedOnAttr(resp, attrName), attrName);
                        },
                        function () {
                            // autocomplete error
                            return [];
                        });
                } else {
                    // No suggestions since not a reference
                    return [];
                }
            }

            function _filterBasedOnAttr(suggestions, attrName) {
                return _.filter(suggestions, function(item) {
                    if (attrName === 'abuse-c') {
                        $log.debug("Filter out suggestions without abuse-mailbox");
                        return !_.isEmpty(item['abuse-mailbox']);
                    }
                    return true;
                });
            }

            function isEnum(attribute) {
                return attribute.$$meta.$$isEnum;
            }

            function isBrowserAutoComplete(attribute) {
                if (_isServerLookupKey(attribute.$$meta.$$refs) || isEnum(attribute)) {
                    return "off";
                } else {
                    return "on";
                }
            }

            function fieldVisited(attribute) {

                // replace utf-8 to become latin1
                if( !CharsetTools.isLatin1(attribute.value)) {
                    CharsetTools.replaceUtf8(attribute);
                    // clear attribute specific warning
                    attribute.$$error = '';
                }

                // Verify if primary-key not already in use
                if ($scope.operation === $scope.CREATE_OPERATION && attribute.$$meta.$$primaryKey === true) {
                    RestService.autocomplete( attribute.name, attribute.value, true, []).then(
                        function (data) {
                            if (_.any(data, function (item) {
                                    return _uniformed(item.type) === _uniformed(attribute.name)
                                        &&
                                        _uniformed(item.key) === _uniformed(attribute.value);
                                })) {
                                attribute.$$error = attribute.name + ' ' +
                                    LinkService.getModifyLink($scope.source, $scope.objectType, attribute.value) +
                                    ' already exists';
                            } else {
                                attribute.$$error = '';
                            }
                        },
                        function (error) {
                            $log.error('Autocomplete error ' + JSON.stringify(error));
                        }
                    );
                }
            }

            function _uniformed( input ) {
                if (_.isUndefined(input)) {
                    return input;
                }
                return _.trim(input).toUpperCase();
            }

            function hasMntners() {
                return $scope.maintainers.object.length > 0;
            }

            function canAttributeBeDuplicated(attr) {
                return $scope.attributes.canAttributeBeDuplicated(attr);
            }

            function duplicateAttribute(attr) {
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.duplicateAttribute(attr));
            }

            function canAttributeBeRemoved(attr) {
                return $scope.attributes.canAttributeBeRemoved(attr);
            }

            function removeAttribute(attr) {
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.removeAttribute(attr));
            }

            function displayAddAttributeDialog(attr) {
                var originalAddableAttributes = $scope.attributes.getAddableAttributes($scope.objectType, $scope.attributes);
                originalAddableAttributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, originalAddableAttributes);

                var addableAttributes = ScreenLogicInterceptor.beforeAddAttribute($scope.operation, $scope.source, $scope.objectType, $scope.attributes, originalAddableAttributes);

                ModalService.openAddAttributeModal(addableAttributes, _getPasswordsForRestCall())
                    .then(function (selectedItem) {
                        addSelectedAttribute(selectedItem, attr);
                    });
            }

            function addSelectedAttribute(selectedAttributeType, attr) {
                var attrs = $scope.attributes.addAttributeAfter(selectedAttributeType, attr);
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, attrs);
            }

            function displayMd5DialogDialog(attr) {
                ModalService.openMd5Modal().then(
                    function (authLine) {
                        attr.value = authLine;
                    }
                );
            }

            function isToBeDisabled(attribute) {

                if (attribute.$$meta.$$disable) {
                    return true;
                }

                if (attribute.name === 'created') {
                    return true;
                } else if ($scope.operation === 'Modify' && attribute.$$meta.$$primaryKey === true) {
                    return true;
                }
                return false;
            }

            function deleteObject() {
                WebUpdatesCommons.navigateToDelete($scope.source, $scope.objectType, $scope.name, STATE.MODIFY);
            }

            function submit() {

                function _onSubmitSuccess(resp) {
                    $scope.restCalInProgress = false;

                    var whoisResources = resp;

                    // Post-process attribute after submit-success using screen-logic-interceptor
                    if( _interceptOnSubmitSuccess( $scope.operation, resp.status, whoisResources.getAttributes()) === false ) {

                        //It' ok to just let it happen or fail.
                        OrganisationHelper.updateAbuseC($scope.source, $scope.objectType, $scope.roleForAbuseC, $scope.attributes, passwords);

                        // stick created object in temporary store, so display-screen can fetch it from here
                        MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);

                        // make transition to next display screen
                        WebUpdatesCommons.navigateToDisplay($scope.source, $scope.objectType, whoisResources.getPrimaryKey(), $scope.operation);
                    }
                }

                function _onSubmitError(resp) {

                    var whoisResources = resp.data;
                    var errorMessages = [];
                    var warningMessages = [];
                    var infoMessages = [];

                    $scope.restCalInProgress = false;
                    $scope.attributes = whoisResources.getAttributes();

                    //This interceptor allows us to convert error into success
                    //This could change in the future
                    var intercepted = ScreenLogicInterceptor.afterSubmitError($scope.operation,
                        $scope.source, $scope.objectType,
                        resp.status,  resp.data,
                        errorMessages, warningMessages, infoMessages );

                    // Post-process attribute after submit-error using screen-logic-interceptor
                    if( intercepted ) {
                        loadAlerts(errorMessages, warningMessages, infoMessages);
                        /* Instruct downstream screen (typically display screen) that object is in pending state */
                        WebUpdatesCommons.navigateToDisplay($scope.source, $scope.objectType, whoisResources.getPrimaryKey(), $scope.PENDING_OPERATION);
                    } else {
                        _validateForm();
                        AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, whoisResources);
                        AlertService.setErrors(whoisResources);
                        ErrorReporterService.log($scope.operation, $scope.objectType, AlertService.getErrors(), $scope.attributes);
                        $scope.attributes = _interceptBeforeEdit($scope.operation, $scope.attributes);
                    }
                }

                // Post-process atttributes before submit using screen-logic-interceptor
                $scope.attributes = _interceptAfterEdit($scope.operation, $scope.attributes);

                if (!_validateForm()) {
                    ErrorReporterService.log($scope.operation, $scope.objectType, AlertService.getErrors(), $scope.attributes);
                } else {
                    _stripNulls();
                    AlertService.clearErrors();

                    if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                        _performAuthentication();
                        return;
                    }

                    var passwords = _getPasswordsForRestCall();

                    $scope.restCalInProgress = true;

                    if (!$scope.name) {

                        RestService.createObject($scope.source, $scope.objectType,
                            WhoisResources.turnAttrsIntoWhoisObject($scope.attributes), passwords).then(
                            _onSubmitSuccess,
                            _onSubmitError);

                    } else {
                        //TODO: Temporary function till RPSL clean up
                        if(MntnerService.isLoneRpslMntner($scope.maintainers.objectOriginal)) {
                            passwords.push('RPSL');
                        }

                        RestService.modifyObject($scope.source, $scope.objectType, $scope.name,
                            WhoisResources.turnAttrsIntoWhoisObject($scope.attributes), passwords).then(
                            _onSubmitSuccess,
                            _onSubmitError);
                    }
                }
            }

            function cancel() {
                if ($window.confirm('You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.')) {
                    _navigateAway();
                }
            }

            function getAttributeShortDescription(attrName) {
                return WhoisResources.getAttributeShortDescription($scope.objectType, attrName);
            }

            function getAttributeDescription(attrName) {
                return WhoisResources.getAttributeDescription($scope.objectType, attrName);
            }

            function getAttributeSyntax(attrName) {
                return WhoisResources.getAttributeSyntax($scope.objectType, attrName);
            }

            /*
             * private methods
             */

            function _warnForNonSubstitutableUtf8(attribute, userInput) {
                if( !CharsetTools.isLatin1(userInput)) {
                    // see if any chars can be substituted
                    var subbedValue = CharsetTools.replaceSubstitutables(userInput);
                    if (!CharsetTools.isLatin1(subbedValue)) {
                        attribute.$$error = 'Input contains illegal characters. These will be converted to \'?\'';
                        return false;
                    } else {
                        attribute.$$error = '';
                        return true;
                    }
                }
                return true;
            }

            function _getPasswordsForRestCall() {
                var passwords = [];

                if (CredentialsService.hasCredentials()) {
                    passwords.push(CredentialsService.getCredentials().successfulPassword);
                }

                /*
                 * For routes and aut-nums we always add the password for the RIPE-NCC-RPSL-MNT
                 * This to allow creation for out-of-region objects, without explicitly asking for the RIPE-NCC-RPSL-MNT-pasword
                 */
                if ($scope.objectType === 'route' || $scope.objectType === 'route6' || $scope.objectType === 'aut-num') {
                    passwords.push('RPSL');
                }
                return passwords;
            }

            function _fetchDataForCreate() {
                $scope.restCalInProgress = true;
                RestService.fetchMntnersForSSOAccount().then(
                    function (results) {
                        $scope.restCalInProgress = false;
                        $scope.maintainers.sso = results;
                        if ($scope.maintainers.sso.length > 0) {

                            $scope.maintainers.objectOriginal = [];
                            // pupulate ui-select box with sso-mntners
                            $scope.maintainers.object = _.cloneDeep($scope.maintainers.sso);

                            // copy mntners to attributes (for later submit)
                            var mntnerAttrs = _.map($scope.maintainers.sso, function (i) {
                                return {name: 'mnt-by', value: i.key};
                            });

                            var attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType,
                                $scope.attributes.addAttrsSorted('mnt-by', mntnerAttrs));

                            // Post-process atttributes before showing using screen-logic-interceptor
                            $scope.attributes = _interceptBeforeEdit($scope.CREATE_OPERATION, attributes);

                            $log.debug('mntners-sso:' + JSON.stringify($scope.maintainers.sso));
                            $log.debug('mntners-object-original:' + JSON.stringify($scope.maintainers.objectOriginal));
                            $log.debug('mntners-object:' + JSON.stringify($scope.maintainers.object));

                        }
                    }, function (error) {
                        $scope.restCalInProgress = false;
                        $log.error('Error fetching mntners for SSO:' + JSON.stringify(error));
                        AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                    }
                );
            }

            function loadAlerts(errorMessages, warningMessages, infoMessages) {
                errorMessages.forEach(function(error) {
                    AlertService.addGlobalError(error);
                });

                warningMessages.forEach(function(warning) {
                    AlertService.addGlobalWarning(warning);
                });

                infoMessages.forEach(function(info) {
                    AlertService.addGlobalInfo(info);
                });

                return;
            }

            function _interceptBeforeEdit( method, attributes ) {
                var errorMessages = [];
                var warningMessages = [];
                var infoMessages = [];
                var attributes = ScreenLogicInterceptor.beforeEdit(method,
                    $scope.source, $scope.objectType, attributes,
                    errorMessages, warningMessages, infoMessages );

                loadAlerts(errorMessages, warningMessages, infoMessages);

                return attributes;
            }

            function _interceptAfterEdit( method, attributes ) {
                var errorMessages = [];
                var warningMessages = [];
                var infoMessages = [];
                var attributes = ScreenLogicInterceptor.afterEdit(method,
                    $scope.source, $scope.objectType, attributes,
                    errorMessages, warningMessages, infoMessages );

                loadAlerts(errorMessages, warningMessages, infoMessages);

                return attributes;
            }

            function _interceptOnSubmitSuccess( method, responseAttributes ) {
                var errorMessages = [];
                var warningMessages = [];
                var infoMessages = [];
                var status = ScreenLogicInterceptor.afterSubmitSuccess(method,
                    $scope.source, $scope.objectType, responseAttributes,
                    warningMessages, infoMessages );

                loadAlerts(errorMessages, warningMessages, infoMessages);

                return status;
            }

            function _fetchDataForModify() {

                var password = null;
                if (CredentialsService.hasCredentials()) {
                    password = CredentialsService.getCredentials().successfulPassword;
                }
                // wait untill both have completed
                $scope.restCalInProgress = true;
                $q.all({
                    mntners: RestService.fetchMntnersForSSOAccount(),
                    objectToModify: RestService.fetchObject($scope.source, $scope.objectType, $scope.name, password)
                }).then(
                    function (results) {
                        $scope.restCalInProgress = false;

                        $log.debug('object to modify:' + JSON.stringify(results.objectToModify));

                        // store mntners for SSO account
                        $scope.maintainers.sso = results.mntners;
                        $log.debug('maintainers.sso:' + JSON.stringify($scope.maintainers.sso));

                        // store object to modify
                        $scope.attributes = results.objectToModify.getAttributes();

                        // Create empty attribute with warning for each missing mandatory attribute
                        _insertMissingMandatoryAttributes();

                        // save object for later diff in display-screen
                        MessageStore.add('DIFF', _.cloneDeep($scope.attributes));

                        // prevent warning upon modify with last-modified
                        $scope.attributes.removeAttributeWithName('last-modified');

                        // this is where we must authenticate against
                        $scope.maintainers.objectOriginal = _extractEnrichMntnersFromObject($scope.attributes);

                        // starting point for further editing
                        $scope.maintainers.object = _extractEnrichMntnersFromObject($scope.attributes);

                        // Post-process atttribute before showing using screen-logic-interceptor
                        $scope.attributes = _interceptBeforeEdit($scope.MODIFY_OPERATION, $scope.attributes);

                        // fetch details of all selected maintainers concurrently
                        $scope.restCalInProgress = true;
                        RestService.detailsForMntners($scope.maintainers.object).then(
                            function (result) {
                                $scope.restCalInProgress = false;

                                // result returns an array for each mntner

                                $scope.maintainers.objectOriginal = _.flatten(result);
                                $log.debug('mntners-object-original:' + JSON.stringify($scope.maintainers.objectOriginal));

                                // of course none of the initial ones are new
                                $scope.maintainers.object = MntnerService.enrichWithNewStatus($scope.maintainers.objectOriginal, _.flatten(result));
                                $log.debug('mntners-object:' + JSON.stringify($scope.maintainers.object));

                                if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                                    _performAuthentication();
                                    return;
                                }
                            }, function (error) {
                                $scope.restCalInProgress = false;
                                $log.error('Error fetching sso-mntners details' + JSON.stringify(error));
                                AlertService.setGlobalError('Error fetching maintainer details');
                            });
                    }
                ).catch(
                    function (error) {
                        $scope.restCalInProgress = false;
                        try {
                            var whoisResources = error.data;
                            $scope.attributes = _wrapAndEnrichResources($scope.objectType, error.data);
                            AlertService.setErrors(whoisResources);
                        } catch(e) {
                            $log.error('Error fetching sso-mntners for SSO:' + JSON.stringify(error));
                            AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        }
                    }
                );
            }

            function _insertMissingMandatoryAttributes() {
                var missingMandatories = $scope.attributes.getMissingMandatoryAttributes($scope.objectType);
                if (missingMandatories.length > 0) {
                    _.each(missingMandatories, function (item) {
                        $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType,
                            $scope.attributes.addMissingMandatoryAttribute($scope.objectType, item));
                    });
                    _validateForm();
                }
            }

            function _copyAddedMntnerToAttributes(mntnerName) {
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.addAttrsSorted('mnt-by', [
                    {name: 'mnt-by', value: mntnerName}
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
                var selected = _.map(mntnersInObject, function (mntnerAttr) {
                    return {
                        type: 'mntner',
                        key: mntnerAttr.value,
                        mine: _.contains(_.map($scope.maintainers.sso, 'key'), mntnerAttr.value)
                    };
                });

                return selected;
            }

            function _filterAutocompleteMntners(mntners) {
                return _.filter(mntners, function (mntner) {
                    // prevent that RIPE-NCC mntners can be added to an object upon create of modify
                    // prevent same mntner to be added multiple times
                    return ! MntnerService.isNccMntner(mntner) && ! MntnerService.isMntnerOnlist($scope.maintainers.object, mntner);
                });
            }

            function _validateForm() {
                return $scope.attributes.validate() && OrganisationHelper.validateAbuseC($scope.objectType, $scope.attributes);
            }

            function isFormValid() {
                return $scope.attributes.validateWithoutSettingErrors();
            }

            function hasErrors() {
                return AlertService.hasErrors();
            }

            function _stripNulls() {
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.removeNullAttributes());
            }

            function _wrapAndEnrichResources(objectType, resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes(objectType, whoisResources.getAttributes());
                }
                return whoisResources;
            }

            function _enrichWithMine(mntners) {
                return _.map(mntners, function (mntner) {
                    // search in selected list
                    if (MntnerService.isMntnerOnlist($scope.maintainers.sso, mntner)) {
                        mntner.mine = true;
                    } else {
                        mntner.mine = false;

                    }
                    return mntner;
                });
            }

            function _refreshObjectIfNeeded(associationResp) {
                if ($scope.operation === 'Modify' && $scope.objectType === 'mntner') {
                    if (associationResp) {
                        _wrapAndEnrichResources($scope.objectType, associationResp);
                    } else {
                        var password = null;
                        if (CredentialsService.hasCredentials()) {
                            password = CredentialsService.getCredentials().successfulPassword;
                        }
                        $scope.restCalInProgress = true;
                        RestService.fetchObject($scope.source, $scope.objectType, $scope.name, password).then(
                            function (result) {
                                $scope.restCalInProgress = false;

                                $scope.attributes = result.getAttributes();

                                // save object for later diff in display-screen
                                MessageStore.add('DIFF', _.cloneDeep($scope.attributes));

                                $log.debug('sso-mntners:' + JSON.stringify($scope.maintainers.sso));
                                $log.debug('objectMaintainers:' + JSON.stringify($scope.maintainers.object));

                            },
                            function(error) {
                                $scope.restCalInProgress = false;
                                // ignore
                            }
                        );
                    }
                    $scope.maintainers.objectOriginal = _extractEnrichMntnersFromObject($scope.attributes);
                    $scope.maintainers.object = _extractEnrichMntnersFromObject($scope.attributes);
                }
            }

            function _navigateAway() {
                if ($scope.operation === 'Modify') {
                    WebUpdatesCommons.navigateToDisplay($scope.source, $scope.objectType, $scope.name, undefined);
                } else {
                    $state.transitionTo('webupdates.select');
                }
            }

            function _performAuthentication() {
                WebUpdatesCommons.performAuthentication(
                    $scope.maintainers,
                    $scope.operation,
                    $scope.source,
                    $scope.objectType,
                    $scope.name,
                    _onSuccessfulAuthentication,
                    _navigateAway)
            }

            function _onSuccessfulAuthentication(associationResp){
                _refreshObjectIfNeeded(associationResp)
            }


            function switchToTextMode() {
                $log.debug("Switching to text-mode");

                PreferenceService.setTextMode();

                if( !$scope.name ) {
                    $state.transitionTo('textupdates.create', {
                        source: $scope.source,
                        objectType: $scope.objectType
                    });
                } else {
                    $state.transitionTo('textupdates.modify', {
                        source: $scope.source,
                        objectType: $scope.objectType,
                        name: $scope.name
                    });
                }
            }

          }]);