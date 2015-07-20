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
        };

        function _createAuthMd5Value() {
            return 'MD5-PW ' + $scope.crypt($scope.password, _generateSalt(8));
        }

        // adapted from Apache commons-codec Md5Crypt class

        $scope.crypt = function(key, salt) {
            var keyLen = key.length;
            var prefix = '$1$';
            var ctx = CryptoJS.enc.Utf8.parse(key + prefix + salt);
            var ctx1 = CryptoJS.enc.Utf8.parse(key + salt + key);
            var finalb = CryptoJS.MD5(ctx1);

            var ii = keyLen;
            while (ii > 0) {
                for (var nn = 0; nn < (ii > 16 ? 16 : ii); nn++) {
                    ctx.concat(CryptoJS.enc.Hex.parse(_getHex(finalb, nn)));
                }
                ii -= 16;
            }

            ii = keyLen;
            var j = 0;
            while (ii > 0) {
                if ((ii & 1) == 1) {
                    ctx.concat(CryptoJS.enc.Hex.parse('00'));
                } else {
                    ctx.concat(CryptoJS.enc.Utf8.parse(key.substring(j, j + 1)));
                }
                ii >>= 1;
            }

            finalb = CryptoJS.MD5(ctx);

            var rounds = 1000;

            for (var i = 0; i < rounds; i++) {
                ctx1 = CryptoJS.lib.WordArray.create();

                if ((i & 1) != 0) {
                    ctx1.concat(CryptoJS.enc.Utf8.parse(key));
                } else {
                    ctx1.concat(finalb);
                }

                if (i % 3 != 0) {
                    ctx1.concat(CryptoJS.enc.Utf8.parse(salt));
                }

                if (i % 7 != 0) {
                    ctx1.concat(CryptoJS.enc.Utf8.parse(key));
                }

                if ((i & 1) != 0) {
                    ctx1.concat(finalb);
                } else {
                     ctx1.concat(CryptoJS.enc.Utf8.parse(key));
                }

                finalb = CryptoJS.MD5(ctx1);
            }

            var passwd = prefix + salt + '$';

            passwd += _b64from24bit(_getByte(finalb,0), _getByte(finalb,6), _getByte(finalb,12), 4);
            passwd += _b64from24bit(_getByte(finalb,1), _getByte(finalb,7), _getByte(finalb,13), 4);
            passwd += _b64from24bit(_getByte(finalb,2), _getByte(finalb,8), _getByte(finalb,14), 4);
            passwd += _b64from24bit(_getByte(finalb,3), _getByte(finalb,9), _getByte(finalb,15), 4);
            passwd += _b64from24bit(_getByte(finalb,4), _getByte(finalb,10), _getByte(finalb,5), 4);
            passwd += _b64from24bit(0, 0, _getByte(finalb,11), 2);

            return passwd;
        };

        function _getHex(wordArray, offset) {
            return _getByte(wordArray, offset).toString(16);
        }

        function _getByte(wordArray, offset) {
            return (wordArray.words[offset >>> 2] >>> (24 - (offset % 4) * 8)) & 0xff;
        }

        function _log(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                console.log(bite.toString(16));
            }
        }

        // adapted from Apache commons-codec B64 class

        var B64T = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

        function _b64from24bit(b2, b1, b0, outLen) {
            var w = ((b2 << 16) & 0x00ffffff) | ((b1 << 8) & 0x00ffff) | (b0 & 0xff);
            var n = outLen;
            var result = '';
            while (n-- > 0) {
                result += B64T[w & 0x3f];
                w >>= 6;
            }
            return result;
        }

        function _generateSalt(length) {
            var result = '';
            for (var index = 0; index < length; index++) {
                var offset = Math.floor((Math.random() * B64T.length));
                result = result.concat(B64T[offset]);
            }
            return result;
        }


    }]);
