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

    $scope.attributes = WhoisResources.wrapAttributes(WhoisMetaService.getMandatoryAttributesOnObjectType($scope.objectType));
    $scope.attributes.setSingleAttributeOnName('source', $scope.source);
    $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
    $scope.attributes.setSingleAttributeOnName('mnt-by', 'GROLSSO-MNT');

    $scope.hasErrors = function () {
        return $scope.errors.length > 0;
    };

    $scope.hasWarnings = function () {
        return $scope.warnings.length > 0;
    };

    $scope.attributeHasError = function (attribute) {
        return attribute.$$error !== null;
    };

    $scope.submit = function () {
        if (validateForm() === true) {
            clearErrors();
            $resource('whois/:source/:objectType', {source: $scope.source, objectType: $scope.objectType})
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
                        $scope.errors = whoisResources.getGlobalErrors();
                        $scope.warnings = whoisResources.getGlobalWarnings();
                        validateForm();
                        populateFieldSpecificErrors(whoisResources);
                    }
                });
        }
    };

    var clearErrors = function() {
        $scope.errors = [];
        $scope.warnings = [];
        $scope.attributes.map(function (attr) {
            attr.$$error = undefined;
        });
    }

    var validateForm = function () {
        var errorFound = false;
        _.map($scope.attributes, function (attr) {
            if (attr.$$meta.$$mandatory === true && ! attr.value ) {
                attr.$$error = 'Mandatory attribute not set';
                errorFound = true;
            } else {
                attr.$$error = undefined;
            }
        });
        return errorFound === false;
    };

    var populateFieldSpecificErrors = function( whoisResources ) {
        _.map($scope.attributes, function (attr) {
            // keep existing error messages
            if(!attr.$$error) {
                var errors = whoisResources.getErrorsOnAttribute(attr.name);
                console.log("errors  for " + attr.name + ":" + JSON.stringify(errors));
                if (errors && errors.length > 0) {
                    attr.$$error = errors[0].plainText;
                }
            }
            return attr;
        });
    };

}]);
