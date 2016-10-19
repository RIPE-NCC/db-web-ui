/*global Address4, Address6, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp').service('PrefixService', ['$http', function ($http) {

        this.isValidIp4Cidr = function (ip4) {
            // check the subnet mask was provided
            if (!ip4.parsedSubnet) {
                return false;
            }

            // check the subnet mask is in range
            if (ip4.parsedSubnet < 17 || ip4.parsedSubnet > 24) {
                return false;
            }

            // check that subnet mask covers all address bits
            var bits = ip4.getBitsBase2();
            var last1 = bits.lastIndexOf('1');

            return last1 < ip4.subnetMask;
        };

        this.isValidIp6Cidr = function (str) {
            // check the subnet mask is in range
            var slashpos = str.indexOf('/');
            if (slashpos < 0 || !str.substr(slashpos + 1)) {
                return false;
            }
            var mask = parseInt(str.substr(slashpos + 1), 10);
            if (!mask || mask >= 127) {
                return false;
            }

            // check it looks like a valid ipv4 address
            var ip6 = new Address6(str);
            if (!ip6.isValid()) {
                return false;
            }

            // check that subnet mask covers all address bits
            var bits = ip6.getBitsBase2();
            var last1 = bits.lastIndexOf('1');
            if (last1 >= ip6.subnetMask) {
                return false;
            }
            return last1 < ip6.subnetMask;
        };

        /**
         * Validates that a prefix is a valid ipV4 or ipV6 prefix.
         *
         * @param str
         * @returns {boolean}
         */
        this.isValidPrefix = function (str) {
            // Validation rules to be implemented (after a chat with Tim 3 Oct 2016
            // * Must support /17 to /24
            //   - if > 17 show: "Please provide a more specific prefix"
            //   - if < 24 show: "Use syncupdates"
            // * For v4, accept 4 octets (3 is widely accepted shorthand but not supported)
            // * Ensure provided address bit are not masked (i.e. 129.168.0.1/24 is not valid cz '.1' is not covered by mask)
            //

            // here we have a string with a subnet mask, but dno if it's v4 or v6 yet, so check...
            var ip4 = new Address4(str);
            if (ip4.isValid()) {
                return this.isValidIp4Cidr(ip4);
            } else {
                var ip6 = new Address6(str);
                if (ip6.isValid()) {
                    return this.isValidIp6Cidr(str);
                }
            }
            // fall through. god know what this is...
            return false;
        };

        /**
         * Calculate the list of rDNS names for a prefix.
         *
         * @param prefix
         * @returns {*} Array of strings which are the rDNS names for the prefix
         */
        this.getReverseDnsZones = function (prefix) {
            var i, zoneName, zones = [];

            if (prefix && this.isValidPrefix(prefix)) {

                var ipv4 = new Address4(prefix);
                if (ipv4.isValid()) {
                    var startThirdOctet = ipv4.startAddress().address.split('.').slice(2, 3);
                    var endThirdOctet = ipv4.endAddress().address.split('.').slice(2, 3);
                    var reverseBNet = ipv4.addressMinusSuffix.split('.').reverse().slice(2).join('.');

                    for (i = startThirdOctet; i <= endThirdOctet; i++) {
                        zoneName = i + '.' + reverseBNet + '.in-addr.arpa';
                        zones.push({name: 'reverse-zone', value: zoneName});
                    }
                } else {
                    var ipv6 = new Address6(prefix);
                    if (!ipv6.error) {
                        var startZone = ipv6.startAddress().reverseForm().split('.');
                        var endZone = ipv6.endAddress().reverseForm().split('.');
                        while (startZone[0] === '0' && endZone[0] === 'f') {
                            startZone.splice(0, 1);
                            endZone.splice(0, 1);
                        }
                        var commonNibbles = startZone.slice(1).join('.');
                        var startNibble = parseInt(startZone[0], 16);
                        var endNibble = parseInt(endZone[0], 16);
                        for (i = startNibble; i <= endNibble; i++) {
                            zoneName = i.toString(16) + '.' + commonNibbles;
                            zones.push({name: 'reverse-zone', value: zoneName});
                        }
                    }
                }
            }
            return zones;
        };

        this.checkNameserverAsync = function (ns) {
            return $http({
                method: 'GET',
                url: 'api/dns/status?ignore404=true&ns=' + ns
            });
        };

    }]);

})();
