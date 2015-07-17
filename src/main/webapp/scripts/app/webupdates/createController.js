'use strict';

angular.module('webUpdates')
    .controller('CreateController', ['$scope', '$stateParams', '$state', '$log', 'WhoisResources', 'MessageStore', 'CredentialsService','RestService', '$q', 'ModalService',
        function ($scope, $stateParams, $state, $log, WhoisResources, MessageStore, CredentialsService, RestService, $q, ModalService) {

            // exposed methods called from html fragment
            $scope.onMntnerAdded = onMntnerAdded;
            $scope.onMntnerRemoved = onMntnerRemoved;
            $scope.isMine = isMine;
            $scope.hasSSo = hasSSo;
            $scope.hasPgp = hasPgp;
            $scope.hasMd5 = hasMd5;

            $scope.refreshMntners = refreshMntners;
            $scope.suggestAutocomplete = suggestAutocomplete;

            $scope.hasErrors = hasErrors;
            $scope.hasWarnings = hasWarnings;
            $scope.hasInfos = hasInfos;
            $scope.hasMntners = hasMntners;

            $scope.submit = submit;

            $scope.canAttributeBeDuplicated = canAttributeBeDuplicated;
            $scope.duplicateAttribute = duplicateAttribute;
            $scope.canAttributeBeRemoved = canAttributeBeRemoved;
            $scope.removeAttribute = removeAttribute;
            $scope.displayAddAttributeDialog = displayAddAttributeDialog;
            $scope.displayMd5DialogDialog = displayMd5DialogDialog;
            $scope.needToLockLastMntner = needToLockLastMntner;



            _initialisePage();

            function _initialisePage() {

                // workaround for problem with order of loading ui-select fragments
                $scope.uiSelectTemplateReady = false;
                RestService.fetchUiSelectResources().then(function () {
                    $scope.uiSelectTemplateReady = true;
                });

                // extract parameters from the url
                $scope.source = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.name = $stateParams.name;

                // fields
                $scope.maintainers = {
                    selected: [],
                    alternatives: [],
                    mine: []
                };

                $scope.attributes = [];

                $scope.isHelpHidden = true;

                // Initalize the errors and warnings
                $scope.errors = [];
                $scope.warnings = [];
                $scope.infos = [];

                // Determine if this is a create or a modify
                if (!$scope.name) {
                    $scope.operation = 'Create';

                    // Populate empty attributes based on meta-info
                    $scope.attributes = _wrapAndEnrichAttributes(WhoisResources.getMandatoryAttributesOnObjectType($scope.objectType));
                    $scope.attributes.setSingleAttributeOnName('source', $scope.source);
                    $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                    $scope.attributes.setSingleAttributeOnName('key-cert', 'AUTO-1');

                    _fetchDataForCreate();

                } else {
                    $scope.operation = 'Modify';

                    // Start empty, and populate with rest-result
                    $scope.attributes = _wrapAndEnrichAttributes([]);

                    _fetchDataForModify();
                }
            };


            function _fetchDataForCreate() {
                RestService.fetchMntnersForSSOAccount().then(
                    function(results) {
                        $scope.maintainers.mine = results;
                        if ($scope.maintainers.mine.length > 0) {

                            // pupulate ui-select box with sso-mntners
                            $scope.maintainers.selected = _.cloneDeep($scope.maintainers.mine);

                            // copy mntners to attributes (for later submit)
                            var mntnerAttrs = _.map($scope.maintainers.mine, function (i) {
                                return {name: 'mnt-by', value: i.key};
                            });
                            _wrapAndEnrichAttributes($scope.attributes.mergeSortAttributes('mnt-by', mntnerAttrs));
                        }
                    }, function(error) {
                        $log.error('Error fetching mnters for SSO:' + JSON.stringify(error));
                    }
                );
            };

            function _fetchDataForModify() {

                var password = null;
                if( CredentialsService.hasCredentials()) {
                    password = CredentialsService.getCredentials().successfulPassword;
                }
                // wait untill both have completed
                $q.all( { mntners:        RestService.fetchMntnersForSSOAccount(),
                          objectToModify: RestService.fetchObject($scope.source, $scope.objectType, $scope.name, password)}).then(
                    function (results) {
                        // store mntners for SSO account
                        $scope.maintainers.mine = results.mntners;

                        $log.info('maintainers.mine:'+ JSON.stringify($scope.maintainers.mine));

                        // store object to modify
                        _wrapAndEnrichResources(results.objectToModify);
                        $scope.maintainers.selected = _extractMntnersFromObject($scope.attributes);
                        $log.info('maintainers.from.object:'+ JSON.stringify($scope.maintainers.selected));

                        // save object for later diff in display-screen
                        MessageStore.add('DIFF', _.cloneDeep($scope.attributes));

                        // fetch details of all selected maintainers concurrently
                        RestService.detailsForMntners($scope.maintainers.selected).then(
                            function( result ) {
                                // returns an array for each mntner
                                $scope.maintainers.selected = _.flatten(result);

                                $log.info('enriched maintainers.selected:'+ JSON.stringify($scope.maintainers.selected));

                                if ($scope.needsPasswordAuthentication($scope.maintainers.selected )) {
                                    _performAuthentication();
                                }
                        });
                    }
                ).catch(
                    function (error) {
                        $log.error('Error fetching sso-mntnets and object:' + JSON.stringify(error));
                        // TODO: figure out how a q.all failure looks like
                        //var whoisResources = _wrapAndEnrichResources(error.data);
                        //_setErrors(whoisResources);
                    }
                );
             }

            /*
             * Methods called from the html-teplate
             */

            function onMntnerAdded(item, all)   {
                $log.debug('onMntnerAdded before: new item'  + JSON.stringify(item) );
                $log.debug('onMntnerAdded all:' + JSON.stringify(all));
                $log.debug('onMntnerAdded before: selected mntners now:' + JSON.stringify($scope.maintainers.selected));

                _copyAddedMntnerToAttributes(item.key);
                if ($scope.needsPasswordAuthentication($scope.maintainers.selected )) {
                    _performAuthentication();
                }

                $log.debug('onMntnerAdded:'  + JSON.stringify(item) + ' selected mntners now:' + JSON.stringify($scope.maintainers.selected));
                $log.debug('onMntnerAdded: attributes' + JSON.stringify($scope.attributes));

            }

            function _copyAddedMntnerToAttributes(mntnerName) {
                _wrapAndEnrichAttributes($scope.attributes.mergeSortAttributes('mnt-by', [{
                    name: 'mnt-by',
                    value: mntnerName
                }]));
            }

            function onMntnerRemoved(item, all) {

                if ($scope.maintainers.selected.length === 0) {
                    // make sure we do not remove the last mntner which act as anchor
                    _.map($scope.attributes, function (i) {
                        if (i.name === 'mnt-by') {
                            i.value = null;
                            return i;
                        } else {
                            return i;
                        }
                    });
                } else {
                    // remove it from the attributes right away
                    _.remove($scope.attributes, function (i) {
                        return i.name === 'mnt-by' && i.value === item.key;
                    });
                }

                $log.debug('onMntnerRemoved: ' + JSON.stringify(item) + ' selected mntners now:' +  JSON.stringify($scope.maintainers.selected));

            }

            function isMine(mntner) {
                if (!mntner.mine) {
                    return false;
                } else {
                    return mntner.mine;
                }
            }

            function hasSSo(mntner) {
                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'SSO');
                });
            }

            function hasPgp(mntner) {
                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'PGP');
                });
            }

            function hasMd5(mntner) {
                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'MD5');
                });
            }

            function refreshMntners(query) {
                // need to typed characters
                if (query.length > 2) {
                    RestService.autocomplete( 'mnt-by', query, true, ['auth']).then(
                        function (data) {
                            // prevent mntners on selected list to appear
                            $scope.maintainers.alternatives = _stripAlreadySelected(_enrichWithMine(data));

                            $log.info('refreshMntners:mine:' + JSON.stringify($scope.maintainers.mine));
                            $log.info('refreshMntners: selectedMaintainers:' + JSON.stringify($scope.maintainers.selected));

                        }
                    );
                }
            }

            function suggestAutocomplete(attrType, query, refs) {
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

            function hasErrors() {
                return $scope.errors.length > 0;
            }

            function hasWarnings() {
                return $scope.warnings.length > 0;
            }

            function hasInfos() {
                return $scope.infos.length > 0;
            }

            function hasMntners() {
                return $scope.maintainers.selected.length > 0;
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
                        _setErrors(whoisResources);
                    }
                }

                if (_validateForm()) {
                    _stripNulls();
                    _clearErrors();

                    if ($scope.needsPasswordAuthentication($scope.maintainers.selected)) {
                        _performAuthentication();
                        return;
                    }

                    var password = undefined;
                    if( CredentialsService.hasCredentials() ) {
                        password = CredentialsService.getCredentials().successfulPassword;
                    }

                    if (!$scope.name) {

                        RestService.createObject($scope.source, $scope.objectType,
                            WhoisResources.embedAttributes($scope.attributes), password).then(
                            _onSubmitSuccess,
                            _onSubmitError);

                    } else {
                        RestService.modifyObject($scope.source, $scope.objectType, $scope.name,
                            WhoisResources.embedAttributes($scope.attributes), password).then(
                            _onSubmitSuccess,
                            _onSubmitError);
                    }
                }
            }

            function canAttributeBeDuplicated(attr) {
                return $scope.attributes.canAttributeBeDuplicated(attr);
            }

            function duplicateAttribute(attr) {
                _wrapAndEnrichAttributes($scope.attributes.duplicateAttribute(attr));
            }

            function canAttributeBeRemoved(attr) {
                return $scope.attributes.canAttributeBeRemoved(attr);
            }

            function removeAttribute(attr) {
                _wrapAndEnrichAttributes($scope.attributes.removeAttribute(attr));
            }

            function displayAddAttributeDialog(attr) {
                ModalService.openAddAttributeModal( WhoisResources.getAddableAttributes($scope.objectType)).then(
                    function(selectedAttributeType) {
                        _wrapAndEnrichAttributes($scope.attributes.addAttributeAfter(selectedAttributeType, attr));
                    }
                );
            }

            function displayMd5DialogDialog(attr) {
                ModalService.openMd5Modal( ).then(
                    function(authLine) {
                        attr.value = authLine;
                    }
                );
            }

            /*
             * private methods
             */

            function _extractMntnersFromObject(attributes) {
                // get mntners from response
                var mntnersInObject = _.filter(attributes, function (i) {
                    return i.name === 'mnt-by';
                });

                // determine if mntner is mine
                var selected = _.map(mntnersInObject, function(mntnerAttr) {
                    return {
                        type:'mntner',
                        key: mntnerAttr.value,
                        mine: _.contains(_.map($scope.maintainers.mine, 'key'), mntnerAttr.value)
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
                    return !_isMntnerOnlist($scope.maintainers.selected, mntner);
                });
            }

            function _validateForm() {
                var status = $scope.attributes.validate();
                return status;
            }

            function _stripNulls() {
                $scope.attributes = _wrapAndEnrichAttributes($scope.attributes.removeNullAttributes());
            }

            function _clearErrors() {
                $scope.errors = [];
                $scope.warnings = [];
                $scope.attributes.clearErrors();
            }

            /*
             * Private methods
             */

            function _populateFieldSpecificErrors(resp) {
                _.map($scope.attributes, function (attr) {
                    // keep existing error messages
                    if (!attr.$$error) {
                        var errors = resp.getErrorsOnAttribute(attr.name, attr.value);
                        if (errors && errors.length > 0) {
                            attr.$$error = errors[0].plainText;
                        }
                    }
                    return attr;
                });
            }

            function _setErrors(whoisResources) {
                _populateFieldSpecificErrors(whoisResources);
                $scope.errors = whoisResources.getGlobalErrors();
                $scope.warnings = whoisResources.getGlobalWarnings();
                $scope.infos = whoisResources.getGlobalInfos();
            }

            /*
             * Methods used to make sure that attributes have meta information and have utility functions
             */
            function _wrapAndEnrichAttributes(attrs) {
                $scope.attributes = WhoisResources.wrapAttributes(
                    WhoisResources.enrichAttributesWithMetaInfo($scope.objectType, attrs)
                );

                return $scope.attributes;
            }

            function _wrapAndEnrichResources(resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    _wrapAndEnrichAttributes(whoisResources.getAttributes());
                }
                return whoisResources;
            }

            function needToLockLastMntner() {
                if( $scope.name && $scope.maintainers.selected.length == 1 ) {
                    return true;
                }
                return false;
            }

            function _enrichWithMine(mntners) {
                return  _.map(mntners, function(mntner) {
                    // search in selected list
                    if(_isMntnerOnlist($scope.maintainers.mine, mntner)) {
                        mntner.mine = true;
                    }
                    return mntner;
                });
            }

            $scope.needsPasswordAuthentication = function(selectedMaintainers) {
                $log.info('mine:' + JSON.stringify($scope.maintainers.mine));
                $log.info('selectedMaintainers:' + JSON.stringify(selectedMaintainers));

                if( _oneOfSelectedMntnersIsMine(selectedMaintainers) ) {
                    $log.info("One of selected mntners is mine");
                    return false;
                }

                if( _oneOfSelectedMntnersHasCredential(selectedMaintainers) ) {
                    $log.info("One of selected mntners has credentials");
                    return false;
                }

                return true;
            }

            function _oneOfSelectedMntnersIsMine(selectedMaintainers) {
                return _.any(selectedMaintainers, function (mntner) {
                    return $scope.isMine(mntner) === true;
                });
            }

            function _oneOfSelectedMntnersHasCredential(selectedMaintainers) {
                if( CredentialsService.hasCredentials() ) {
                    var trustedMtnerName = CredentialsService.getCredentials().mntner;
                    return _.any(selectedMaintainers, function (mntner) {
                        return mntner.key === trustedMtnerName;
                    });
                }
                return false;
            }

            $scope.getMntnersForPasswordAuth = function(selectedMaintainers) {

                if (_oneOfSelectedMntnersIsMine(selectedMaintainers)) {
                    return [];
                }

                if (_oneOfSelectedMntnersHasCredential(selectedMaintainers)) {
                    return [];
                }

                return _.filter(selectedMaintainers, function (mntner) {
                    return !_.isUndefined(mntner.auth) && $scope.hasMd5(mntner) === true;
                });
            };

            function _refreshObject() {
                if( $scope.operation === 'Modify' && $scope.objectType === 'mntner') {
                    var password = null;
                    if (CredentialsService.hasCredentials()) {
                        password = CredentialsService.getCredentials().successfulPassword;
                    }
                    $log.info("refresh using password:" + password);
                    RestService.fetchObject($scope.source, $scope.objectType, $scope.name, password).then(
                        function (result) {
                            _wrapAndEnrichResources(result);

                            // save object for later diff in display-screen
                            MessageStore.add('DIFF', _.cloneDeep($scope.attributes));

                            $log.info('mine:' + JSON.stringify($scope.maintainers.mine));
                            $log.info('selectedMaintainers:' + JSON.stringify($scope.maintainers.selected));

                        }
                    );
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

                ModalService.openAuthenticationModal($scope.source, $scope.getMntnersForPasswordAuth($scope.maintainers.selected)).then(
                    function(selectedMntner) {
                        $log.info('selected mntner:'+ JSON.stringify(selectedMntner));

                        if( $scope.isMine(selectedMntner)) {
                            // has been successfully associated
                            $scope.maintainers.mine.push(selectedMntner);
                            // mark starred in selected
                            $scope.maintainers.selected = _enrichWithMine($scope.maintainers.selected);

                        }
                        $log.info('After auth: maintainers.mine:'+ JSON.stringify($scope.maintainers.mine));
                        $log.info('After auth: maintainers.selected:'+ JSON.stringify($scope.maintainers.selected));

                        _refreshObject();

                    }, function( error) {
                        _navigateAway();
                    }
                )
            }

        }]);
