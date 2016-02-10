// jshint ignore: start
'use strict';

// libc crypt implementation, based on Apache commons-codec Md5Crypt
// depends on CryptJS library
angular.module('webUpdates')
    .service( 'CryptService', function() {

        var _b64t = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var _prefix = '$1$';
        var _separator = '$';
        var _rounds = 1000;

        this.crypt = function(key) {
            return this.cryptSalt(key, _generateSalt(8));
        };

        this.cryptSalt = function(key, salt) {
            var keyLen = key.length;
            var ctx = CryptoJS.enc.Utf8.parse(key + _prefix + salt);
            var ctx1 = CryptoJS.enc.Utf8.parse(key + salt + key);
            var finalb = CryptoJS.MD5(ctx1);

            var ii = keyLen;
            while (ii > 0) {
                ctx.concat(_copyBytes(finalb, 0, (ii > 16 ? 16 : ii)));
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

            for (var i = 0; i < _rounds; i++) {
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

            var passwd = _prefix + salt + _separator;

            passwd += _b64from24bit(_getByte(finalb,0), _getByte(finalb,6), _getByte(finalb,12), 4);
            passwd += _b64from24bit(_getByte(finalb,1), _getByte(finalb,7), _getByte(finalb,13), 4);
            passwd += _b64from24bit(_getByte(finalb,2), _getByte(finalb,8), _getByte(finalb,14), 4);
            passwd += _b64from24bit(_getByte(finalb,3), _getByte(finalb,9), _getByte(finalb,15), 4);
            passwd += _b64from24bit(_getByte(finalb,4), _getByte(finalb,10), _getByte(finalb,5), 4);
            passwd += _b64from24bit(0, 0, _getByte(finalb,11), 2);

            return passwd;
        };

        function _getByte(wordArray, offset) {
            return (wordArray.words[offset >>> 2] >>> (24 - (offset % 4) * 8)) & 0xff;
        }

        function _setByte(wordArray, offset, value) {
            wordArray.words[(wordArray.sigBytes + offset) >>> 2] |= value << (24 - ((wordArray.sigBytes + offset) % 4) * 8);
        }

        function _copyBytes(wordArray, offset, length) {
            var result = CryptoJS.lib.WordArray.create();

            for (var i = offset; i < offset + length; i++) {
                _setByte(result, i, _getByte(wordArray, i));
            }

            result.sigBytes = length;
            return result;
        }

        function _log(wordArray) {
            var sigBytes = wordArray.sigBytes;

            for (var i = 0; i < sigBytes; i++) {
                console.log(_getByte(wordArray, i).toString(16));
            }
        }

        function _b64from24bit(b2, b1, b0, outLen) {
            var w = ((b2 << 16) & 0x00ffffff) | ((b1 << 8) & 0x00ffff) | (b0 & 0xff);
            var n = outLen;
            var result = '';
            while (n-- > 0) {
                result += _b64t[w & 0x3f];
                w >>= 6;
            }
            return result;
        }

        function _generateSalt(length) {
            var result = '';
            for (var index = 0; index < length; index++) {
                var offset = Math.floor((Math.random() * _b64t.length));
                result = result.concat(_b64t[offset]);
            }
            return result;
        }
});
