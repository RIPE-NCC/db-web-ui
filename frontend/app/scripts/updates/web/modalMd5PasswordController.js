'use strict';

angular.module('webUpdates').controller('ModalMd5PasswordController', [ '$scope', '$modalInstance', 'CryptService',
    function ($scope, $modalInstance, CryptService) {

        $scope.password = '';
        $scope.passwordAgain = '';
        $scope.authPasswordMessage = '';

        $scope.ok = function () {
            if( $scope.verifyAuthDialog() ) {
               $modalInstance.close( _createAuthMd5Value() );
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.verifyAuthDialog = function() {
            if( $scope.password.length ===   0 ) {
                $scope.authPasswordMessage = 'Password too short!';
                return false;
            } else if ($scope.password !== $scope.passwordAgain) {
                $scope.authPasswordMessage = 'Passwords do not match!';
                return false;
            } else {
                $scope.authPasswordMessage = 'Passwords match!';
                return true;
            }
        };

        function _createAuthMd5Value() {
            return 'MD5-PW ' + CryptService.crypt($scope.password);
        }

    }]);
