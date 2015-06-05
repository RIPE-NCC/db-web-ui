'use strict';

angular.module('webUpdates')
.controller('SelectController', ['$scope', '$location', '$resource', 'WhoisMetaService',

	function ($scope, $location, $resource, WhoisMetaService) {
        $scope.objectTypes   = WhoisMetaService.getObjectTypes();
        $scope.selectedObjectType = $scope.objectTypes[0];
        $scope.sources   = ['RIPE','TEST'];
        $scope.selectedSource = $scope.sources[0];

        // autocomplete state
        $scope.selected = undefined;
        $scope.states = [];

        $scope.navigateToCreate = function() {
          $location.path( '/webupdates/create/' + $scope.selectedObjectType + '/' + $scope.selectedSource );
          //NavigationService.navigateToCreate( $scope.selectedObjectType, $scope.selectedSource );
        };

        $scope.autocomplete = function() {
            console.log('autocomplete');
            $scope.states = [];
            if ($scope.selected.length < 2) {
                return;
            }

            $resource('https://rest-dev.db.ripe.net/:prefix', {prefix:'autocomplete', q:$scope.selected, ot:'mntner', at:'mntner'})
                .query(
                    function (response) {
                        console.log('success');
                        $scope.states.push(angular.fromJson(response));
                    },
                    function (response) {
                        console.log('failure');
                    });
        }
    }
]);
