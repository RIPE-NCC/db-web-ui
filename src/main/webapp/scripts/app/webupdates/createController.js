'use strict';

angular.module('webUpdates')
    .controller('CreateController', ['$scope', '$stateParams', '$state', 'WhoisMetaService', '$resource', 'WhoisResources', 'MessageStore',
        function ($scope, $stateParams, $state, WhoisMetaService, $resource, WhoisResources,  MessageStore ) {

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

            var mntnersForSsoAccount = function() {
                $resource('api/user/maintainers', {get: {method: "GET", isArray: false}})
                    .get(
                    function (resp) {
                        var whoisResources = WhoisResources.wrapWhoisResources(resp);
                        console.log("success::" + whoisResources);
                        if (whoisResources.objects.object) {
                            // tempoary hack: invalid json response returned
                            $scope.attributes.mergeSorted('mnt-by', whoisResources.getAttributes());
                        }
                    },
                    function (resp) {
                        if (!resp.data) {
                            console.log("failure without details:" + resp);
                        } else {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp.data);
                            console.log("failure:" + whoisResources);
                        }
                    });
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
                    console.log("request:" + JSON.stringify($scope.attributes));
                    $resource('api/whois/:source/:objectType', {source: $scope.source, objectType: $scope.objectType})
                        .save(WhoisResources.embedAttributes($scope.attributes),
                        function(resp){
                            var whoisResources  = WhoisResources.wrapWhoisResources(resp);
                            // stick created object in temporary store, so display can fetch it from here
                            MessageStore.add(whoisResources.getObjectUid(), whoisResources);
                            // make transition to next display screen
                            $state.transitionTo('display', {objectType:$scope.objectType, name:whoisResources.getObjectUid()});
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
