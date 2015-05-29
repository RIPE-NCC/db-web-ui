'use strict';


angular.module('webUpdates')
.controller('CreateController', ['$scope', '$stateParams', '$state', 'WhoisMetaService', 'WhoisRestService', 'MessageBus',
function ($scope, $stateParams, $state, WhoisMetaService, WhoisRestService, MessageBus) {

    // extract parameters from the url
    $scope.objectType = $stateParams.objectType;
    $scope.source = $stateParams.source;

    // Initalize the UI
    $scope.errors = [];
    $scope.warnings = [];
    $scope.infos = [];

    var allAttributesOnObjectType = WhoisMetaService.getMandatoryAttributesOnObjectType($scope.objectType);
    $scope.attributes = _.map(allAttributesOnObjectType, function (x) {
        return {name: x.name, value: x.value, $$mandatory: x.mandatory}
    });

    $scope.objects = {
        objects: {
            object: [
                {
                    source: {
                        id: $scope.source
                    },
                    attributes: {
                        attribute: $scope.attributes
                    }
                }]
        }
    };

    var getAttrWithName = function (name) {
        return _.find($scope.objects.objects.object[0].attributes.attribute, function (attr) {
            return attr.name == name;
        })
    };

    $scope.validateForm = function () {
        var errorFound = false;
        allAttributesOnObjectType.map(function (attrTemplate) {
            var attr = getAttrWithName(attrTemplate.name);
            if (attrTemplate.mandatory == true && attr.value == null) {
                attr.$$error = 'Mandatory attribute not set';
                errorFound = true;
            }
        });
        return errorFound == false;
    };

    $scope.submit = function () {
        if ($scope.validateForm() == true) {
            WhoisRestService.createObject($scope.source, $scope.objectType, $scope.objects,
                function(response){
                    MessageBus.add('objectCreated', response.objects.object[0]);
                    $state.transitionTo('display', {objectType:$scope.objectType, name:response.objects.object[0]['primary-key'].attribute[0].value});
                },
                function(response){
                    if (response.status / 100 == 5){
                        $scope.errors[0] = 'Internal Server Error';
                        console.log('error response:\n' + response);
                    } else{
                        $scope.errors = response.data.errormessages.errormessage;
                        $scope.warnings = [];
                    }
                }
            );
        }
    };

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
        return attribute.$$error != null;
    };

    $scope.clearAttributeErrors = function () {
        allAttributesOnObjectType.map(function (attr) {
            getAttrWithName(attr.name).$$error = null;
        });
    };

}]);
