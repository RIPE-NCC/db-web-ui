'use strict';

angular.module('webUpdates')
    .controller('CreateController', ['$scope', '$stateParams', '$state', '$resource', 'WhoisMetaService',  'WhoisResources', 'MessageStore', 'md5',
        function ($scope, $stateParams, $state, $resource, WhoisMetaService, WhoisResources,  MessageStore, md5 ) {

            // extract parameters from the url
            $scope.objectType = $stateParams.objectType;
            $scope.source = $stateParams.source;

            // Initalize the UI
            $scope.errors = [];
            $scope.warnings = [];

            // Populate the UI
            $scope.attributes = WhoisMetaService.getMandatoryAttributesOnObjectType($scope.objectType);
            $scope.attributes.setSingleAttributeOnName('source', $scope.source);
            $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');

            // which attributes can be added to the object?
            $scope.addableAttributes = WhoisMetaService.getAddableAttributes($scope.objectType);
            $scope.selectedAttributeType = $scope.addableAttributes[0];
            $scope.addAfterAttribute = undefined;

            // auth (password) modal popup
            $scope.authAttribute;
            $scope.password;
            $scope.passwordAgain;
            $scope.authPasswordMessage;
            $scope.validBase64Characters = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

            var mntnersForSsoAccount = function() {
                $resource('api/user/maintainers').get(function (resp) {
                    var whoisResources = WhoisResources.wrapWhoisResources(resp);
                    $scope.attributes = WhoisResources.wrapAttributes(
                        $scope.attributes.mergeSortAttributes('mnt-by', whoisResources.objectNamesAsAttributes('mnt-by'))
                    );

                })
            };

            mntnersForSsoAccount();

            // Methods called from the template
            $scope.hasErrors = function () {
                return $scope.errors.length > 0;
            };

            $scope.hasWarnings = function () {
                return $scope.warnings.length > 0;
            };

            $scope.attributeHasError = function (attribute) {
                return attribute.$$error !== null;
            };

            $scope.hasMntners = function() {
                return _.find($scope.attributes.getAllAttributesWithValueOnName('mnt-by'), function (attr) {
                    //Must be at least 2 characters long
                    return attr.value.length > 1;
                });
            };

            $scope.submit = function () {
                if (validateForm() === false ) {
                } else {
                    clearErrors();
                    $resource('api/whois/:source/:objectType', {source: $scope.source, objectType: $scope.objectType})
                        .save(WhoisResources.embedAttributes($scope.attributes),
                        function(resp){
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);
                            // stick created object in temporary store, so display can fetch it from here
                            MessageStore.add(whoisResources.getObjectUid(), whoisResources);
                            // make transition to next display screen
                            $state.transitionTo('display', {source:$scope.source, objectType:$scope.objectType, name:whoisResources.getObjectUid()});
                        },
                        function(resp){
                            if( !resp.data) {
                                // TIMEOUT: to be handled globally by response interceptor
                            } else {
                                var whoisResources = WhoisResources.wrapWhoisResources(resp.data);
                                if( ! _.isUndefined(whoisResources)) {
                                    $scope.errors = whoisResources.getGlobalErrors();
                                    $scope.warnings = whoisResources.getGlobalWarnings();
                                    $scope.attributes = WhoisResources.wrapAttributes(
                                        WhoisMetaService.enrichAttributesWithMetaInfo($scope.objectType,whoisResources.getAttributes())
                                    );

                                    validateForm();
                                    populateFieldSpecificErrors(whoisResources);
                                }
                            }
                        });
                }
            };

            $scope.canAttributeBeDuplicated = function(attr) {
                return $scope.attributes.canAttributeBeDuplicated(attr);
            };

            $scope.duplicateAttribute = function(attr) {
                $scope.attributes = WhoisResources.wrapAttributes($scope.attributes.duplicateAttribute(attr));
            };

            $scope.canAttributeBeRemoved = function(attr) {
                return $scope.attributes.canAttributeBeRemoved(attr);
            };

            $scope.removeAttribute = function(attr) {
                $scope.attributes = WhoisResources.wrapAttributes($scope.attributes.removeAttribute(attr));
            };

            $scope.displayAddAttributeDialog = function(attr) {
                $scope.addAfterAttribute = attr;
                $('#insertAttributeModal').modal('show');
            };

            $scope.addAttributeAfterAttribute = function() {
                $scope.attributes = WhoisResources.wrapAttributes($scope.attributes.addAttributeAfter($scope.selectedAttributeType, $scope.addAfterAttribute));
            };

            // auth (password) modal popup

            $scope.displayAuthDialog = function(attr) {
                $scope.authAttribute = attr;
                $scope.password = '';
                $scope.passwordAgain = '';
                $scope.authPasswordMessage = '';
                $('#authModal').modal('show');
            };

            $scope.verifyAuthDialog = function() {
                if ($scope.password == $scope.passwordAgain) {
                    $scope.authPasswordMessage = "Password Match!";
                    return true;
                } else {
                    $scope.authPasswordMessage = "Password Does Not Match!";
                    return false;
                }
            };

            $scope.populateAuthAttribute = function() {
                $scope.authAttribute.value = 'MD5-PW $1$' + $scope.generateSalt(8) + '$' + md5.createHash($scope.password);
            };

            $scope.generateSalt = function(length) {
                var result = '';
                for (var index = 0; index < length; index++) {
                    var offset = Math.floor((Math.random() * $scope.validBase64Characters.length));
                    result = result.concat($scope.validBase64Characters.charAt(offset));
                }
                return result;
            };

            //

            var validateForm = function () {
                var status = $scope.attributes.validate();
                return status;
            };

            var clearErrors = function() {
                $scope.errors = [];
                $scope.warnings = [];
                $scope.attributes.clearErrors();
            };

            var populateFieldSpecificErrors = function( resp ) {
                _.map($scope.attributes, function (attr) {
                    // keep existing error messages
                    if(!attr.$$error) {
                        var errors = resp.getErrorsOnAttribute(attr.name);
                        if (errors && errors.length > 0) {
                            attr.$$error = errors[0].plainText;
                        }
                    }
                    return attr;
                });
            };

        }]);
