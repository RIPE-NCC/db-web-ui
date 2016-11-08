'use strict';

angular.module('webUpdates').controller('DomainObjectSplashController', [ '$scope', '$uibModalInstance',
    function ($scope, $modalInstance) {

        $scope.ok = function() {
            $modalInstance.close('ok');
        };

    }]);
