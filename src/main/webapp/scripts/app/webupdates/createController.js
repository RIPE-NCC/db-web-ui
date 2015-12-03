/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('CreateController', ['$scope', '$stateParams', '$state', '$log', '$window',
        'WhoisResources', 'MessageStore', 'CredentialsService', 'RestService', '$q', 'ModalService',
        'MntnerService', 'AlertService', 'ErrorReporterService', 'LinkService', 'OrganisationHelper',
        function ($scope, $stateParams, $state, $log, $window,
                  WhoisResources, MessageStore, CredentialsService, RestService, $q, ModalService,
                  MntnerService, AlertService, ErrorReporterService, LinkService, OrganisationHelper) {

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
            $scope.fieldVisited = fieldVisited;
            $scope.deleteObject = deleteObject;

            $scope.hasErrors = hasErrors;
            $scope.submit = submit;
            $scope.cancel = cancel;
            $scope.isFormValid = isFormValid;
            $scope.isToBeDisabled = isToBeDisabled;
            $scope.isBrowserAutoComplete = isBrowserAutoComplete;
            $scope.missingAbuseC = missingAbuseC;

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

                $log.debug('Url params: source:' + $scope.source + '. type:' + $scope.objectType + ', uid:' + $scope.name);

                // initialize data
                $scope.maintainers = {
                    sso: [],
                    objectOriginal: [],
                    object: [],
                    alternatives: [],
                };

                $scope.attributes = [];

                $scope.mntbyDescription = WhoisResources.getAttributeDocumentation($scope.objectType, 'mnt-by');
                $scope.mntbySyntax = WhoisResources.getAttributeSyntax($scope.objectType, 'mnt-by');

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
                    $scope.attributes.setSingleAttributeOnName('source', $scope.source);
                    $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                    $scope.attributes.setSingleAttributeOnName('key-cert', 'AUTO-1');
                    $scope.attributes = OrganisationHelper.addAbuseC($scope.objectType, $scope.attributes);

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

            function missingAbuseC() {
                if(_.isEmpty($scope.attributes)) {
                    return false;
                };

                return $scope.operation == $scope.MODIFY_OPERATION && $scope.objectType == 'organisation' && !OrganisationHelper.containsAbuseC($scope.attributes);
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

            function _addNiceAutocompleteName(items) {
                return _.map(items, function (item) {
                    var name = '';
                    var separator = ' / ';
                    if (item.person != null) {
                        name = item.person;
                    } else if (item.role != null) {
                        name = item.role;
                    } else if (item['org-name'] != null) {
                        name = item['org-name'];
                    } else {
                        separator = '';
                    }

                    item.readableName = item.key + separator + name;
                    return item;
                });
            }


            function _isServerLookupKey(refs) {
                return !(_.isUndefined(refs) || refs.length === 0 );
            }

            function referenceAutocomplete(attrType, query, refs) {
                if (!_isServerLookupKey(refs)) {
                    // No suggestions since not a reference
                    return [];
                } else {
                    return RestService.autocomplete(attrType, query, true, ['person', 'role', 'org-name']).then(
                        function (resp) {
                            return _addNiceAutocompleteName(resp)
                        }, function () {
                            return [];
                        });
                }
            }

            function isBrowserAutoComplete(refs) {
                if (_isServerLookupKey(refs)) {
                    return "off";
                } else {
                    return "on";
                }
            }

            function fieldVisited(attr) {
                if ($scope.operation === $scope.CREATE_OPERATION && attr.$$meta.$$primaryKey === true) {
                    RestService.autocomplete(attr.name, attr.value, true, []).then(
                        function (data) {
                            if (_.any(data, function (item) {
                                    return item.type === attr.name && item.key.toLowerCase() === attr.value.toLowerCase();
                                })) {
                                attr.$$error = attr.name + ' ' + data[0].key + ' already exists';
                            } else {
                                attr.$$error = '';
                            }
                        },
                        function (error) {
                            $log.error('Autocomplete error ' + JSON.stringify(error));
                        }
                    );
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
            }

            function canAttributeBeRemoved(attr) {
                return $scope.attributes.canAttributeBeRemoved(attr);
            }

            function removeAttribute(attr) {
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.removeAttribute(attr));
            }

            function displayAddAttributeDialog(attr) {
                ModalService.openAddAttributeModal($scope.attributes.getAddableAttributes($scope.objectType, $scope.attributes))
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
                if (attribute.name === 'source') {
                    return true;
                } else if ($scope.operation === 'Modify' && attribute.$$meta.$$primaryKey === true) {
                    return true;
                }
                return false;
            }

            function deleteObject() {
                $state.transitionTo('delete', {
                    source: $scope.source,
                    objectType: $scope.objectType,
                    name: $scope.name
                });
            }

            function submit() {

                function _onSubmitSuccess(resp) {
                    $scope.restCalInProgress = false;
                    var whoisResources = WhoisResources.wrapWhoisResources(resp);
                    // stick created object in temporary store, so display-screen can fetch it from here
                    MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);

                    // make transition to next display screen
                    _navigateToDisplayPage($scope.source, $scope.objectType, whoisResources.getPrimaryKey(), $scope.operation);
                }

                function _isPendingAuthenticationError(resp) {
                    var status = false;
                    if (resp.status === 400) {
                        status = _.any(resp.data.errormessages.errormessage,
                            function (item) {
                                return item.severity === 'Warning' && item.text === 'This update has only passed one of the two required hierarchical authorisations';
                            }
                        );
                    }
                    $log.info('_isPendingAuthenticationError:' + status);
                    return status;
                }

                function _composePendingResponse(resp) {
                    var found = _.find(resp.errormessages.errormessage, function (item) {
                        return item.severity === 'Error' && item.text === 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s';
                    });

                    if (!_.isUndefined(found) && found.args.length >= 4) {
                        var obstructingType = found.args[0].value;
                        var obstructingName = found.args[1].value;
                        var mntnersToConfirm = found.args[3].value;

                        var obstructingObjectLink = LinkService.getLink($scope.source, obstructingType, obstructingName);
                        var mntnersToConfirmLinks = LinkService.filterAndCreateTextWithLinksForMntners($scope.source, mntnersToConfirm);

                        var moreInfoUrl = 'https://www.ripe.net/manage-ips-and-asns/db/support/managing-route-objects-in-the-irr#2--creating-route-objects-referring-to-resources-you-do-not-manage';
                        var moreInfoLink = '<a target="_blank" href="' + moreInfoUrl + '">Click here for more information</a>.';

                        var pendngMsg = 'Your object is still pending authorisation by a maintainer of the ' +
                            '<strong>' + obstructingType + '</strong> object ' + obstructingObjectLink + '. ' +
                            'Please ask them to confirm, by submitting the same object as outlined below ' +
                            'using syncupdates or mail updates, and authenticate it using the maintainer ' +
                            mntnersToConfirmLinks + '. ' + moreInfoLink;

                        // Keep existing message and overwrite existing errors
                        resp.errormessages.errormessage = [{'severity': 'Info', 'text': pendngMsg}];
                    }
                    // otherwise keep existing response

                    return resp;
                }

                function _onSubmitError(resp) {
                    $scope.restCalInProgress = false;
                    if (_.isUndefined(resp.data)) {
                        // TIMEOUT: to be handled globally by response interceptor
                        $log.error('Response not understood');
                    } else {
                        var whoisResources = _wrapAndEnrichResources(resp.data);
                        // TODO: fix whois to return a 200 series response in case of pending object [MG]
                        if (_isPendingAuthenticationError(resp)) {
                            // TODO: let whois come with a single information errormessage [MG]
                            MessageStore.add(whoisResources.getPrimaryKey(), _composePendingResponse(whoisResources));
                            /* Instruct downstream screen (typically display screen) that object is in pending state */
                            _navigateToDisplayPage($scope.source, $scope.objectType, whoisResources.getPrimaryKey(), $scope.PENDING_OPERATION);
                        } else {
                            _validateForm();
                            AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, resp.data);
                            AlertService.setErrors(whoisResources);
                            ErrorReporterService.log($scope.operation, $scope.objectType, AlertService.getErrors(), $scope.attributes)
                        }
                    }
                }

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
                        RestService.modifyObject($scope.source, $scope.objectType, $scope.name,
                            WhoisResources.turnAttrsIntoWhoisObject($scope.attributes), passwords).then(
                            _onSubmitSuccess,
                            _onSubmitError);
                    }
                }
            }

            function cancel() {
                if (window.confirm('You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.')) {
                    $state.transitionTo('select');
                }
            }

            /*
             * private methods
             */

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
                            $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes.addAttrsSorted('mnt-by', mntnerAttrs));

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
                        _wrapAndEnrichResources(results.objectToModify);

                        // Create empty attribute with warning for each missing mandatory attribute
                        _insertMissingMandatoryAttributes();

                        // this is where we must authenticate against
                        $scope.maintainers.objectOriginal = _extractEnrichMntnersFromObject($scope.attributes);

                        // starting point for further editing
                        $scope.maintainers.object = _extractEnrichMntnersFromObject($scope.attributes);

                        // save object for later diff in display-screen
                        MessageStore.add('DIFF', _.cloneDeep($scope.attributes));

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
                        if (error && error.data) {
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

            function _insertMissingMandatoryAttributes() {
                var missingMandatories = $scope.attributes.getMissingMandatoryAttributes($scope.objectType);
                if (missingMandatories.length > 0) {
                    _.each(missingMandatories, function (item) {
                        $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType,
                            $scope.attributes.addMissingMandatoryAttribute($scope.objectType, item));
                    });
                    _validateForm();
                }

                if(missingAbuseC()) {
                    $scope.attributes = OrganisationHelper.addAbuseC($scope.objectType, $scope.attributes);
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

            function _validateForm() {
                return $scope.attributes.validate();
            }

            function isFormValid() {
                return $scope.attributes.validateWithoutSettingErrors();
            }

            function hasErrors() {
                return AlertService.hasErrors();
            }

            function reportValidationErrors(type, objectType, globalErrors, attributes) {
                _.each(globalErrors, function(item) {
                    $log.error('*** Global validation error: type: ' + type + ', objectType: ' + objectType + ', description:' + item.plainText);
                });
                _.each(attributes, function(item) {
                    if( !_.isUndefined(item.$$error)) {
                        $log.error('*** Field specfic validation error: type: ' + type + ', objectType: ' + objectType + ', attributeType: ' + item.name +  ', description:' + item.$$error);
                        //try {
                        //    $window.dataLayer.push({obhje});
                        //} catch (e) {}
                    }
                });
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

            function _refreshObjectIfNeeded(associationResp) {
                if ($scope.operation === 'Modify' && $scope.objectType === 'mntner') {
                    if (associationResp) {
                        _wrapAndEnrichResources(associationResp);
                    } else {
                        var password = null;
                        if (CredentialsService.hasCredentials()) {
                            password = CredentialsService.getCredentials().successfulPassword;
                        }
                        $scope.restCalInProgress = true;
                        RestService.fetchObject($scope.source, $scope.objectType, $scope.name, password).then(
                            function (result) {
                                $scope.restCalInProgress = false;
                                _wrapAndEnrichResources(result);

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
                $log.debug('Perform authentication');
                var mntnersWithPasswords = MntnerService.getMntnersForPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object);
                if (mntnersWithPasswords.length === 0) {
                    AlertService.setGlobalError('You cannot modify this object through web updates because your SSO account is not associated with any of the maintainers on this object, and none of the maintainers have password');
                } else {

                    ModalService.openAuthenticationModal($scope.source, mntnersWithPasswords).then(
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

                            if (associationResp) {
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
