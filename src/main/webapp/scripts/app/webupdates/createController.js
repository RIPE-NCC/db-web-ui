'use strict';

angular.module('webUpdates')
    .controller('CreateController', ['$scope', '$stateParams', '$state', '$resource', 'WhoisMetaService',  'WhoisResources', 'MessageStore',
        function ($scope, $stateParams, $state, $resource, WhoisMetaService, WhoisResources,  MessageStore ) {

            // extract parameters from the url
            $scope.objectType = $stateParams.objectType;
            $scope.source = $stateParams.source;

            // Initalize the UI
            $scope.errors = [];
            $scope.warnings = [];

            // Populate the UI
            $scope.attributes = WhoisResources.wrapAttributes(WhoisMetaService.getMandatoryAttributesOnObjectType($scope.objectType));
            $scope.attributes.setSingleAttributeOnName('source', $scope.source);
            $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');

            $scope.addAttributes = _.filter(WhoisMetaService.getAllAttributesOnObjectType($scope.objectType), function(attr) {
                return !attr.$$meta.$$mandatory || attr.$$meta.$$multiple;
            });

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
                if (validateForm() === true) {
                    clearErrors();
                    $resource('api/whois/:source/:objectType', {source: $scope.source, objectType: $scope.objectType})
                        .save(WhoisResources.embedAttributes($scope.attributes),
                        function(resp){
                            var whoisResources  = WhoisResources.wrapWhoisResources(resp);
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
                console.log("duplicateAttribute:"+ JSON.stringify(attr));
                $scope.attributes = WhoisResources.wrapAttributes($scope.attributes.duplicateAttribute(attr));
                console.log("after duplicateAttribute:"+ JSON.stringify($scope.attributes));
            };


            $scope.canAttributeBeRemoved = function(attr) {
                return $scope.attributes.canAttributeBeRemoved(attr);
            };

            $scope.removeAttribute = function(attr) {
                console.log("removeAttribute:"+ JSON.stringify(attr));
                $scope.attributes = WhoisResources.wrapAttributes($scope.attributes.removeAttribute(attr));
                console.log("after removeAttribute:"+ JSON.stringify($scope.attributes));
            };

            var validateForm = function () {
                return $scope.attributes.validate();
            };

            var clearErrors = function() {
                $scope.errors = [];
                $scope.warnings = [];
                $scope.attributes.clearErrors();
            }

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
