'use strict';

angular.module('webUpdates')
.controller('CreateController', ['$scope', '$stateParams', '$state', 'WhoisMetaService', '$resource', 'WhoisResourcesUtil', 'MessageStore',
function ($scope, $stateParams, $state, WhoisMetaService, $resource, WhoisResourcesUtil,  MessageStore ) {

    // extract parameters from the url
    $scope.objectType = $stateParams.objectType;
    $scope.source = $stateParams.source;

    // Initalize the UI
    $scope.errors = [];
    $scope.warnings = [];

    $scope.attributes = WhoisMetaService.getMandatoryAttributesOnObjectType($scope.objectType);
    WhoisResourcesUtil.setAttribute($scope.attributes, 'source', $scope.source);
    WhoisResourcesUtil.setAttribute($scope.attributes, 'nic-hdl', 'AUTO-1');

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
            // wrap attributes in whois-resources object
            $resource('whois/:source/:objectType', {source: $scope.source, objectType: $scope.objectType})
                .save(WhoisResourcesUtil.embedAttributes($scope.attributes),
                function(whoisResources){
                    console.log("success resp:"+ JSON.stringify(whoisResources));
                    var objectName = WhoisResourcesUtil.getObjectUid(whoisResources);
                    // stick created object in temporary store, so display can fetch it from here
                    MessageStore.add(objectName, whoisResources);
                    // make transition to next display screen
                    $state.transitionTo('display', {objectType:$scope.objectType, name:objectName});
                },
                function(response){
                    if( !response.data) {
                        // TIMEOUT?
                    } else {
                        var whoisResources = response.data;
                        console.log("error resp:" + JSON.stringify(response));
                        $scope.errors = WhoisResourcesUtil.getGlobalErrors(whoisResources);
                        $scope.warnings = WhoisResourcesUtil.getGlobalWarnings(whoisResources);
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
                var errors = WhoisResourcesUtil.getErrorsOnAttribute(whoisResources, attr.name);
                console.log("errors  for " + attr.name + ":" + JSON.stringify(errors));
                if (errors && errors.length > 0) {
                    attr.$$error = errors[0].plainText;
                }
            }
            return attr;
        });
    }


}]);
