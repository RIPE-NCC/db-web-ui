'use strict';

angular.module('dbWebuiApp')
.controller('CreateController', ['$scope', '$stateParams', '$state', 'WhoisMetaService', 'WhoisRestService',
        function ($scope, $stateParams, $state, WhoisMetaService, WhoisRestService) {
        // extract parameters from the url
        $scope.objectType = $stateParams.objectType;
        $scope.source = $stateParams.source;

	    // Initalize the UI
        $scope.errors = [];
        $scope.warnings = [];
        var allAttributesOnObjectType = WhoisMetaService.getMandatoryAttributesOnObjectType($scope.objectType);
        $scope.attributes = _.map(allAttributesOnObjectType, function(x) { return {name: x.name, value: x.value, $mandatory: x.mandatory } });

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

        $scope.hasErrors = function() {
        	return $scope.errors.length > 0;
        };

        $scope.hasWarnings = function() {
        	return $scope.warnings.length > 0;
        };

        $scope.attributeHasError = function(attribute) {
        	return attribute.$error != null;
        };

        $scope.clearAttributeErrors = function() {
            allAttributesOnObjectType.map( function(attr) {
                        attr.$error = null;
                });
        };

        var getAttrWithName = function(name) {
            return _.find($scope.objects.objects.object[0].attributes.attribute, function(attr) {
                return attr.name == name;
            })
        }

        $scope.validateForm = function() {
                var errorFound = false;
            allAttributesOnObjectType.map( function(attrTemplate) {
              var attr = getAttrWithName(attrTemplate.name);
                if(attrTemplate.mandatory == true && attr.value == null) {
                                attr.$error = 'Mandatory attribute not set';
                                errorFound = true;
                        }
                });
                return errorFound == false;
        };

        $scope.submit = function() {
        	if( $scope.validateForm() == true ) {
	        	$scope.objectUid = WhoisRestService.createObject($scope.objects);
	        	$scope.errors = WhoisRestService.getErrors();
	        	$scope.warnings = WhoisRestService.getWarnings();
	        	if( $scope.hasErrors() == false ) {
	            	    $scope.clearAttributeErrors();
                    $state.transitionTo('display', {objectType:'ot', objectUid: 'oi'});
	            }
        	}
        };

}]);
