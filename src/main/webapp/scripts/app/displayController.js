'use strict';

angular.module('dbWebuiApp')
.controller('DisplayController', ['$scope', '$routeParams', '$location', 'WhoisRestService',
	function ($scope, $routeParams, $location, WhoisRestService ) {
    // extract parameters from url
	  $scope.objectType = $routeParams.objectType;
    $scope.objectUid = $routeParams.objectUid;

    // populate the UI
    $scope.warnings = WhoisRestService.getWarnings();
    $scope.attributes = WhoisRestService.getObject($scope.objectType, $scope.objectUid);

	  $scope.hasWarnings = function() {
		  return $scope.warnings.length > 0;
	  }

    $scope.navigateToBegin = function() {
      $location.path( '/whoisobject');
    }

    $scope.navigateToModify = function() {
      $location.path( '/whoisobject/modify/'+ $scope.objectType + '/'+ $scope.objectUid);
    }


}]);
