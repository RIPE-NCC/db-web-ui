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

                $scope.source = $stateParams.source;
                $scope.objectType = 'personMntner';
                $scope.ssoUsername = undefined;

                var mandatoryAttributesOnObjectType = WhoisResources.getMandatoryAttributesOnObjectType($scope.objectType);
                $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, mandatoryAttributesOnObjectType);

                $scope.attributes.setSingleAttributeOnName('source', $scope.source);
                $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                // kick off ajax-call to fetch email address of logged-in user
                UserInfoService.init(_handleSsoInfoResp);

            }

            function submit() {
                if (_validateForm()) {
                    AlertService.clearErrors();

                    RestService.createPersonMntner($scope.source,
                        WhoisResources.turnAttrsIntoWhoisObject($scope.attributes), undefined).then(
                        function(resp) {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);

                            MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);

                            _navigateToDisplayPage($scope.source, $scope.objectType,  whoisResources.getPrimaryKey(),  $scope.operation);

                        },
                        function(error) {
                            if (!error.data) {
                                // TIMEOUT: to be handled globally by response interceptor
                            } else {
                                var whoisResources = _wrapAndEnrichResources(error.config.data);
                                _validateForm();
                                AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, error.config.data);
                                AlertService.setErrors(whoisResources);
                            }
                        });

                }
            }

            function cancel() {
                if ( window.confirm('Are you sure?') ) {
                    window.history.back();
                }
            }

            function _validateForm() {
                return $scope.attributes.validate();
            }

            function _wrapAndEnrichResources(resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, whoisResources.getAttributes());
                }
                return whoisResources;
            }

            function _handleSsoInfoResp() {
                var ssoUserName = UserInfoService.getUsername();
                if( ssoUserName ) {
                    $scope.attributes.setSingleAttributeOnName('auth','SSO ' + ssoUserName);
                }
            }

        }]);
