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
    $scope.infos = [];

    $scope.attributes = WhoisMetaService.getMandatoryAttributesOnObjectType($scope.objectType);

    $scope.hasErrors = function () {
        return $scope.errors.length > 0;
    };

    $scope.hasWarnings = function () {
        return $scope.warnings.length > 0;
    };

    $scope.hasInfos = function () {
        return $scope.infos.length > 0;
    };

    $scope.attributeHasError = function (attribute) {
        return attribute.$$error !== null;
    };

    $scope.submit = function () {
        if (validateForm() === true) {
            $resource('whois/:source/:objectType', {source: $scope.source, objectType: $scope.objectType})
                .save({objects:{ object: [ { attributes: { attribute: $scope.attributes } } ] } },
                function(whoisResources){
                    var objectName = WhoisResourcesUtil.getObjectUid(whoisResources);
                    // stick created object in temporary store
                    MessageStore.add(objectName, whoisResources);
                    // make transition to next display screen
                    $state.transitionTo('display', {objectType:$scope.objectType, name:objectName});
                },
                function(response){
                    var whoisResources = response.data;
                    $scope.errors = WhoisResourcesUtil.getGlobalErrors(whoisResources);
                    $scope.warnings = WhoisResourcesUtil.getGlobalWarnings(whoisResources);
                    populateFieldSpecificErrors(whoisResources)
                });
        }
    };

    var validateForm = function () {
        var errorFound = false;
        $scope.attributes.map(function (attr) {
            if (attr.$$meta.$$mandatory === true && attr.value === null) {
                attr.$$error = 'Mandatory attribute not set';
                errorFound = true;
            }
        });
        return errorFound === false;
    };

    var populateFieldSpecificErrors = function( whoisResources ) {
        _.map($scope.attributes, function (attr) {
            var errors = WhoisResourcesUtil.getErrorsOnAttribute(whoisResources, attr.name);
            console.log("errors  for " + attr.name + ":" + JSON.stringify(errors));
            if( errors && errors.length > 0 ) {
                attr.$$error = errors[0].text;
            }
            return attr;
        });
    }


}]);
