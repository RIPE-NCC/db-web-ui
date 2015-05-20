'use strict';

angular.module('dbWebApp')
.controller('CreateController', ['$scope', '$routeParams', '$location','WhoisMetaService', 'WhoisRestService',
        function ($scope, $routeParams, $location, WhoisMetaService, WhoisRestService) {
        // extract parameters from the url
        $scope.objectType = $routeParams.objectType;
        $scope.source = $routeParams.source;

	// Initalize the UI
        $scope.errors = [];
	$scope.warnings = [];
        $scope.allAttributes = WhoisMetaService.getAllAttributesOnObjectType($scope.objectType);
        
        $scope.hasErrors = function() {
        	return $scope.errors.length > 0;
        }

        $scope.hasWarnings = function() {
        	return $scope.warnings.length > 0;
        }

        $scope.attributeHasError = function(attribute) {
        	return attribute.error != null;
        }

        $scope.clearAttributeErrors = function() {
                $scope.allAttributes.map( function(attr) { 
                        attr.error = null;
                });
        }
 
        $scope.validateForm = function() {
                var errorFound = false;
                $scope.allAttributes.map( function(attr) { 
                        if( attr.mandatory == true && attr.value == null) {
                                attr.error = 'Mandatory attribute not set';
                                errorFound = true;
                        }
                });
                return errorFound == false;
        }

        $scope.submit = function() {
        	if( $scope.validateForm() == true ) {
	        	$scope.objectUid = WhoisRestService.createObject($scope.objectType, $scope.allAttributes);
	        	$scope.errors = WhoisRestService.getErrors();
	        	$scope.warnings = WhoisRestService.getWarnings();
	        	if( $scope.hasErrors() == false ) {
	            	    $scope.clearAttributeErrors();
			    $location.path( '/whoisobject/display/' + $scope.objectType +'/' + $scope.objectUid);
	        	}
        	}
        }

}]); 
