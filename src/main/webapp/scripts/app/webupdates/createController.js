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
                function(response){
                    $scope.whoisResources = response;
                    var objectName = WhoisResourcesUtil.getObjectUid($scope.whoisResources);
                    // stick created object in temporary store
                    MessageStore.add(objectName, response);
                    // make transition to next display screen
                    $state.transitionTo('display', {objectType:$scope.objectType, name:objectName});
                },
                function(response){
                    var whoisResources = response.data;
                    $scope.errors = WhoisResourcesUtil.getGlobalErrors(whoisResources);
                    $scope.warnings = WhoisResourcesUtil.getGlobalWarnings(whoisResources);
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


}]);
