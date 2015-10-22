'use strict';

angular.module('webUpdates')
    .controller('CreatePersonMntnerPairController', [
        '$scope', '$state', '$log', 'SOURCE', 'WhoisResources', 'AlertService', 'UserInfoService', 'RestService', 'MessageStore','ErrorReporterService',
        function ($scope, $state, $log, source, WhoisResources, AlertService, UserInfoService, RestService, MessageStore, ErrorReporterService) {

            $scope.cancel = cancel;
            $scope.submit = submit;
            $scope.isFormValid = isFormValid;
            $scope.fieldVisited = fieldVisited;

            _initialisePage();

            function _initialisePage() {
                $scope.submitInProgress = false;

                AlertService.clearErrors();

                $scope.ssoUserName = undefined;

                $scope.source = source;

                $scope.personAttributes = WhoisResources.wrapAndEnrichAttributes('person',
                    WhoisResources.getMandatoryAttributesOnObjectType('person'));
                $scope.personAttributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                $scope.personAttributes.setSingleAttributeOnName('source', $scope.source);

                $scope.mntnerAttributes = WhoisResources.wrapAndEnrichAttributes('mntner',
                    WhoisResources.getMandatoryAttributesOnObjectType('mntner'));
                $scope.mntnerAttributes.setSingleAttributeOnName('descr', 'Startup maintainer');
                $scope.mntnerAttributes.setSingleAttributeOnName('admin-c', 'AUTO-1');
                $scope.mntnerAttributes.setSingleAttributeOnName('source', $scope.source);

                // kick off ajax-call to fetch email address of logged-in user
                UserInfoService.getUserInfo().then(
                    function(result) {
                        $scope.mntnerAttributes.setSingleAttributeOnName('auth','SSO ' + result.username);
                        $scope.mntnerAttributes.setSingleAttributeOnName('upd-to',result.username);
                    }, function(errpr) {
                        AlertService.setGlobalError('Error fetching SSO information');
                    }
                );

            }

            function submit() {

                _populateMissingAttributes();

                var mntner = $scope.mntnerAttributes.getSingleAttributeOnName('mntner');
                if( !_.isUndefined(mntner.value)) {
                    $scope.personAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                    $scope.mntnerAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                }

                if (!_validateForm()) {
                    ErrorReporterService.log('Create', 'person', AlertService.getErrors(), $scope.personAttributes);
                    ErrorReporterService.log('Create', 'mntner', AlertService.getErrors(), $scope.mntnerAttributes);

                } else {
                    AlertService.clearErrors();

                    $scope.submitInProgress = true;
                    RestService.createPersonMntner($scope.source,
                        WhoisResources.turnAttrsIntoWhoisObjects([$scope.personAttributes, $scope.mntnerAttributes])).then(
                        function(resp) {
                            $scope.submitInProgress = false;
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);

                            var personUid = _addObjectOfTypeToCache(whoisResources, 'person', 'nic-hdl');
                            var mntnerName = _addObjectOfTypeToCache(whoisResources, 'mntner', 'mntner');

                            _navigateToDisplayPage($scope.source, personUid, mntnerName);

                        },
                        function(error) {
                            $scope.submitInProgress = false;
                            if(_.isUndefined(error.data.objects) || _.isUndefined(error.data.errormessages) ) {
                                $log.error('Got unexpected error response:' + JSON.stringify(error) );
                                AlertService.setGlobalError('Recieved unexpected response');
                            } else {
                                var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                                _validateForm();
                                AlertService.addErrors(whoisResources);
                                AlertService.populateFieldSpecificErrors('person', $scope.personAttributes, whoisResources);
                                AlertService.populateFieldSpecificErrors('mntner', $scope.mntnerAttributes, whoisResources);

                                ErrorReporterService.log('Create','post-submit', 'person', AlertService.getErrors(), $scope.personAttributes);
                                ErrorReporterService.log('Create','post-submit', 'mntner', AlertService.getErrors(), $scope.mntnerAttributes);

                            }
                        });

                }
            }

            function _populateMissingAttributes() {
                var mntner = $scope.mntnerAttributes.getSingleAttributeOnName('mntner');
                if( !_.isUndefined(mntner.value)) {
                    $scope.personAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                    $scope.mntnerAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                }
            }

            function cancel() {
                if ( window.confirm('Are you sure?') ) {
                    window.history.back();
                }
            }

            function fieldVisited( objectName, attr ) {
                if (attr.$$meta.$$primaryKey === true && attr.value.length >= 2) {
                    RestService.autocomplete(attr.name, attr.value, true, []).then(
                        function (data) {
                            if(_.any(data, function(item) {
                                    return item.type === attr.name && item.key.toLowerCase() === attr.value.toLowerCase();
                                })) {
                                attr.$$error = attr.name + ' ' + data[0].key + ' already exists';
                            } else {
                                attr.$$error = '';
                            }
                        }
                    );
                }
            }

            function _validateForm(perso) {
                var personValid =  $scope.personAttributes.validate();
                var mntnerValid = $scope.mntnerAttributes.validate();
                return personValid && mntnerValid;
            }

            function isFormValid() {
                _populateMissingAttributes();
                var personValid =  $scope.personAttributes.validateWithoutSettingErrors();
                var mntnerValid = $scope.mntnerAttributes.validateWithoutSettingErrors();
                return personValid && mntnerValid;
            }

            function _onSsoInfoAvailable(result) {
                $scope.ssoUserName = UserInfoService.getUsername();
                if( $scope.ssoUserName ) {
                    $scope.mntnerAttributes.setSingleAttributeOnName('auth','SSO ' + $scope.ssoUserName);
                    $scope.mntnerAttributes.setSingleAttributeOnName('upd-to',$scope.ssoUserName);
                }
            }

            function _navigateToDisplayPage(source, personName, mntnerName) {
                $state.transitionTo('displayPersonMntnerPair', {
                    source: source,
                    person: personName,
                    mntner: mntnerName
                });
            }

            function _addObjectOfTypeToCache( whoisResources, objectType, keyFieldName ) {
                var uid = undefined;
                var attrs = WhoisResources.getAttributesForObjectOfType( whoisResources, objectType);
                if( attrs.length > 0 ) {
                    uid = WhoisResources.wrapAttributes(attrs).getSingleAttributeOnName(keyFieldName).value;
                    MessageStore.add(uid, WhoisResources.turnAttrsIntoWhoisObject(attrs));
                }
                return uid;
            }

        }]);