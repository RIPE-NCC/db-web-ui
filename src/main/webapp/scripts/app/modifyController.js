'use strict';

angular.module('dbWebuiApp')
.controller('ModifyController', ['$scope', '$stateParams', '$location','WhoisMetaService', 'WhoisRestService',
function ($scope, $stateParams, $location, WhoisMetaService, WhoisRestService) {
	$scope.errors = [];
	$scope.warnings = [];

	$scope.objectType = $stateParams.objectType;
	$scope.objectUid = $stateParams.objectUid;

        $scope.attributesWithValues = WhoisRestService.getObject($scope.objectType, $scope.objectUid);
        $scope.errors = WhoisRestService.getErrors();
        $scope.warnings = WhoisRestService.getWarnings();

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
                if( $scope.attributesWithValues != null ) {
                        $scope.attributesWithValues.map( function(attr) {
                                attr.error = null;
                        });
                }
        }

        $scope.submit = function() {
        	var errorFound = false;
        	$scope.attributesWithValues.map( function(attr) {
        		if( attr.mandatory == true && attr.value == null) {
        			attr.error = 'Mandatory attribute must be set';
        			errorFound = true;
        		}
        	});

        	if( errorFound == false ) {
	        	WhoisRestService.modifyObject($scope.objectType, $scope.objectUid,
                    $scope.attributesWithValues);
	        	$scope.errors = WhoisRestService.getErrors();
                $scope.warnings = WhoisRestService.getWarnings();
	        	if( $scope.hasErrors() == false ) {
                    $scope.clearAttributeErrors();
                    $location.path( '/whoisobject/display/' + $scope.objectType +'/' + $scope.objectUid);
	        	}
        	}
        }

}]);
