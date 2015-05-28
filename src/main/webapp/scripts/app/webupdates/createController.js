'use strict';


angular.module('webUpdates')
.controller('CreateController', ['$scope', '$stateParams', '$state', 'WhoisMetaService', '$resource',
function ($scope, $stateParams, $state, WhoisMetaService, $resource) {

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

    //$scope.submit = function () {
    //    if ($scope.validateForm() == true) {
    //        $scope.response = WhoisRestService.createObject($scope.source, $scope.objectType, $scope.objects);
    //
    //        console.log('$scope.response======>' + response);
    //
    //        $scope.errors = WhoisRestService.getErrors();
    //        $scope.warnings = WhoisRestService.getWarnings();
    //        if ($scope.hasErrors() == false) {
    //            $scope.clearAttributeErrors();
    //            changeToStep('display');
    //        }
    //
    //    }
    //};

    // remove me

    $scope.submit = function () {
        if ($scope.validateForm() == true) {
            //$scope.response = WhoisRestService.createObject($scope.source, $scope.objectType, $scope.objects);
            $resource('whois/:source/:objectType', {source: $scope.source, objectType: $scope.objectType}).save($scope.objects,
                function(response){
                    console.log('SSSS.stringify data=======>'+JSON.stringify(response));
                    console.log('response status:' + response);
                    $scope.attributes = response.objects.object[0].attributes.attribute;
                    $scope.errors = [];
                    $scope.warnings = [];

                    $state.transitionTo('display', {objectType:$scope.objectType, name:response.objects.object[0]['primary-key'].attribute[0].value});
                },
                function(response){
                    console.log('EEEE.JSON.stringify(response)=======>'+JSON.stringify(response));

                    if (response.status / 100 == 5){
                        $scope.errors[0] = 'Internal Server Error';
                        console.log('error response:\n' + response);
                    } else{
                        $scope.errors = response.data.errormessages.errormessage;
                        $scope.warnings = [];
                    }
                    console.log('error response status:' + response.status);

                });
            if ($scope.hasErrors() == false) {
                console.log('going to display');
                $scope.clearAttributeErrors();
                changeToStep('display');
            }
        }
    };

    $scope.navigateToSelect = function () {
        $state.transitionTo('select');
    };

    $scope.creationSteps = {select: false, create: true, display: false};

    var changeToStep = function (step) {
        _.forEach($scope.creationSteps, function (n, key) {
            $scope.creationSteps[key] = false;
        });
        $scope.creationSteps[step] = true;
    };
}]);
