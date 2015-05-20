'use strict';

angular.module('dbWebuiApp')
.controller('SelectController', ['$scope', '$location', 'WhoisMetaService',
	function ($scope, $location, WhoisMetaService) {
        $scope.objectTypes   = WhoisMetaService.getObjectTypes();
        $scope.selectedObjectType = $scope.objectTypes[0];
        $scope.sources   = ['RIPE','TEST'];
        $scope.selectedSource = $scope.sources[0];

        $scope.navigateToCreate = function() {
          $location.path( '/whoisobject/create/' + $scope.selectedObjectType + '/' + $scope.selectedSource );
          //NavigationService.navigateToCreate( $scope.selectedObjectType, $scope.selectedSource );
        }
}]);
