'use strict';

angular.module('webUpdates').controller('ModalCreateRoleForAbuseCController', [ '$scope', '$modalInstance', 'source',
    function ($scope, $modalInstance, source) {
        $scope.create = create;
        $scope.cancel = cancel;

        function create() {
            console.log(source +' => new role');
        };

        function cancel() {
            $modalInstance.dismiss();
        };

    }]);
