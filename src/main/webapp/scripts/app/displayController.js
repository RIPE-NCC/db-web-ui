'use strict';

angular.module('dbWebuiApp')
.controller('DisplayController', ['$scope', '$stateParams', '$location', 'WhoisRestService',
	function ($scope, $stateParams, $location, WhoisRestService ) {
    // extract parameters from url
	  $scope.objectType = $stateParams.objectType;
    $scope.objectUid = $stateParams.objectUid;

    // populate the UI
    $scope.warnings = WhoisRestService.getWarnings();
    $scope.attributes = WhoisRestService.getObject($scope.objectType, $scope.objectUid);

	  $scope.hasWarnings = function() {
		  return $scope.warnings.length > 0;
	  }




}]);
