'use strict';

// Ref. https://tools.ietf.org/html/rfc1321#section-3.4
angular.module('dbWebApp')
    .factory( 'CryptService', function() {

        var _validBase64Characters = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var _prefix = '$1$';
        var _separator = '$';

        // Ref. http://www.ietf.org/rfc/rfc1321.txt

        // rotation constants for transform
        var S11 = 7;
        var S12 = 12;
        var S13 = 17;
        var S14 = 22;
        var S21 = 5;
        var S22 = 9;
        var S23 = 14;
        var S24 = 20;
        var S31 = 4;
        var S32 = 11;
        var S33 = 16;
        var S34 = 23;
        var S41 = 6;
        var S42 = 10;
        var S43 = 15;
        var S44 = 21;

        return {
            crypt: function(password) {
                var salt = _generateSalt(8);
            },
            _generateSalt: function(length) {
                var result = '';
                for (var index = 0; index < length; index++) {
                    var offset = Math.floor((Math.random() * _validBase64Characters.length));
                    result = result.concat(_validBase64Characters.charAt(offset));
                }
                return result;
            },

            // Adapted from RFC1321 Reference Implementation, Ref. http://www.ietf.org/rfc/rfc1321.txt

            // F, G, H and I are basic MD5 functions.

            _F: function(x, y, z) {
                return ((x & y) | (~x & z));
            },
            _G: function(x, y, z) {
                return ((x & z) | (y & ~z));
            },
            _H: function(x, y, z) {
                return (x ^ y ^ z);
            },
            _I: function(x, y, z) {
                return (y ^ (x | ~z));
            },

            // rotates x left n bits
            _rotateLeft: function(x, n) {
                return ((x << n) | (x >>> (32 - n)));
            },

            // FF, GG, HH, and II transformations for rounds 1, 2, 3, and 4.
            // Rotation is separate from addition to prevent recomputation.

            _FF: function(a, b, c, d, x, s, ac) {
                return _rotateLeft((a + _F(b, c, d) + x + ac), s) + b;
            },
            _GG: function(a, b, c, d, x, s, ac) {
                return _rotateLeft((a + _G(b, c, d) + x + ac), s) + b;
            },
            _HH: function(a, b, c, d, x, s, ac) {
                return _rotateLeft((a + _H(b, c, d) + x + ac), s) + b;
            },
            _II: function(a, b, c, d, x, s, ac) {
                return _rotateLeft((a + _I(b,c, d) + x + ac), s) + b;
            },
            _transform: function(state, x) {
                var a = state[0];
                var b = state[1];
                var c = state[2];
                var d = state[3];

                // round 1
                a = _FF(a, b, c, d, x[ 0], S11, 0xd76aa478);
                d = _FF(d, a, b, c, x[ 1], S12, 0xe8c7b756);
                c = _FF(c, d, a, b, x[ 2], S13, 0x242070db);
                b = _FF(b, c, d, a, x[ 3], S14, 0xc1bdceee);
                a = _FF(a, b, c, d, x[ 4], S11, 0xf57c0faf);
                d = _FF(d, a, b, c, x[ 5], S12, 0x4787c62a);
                c = _FF(c, d, a, b, x[ 6], S13, 0xa8304613);
                b = _FF(b, c, d, a, x[ 7], S14, 0xfd469501);
                a = _FF(a, b, c, d, x[ 8], S11, 0x698098d8);
                d = _FF(d, a, b, c, x[ 9], S12, 0x8b44f7af);
                c = _FF(c, d, a, b, x[10], S13, 0xffff5bb1);
                b = _FF(b, c, d, a, x[11], S14, 0x895cd7be);
                a = _FF(a, b, c, d, x[12], S11, 0x6b901122);
                d = _FF(d, a, b, c, x[13], S12, 0xfd987193);
                c = _FF(c, d, a, b, x[14], S13, 0xa679438e);
                b = _FF(b, c, d, a, x[15], S14, 0x49b40821);

                // round 2
                a = _GG(a, b, c, d, x[ 1], S21, 0xf61e2562);
                d = _GG(d, a, b, c, x[ 6], S22, 0xc040b340);
                c = _GG(c, d, a, b, x[11], S23, 0x265e5a51);
                b = _GG(b, c, d, a, x[ 0], S24, 0xe9b6c7aa);
                a = _GG(a, b, c, d, x[ 5], S21, 0xd62f105d);
                d = _GG(d, a, b, c, x[10], S22,  0x2441453);
                c = _GG(c, d, a, b, x[15], S23, 0xd8a1e681);
                b = _GG(b, c, d, a, x[ 4], S24, 0xe7d3fbc8);
                a = _GG(a, b, c, d, x[ 9], S21, 0x21e1cde6);
                d = _GG(d, a, b, c, x[14], S22, 0xc33707d6);
                c = _GG(c, d, a, b, x[ 3], S23, 0xf4d50d87);
                b = _GG(b, c, d, a, x[ 8], S24, 0x455a14ed);
                a = _GG(a, b, c, d, x[13], S21, 0xa9e3e905);
                d = _GG(d, a, b, c, x[ 2], S22, 0xfcefa3f8);
                c = _GG(c, d, a, b, x[ 7], S23, 0x676f02d9);
                b = _GG(b, c, d, a, x[12], S24, 0x8d2a4c8a);

                // round 3
                a = _HH(a, b, c, d, x[ 5], S31, 0xfffa3942);
                d = _HH(d, a, b, c, x[ 8], S32, 0x8771f681);
                c = _HH(c, d, a, b, x[11], S33, 0x6d9d6122);
                b = _HH(b, c, d, a, x[14], S34, 0xfde5380c);
                a = _HH(a, b, c, d, x[ 1], S31, 0xa4beea44);
                d = _HH(d, a, b, c, x[ 4], S32, 0x4bdecfa9);
                c = _HH(c, d, a, b, x[ 7], S33, 0xf6bb4b60);
                b = _HH(b, c, d, a, x[10], S34, 0xbebfbc70);
                a = _HH(a, b, c, d, x[13], S31, 0x289b7ec6);
                d = _HH(d, a, b, c, x[ 0], S32, 0xeaa127fa);
                c = _HH(c, d, a, b, x[ 3], S33, 0xd4ef3085);
                b = _HH(b, c, d, a, x[ 6], S34,  0x4881d05);
                a = _HH(a, b, c, d, x[ 9], S31, 0xd9d4d039);
                d = _HH(d, a, b, c, x[12], S32, 0xe6db99e5);
                c = _HH(c, d, a, b, x[15], S33, 0x1fa27cf8);
                b = _HH(b, c, d, a, x[ 2], S34, 0xc4ac5665);

                // round 4
                a = _II(a, b, c, d, x[ 0], S41, 0xf4292244);
                d = _II(d, a, b, c, x[ 7], S42, 0x432aff97);
                c = _II(c, d, a, b, x[14], S43, 0xab9423a7);
                b = _II(b, c, d, a, x[ 5], S44, 0xfc93a039);
                a = _II(a, b, c, d, x[12], S41, 0x655b59c3);
                d = _II(d, a, b, c, x[ 3], S42, 0x8f0ccc92);
                c = _II(c, d, a, b, x[10], S43, 0xffeff47d);
                b = _II(b, c, d, a, x[ 1], S44, 0x85845dd1);
                a = _II(a, b, c, d, x[ 8], S41, 0x6fa87e4f);
                d = _II(d, a, b, c, x[15], S42, 0xfe2ce6e0);
                c = _II(c, d, a, b, x[ 6], S43, 0xa3014314);
                b = _II(b, c, d, a, x[13], S44, 0x4e0811a1);
                a = _II(a, b, c, d, x[ 4], S41, 0xf7537e82);
                d = _II(d, a, b, c, x[11], S42, 0xbd3af235);
                c =_II(c, d, a, b, x[ 2], S43, 0x2ad7d2bb);
                b = _II(b, c, d, a, x[ 9], S44, 0xeb86d391);

                state[0] += a;
                state[1] += b;
                state[2] += c;
                state[3] += d;
            },
            convertToArray: function(input) {
                var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
                var output = '';
                for (var i = 0; i < input.length; i++) {
                    output += hex[((input.charCodeAt(i) >>> 4) & 0xf)] + hex[(input.charCodeAt(i) & 0xf)];
                }
                return output;
            },
            MD5: function(input) {

                // MD5Init

                var count = [0, 0];

                // Load magic initialization constants.
                var state = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];

                // MDUpdate

                var x = convertToArray(input);

                for (var i = 0; i = x.length; i += 16) {
                    _transform(state, x);
                }

                // MDFinal

                return input;
            },
            MDPrint: function(digest) {
                var output = '';
                for (var i=0; i<16; i++) {
                    output += (digest[i].toString(16) + ',');
                }
                console.log(output);
            }
        };
});
