'use strict';

angular.module('textUpdates')
    .controller('TextMultiDecisionModalController', ['$scope', '$modalInstance',
        function ($scope, $modalInstance) {

            $scope.onPoorClicked = function() {
                $modalInstance.close(false);
            }

            $scope.onRichClicked = function() {
                $modalInstance.close(true);
            }


        }]);
