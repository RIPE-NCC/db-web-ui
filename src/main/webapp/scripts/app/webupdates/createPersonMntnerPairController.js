'use strict';

angular.module('webUpdates')
    .controller('CreatePersonMntnerPairController', [
        '$scope', '$state', '$log', '$stateParams', 'WhoisResources', 'AlertService', 'UserInfoService', 'RestService', 'MessageStore',
        function ($scope, $state, $log, $stateParams, WhoisResources, AlertService, UserInfoService, RestService, MessageStore) {

            $scope.cancel = cancel;
            $scope.submit = submit;

            _initialisePage();

            function _initialisePage() {
                AlertService.clearErrors();

                $scope.ssoUserName = undefined;

                $scope.source = $stateParams.source;

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
                UserInfoService.init(_onSsoInfoAvailable);

            }

            function submit() {

                if(_.isUndefined($scope.ssoUserName)) {
                    AlertService.setGlobalError('Error fetching SSO information');
                    return;
                }

                var mntner = $scope.mntnerAttributes.getSingleAttributeOnName('mntner');
                if( !_.isUndefined(mntner.value)) {
                    $scope.personAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                    $scope.mntnerAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                }

                if (_validateForm()) {
                    AlertService.clearErrors();

                    RestService.createPersonMntner($scope.source,
                        WhoisResources.turnAttrsIntoWhoisObjects([$scope.personAttributes, $scope.mntnerAttributes])).then(
                        function(resp) {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);

                            var personUid = _addObjectOfTypeToCache(whoisResources, 'person', 'nic-hdl');
                            var mntnerName = _addObjectOfTypeToCache(whoisResources, 'mntner', 'mntner');

                            _navigateToDisplayPage($scope.source, personUid, mntnerName);

                        },
                        function(error) {
                            if(_.isUndefined(error.data.objects) || _.isUndefined(error.data.errormessages) ) {
                                $log.error('Got unexpected error response:' + JSON.stringify(error) );
                                AlertService.setGlobalError('Recieved unexpected response');
                            } else {
                                var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                                AlertService.addErrors(whoisResources);
                                AlertService.populateFieldSpecificErrors('person', $scope.personAttributes, whoisResources);
                                AlertService.populateFieldSpecificErrors('mntner', $scope.mntnerAttributes, whoisResources);
                            }
                        });

                }
            }

            function cancel() {
                if ( window.confirm('Are you sure?') ) {
                    window.history.back();
                }
            }

            function _validateForm(perso) {
                var personValid =  $scope.personAttributes.validate();
                var mntnerValid = $scope.mntnerAttributes.validate();
                return personValid && mntnerValid;
            }

            function _onSsoInfoAvailable() {
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
