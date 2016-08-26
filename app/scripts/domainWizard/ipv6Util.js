(function () {
    'use strict';

    return {
        full_IPv6: full_IPv6
    };

    // nicked from
    // http://stackoverflow.com/questions/30329991/ipv6-as-a-comparable-javascript-string
    function full_IPv6(ip_string_in) {
        // replace ipv4 address if any
        var ipv4 = ip_string_in.match(/(.*:)([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$)/);
        if (ipv4) {
            var ip_string = ipv4[1];
            ipv4 = ipv4[2].match(/[0-9]+/g);
            for (var i = 0; i < 4; i++) {
                var byte = parseInt(ipv4[i], 10);
                ipv4[i] = ('0' + byte.toString(16)).substr(-2);
            }
            ip_string += ipv4[0] + ipv4[1] + ':' + ipv4[2] + ipv4[3];
        }

        // take care of leading and trailing ::
        ip_string_in = ip_string_in.replace(/^:|:$/g, '');

        var ipv6 = ip_string_in.split(':');

        for (var i = 0; i < ipv6.length; i++) {
            var hex = ipv6[i];
            if (hex != '') {
                // normalize leading zeros
                ipv6[i] = ('0000' + hex).substr(-4);
            }
            else {
                // normalize grouped zeros ::
                hex = [];
                for (var j = ipv6.length; j <= 8; j++) {
                    hex.push('0000');
                }
                ipv6[i] = hex.join(':');
            }
        }

        return ipv6.join(':');
    }

})();
