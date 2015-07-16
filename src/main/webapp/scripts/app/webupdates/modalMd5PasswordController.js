angular.module('webUpdates').controller('ModalMd5PasswordController', [ '$scope', '$modalInstance', 'md5',
    function ($scope, $modalInstance, md5) {

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
            if( $scope.password.length == 0 ) {
                $scope.authPasswordMessage = 'Password too short!';
                return false;
            } else if ($scope.password !== $scope.passwordAgain) {
                $scope.authPasswordMessage = 'Passwords do not match!';
                return false;
            } else {
                $scope.authPasswordMessage = 'Passwords match!';
                return true;
            }
        }

        function _createAuthMd5Value() {
           return 'MD5-PW $1$' + _generateSalt(8) + '$' + md5.createHash($scope.password);
        }

        function _generateSalt(length) {
            var validBase64Characters = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

            var result = '';
            for (var index = 0; index < length; index++) {
                var offset = Math.floor((Math.random() * validBase64Characters.length));
                result = result.concat(validBase64Characters.charAt(offset));
            }
            return result;
        }


    }]);
