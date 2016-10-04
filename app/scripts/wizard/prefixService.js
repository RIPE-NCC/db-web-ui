/*global Address4, Address6, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp').service('PrefixService', ['$http', '$q', function($http, $q) {

        this.isValidIp4Cidr = function(str) {
            var ip4 = new Address4(str);
            if (!ip4.isValid()) {
                return false;
            }
            var bits = ip4.getBitsBase2();
            var last1 = bits.lastIndexOf('1');
            return last1 < ip4.subnetMask;
        };

        this.isValidIp6Cidr = function(str) {
            var userManagedSubnets = ['/12', '/16', '/20', '/24', '/28', '/32', '/48', '/64'];
            var ip6 = new Address6(str);
            return !ip6.error && userManagedSubnets.indexOf(ip6.subnet) === -1;
        };

        /**
         * Validates that a prefix is a valid ipV4 or ipV6 prefix.
         *
         * @param str
         * @returns {boolean}
         */
        this.isValidPrefix = function(str) {
            // Validation rules to be implemented (after a chat with Tim 3 Oct 2016
            // * Must support /17 to /24
            //   - if > 17 show: "Please provide a more specific prefix"
            //   - if < 24 show: "Use syncupdates"
            // * For v4, accept 4 octets (3 is widely accepted shorthand but not supported)
            // * Ensure provided address bit are not masked (i.e. 129.168.0.1/24 is not valid cz '.1' is not covered by mask)
            //
            if (!str) {
                // no string
                return false;
            }
            var slashpos = str.indexOf('/');
            if (slashpos < 0 || !str.substr(slashpos + 1)) {
                // empty or missing netmask
                return false;
            }
            var mask = parseInt(str.substr(slashpos + 1), 10);
            if (mask < 17 || mask > 24) {
                return false;
            }
            if (this.isValidIp4Cidr(str)) {
                return true;
            }
            return this.isValidIp6Cidr(str);
        };

        /**
         * Calculate the list of rDNS names for a prefix.
         *
         * @param prefix
         * @returns {*} Array of strings which are the rDNS names for the prefix
         */
        this.getReverseDnsZones = function(prefix) {
            var i, zoneName, zones = [];

            if (prefix && this.isValidPrefix(prefix)) {

                var ipv4 = new Address4(prefix);
                if (ipv4.isValid()) {
                    var startThirdOctet = ipv4.startAddress().address.split('.').slice(2, 3);
                    var endThirdOctet = ipv4.endAddress().address.split('.').slice(2, 3);
                    var reverseBNet = ipv4.addressMinusSuffix.split('.').reverse().slice(2).join('.');

                    for (i = startThirdOctet; i <= endThirdOctet; i++) {
                        zoneName = i + '.' + reverseBNet + '.in-addr.arpa';
                        zones.push({ name: 'reverse-zone', value: zoneName });
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
                            zones.push({ name: 'reverse-zone', value: zoneName });
                        }
                    }
                }
            }
            return zones;
        };

        this.checkNameserverAsync = function(ns) {
            return $http({
                method: 'GET',
                url: 'api/dns/status?ignore404=true&ns=' + ns
            });
        };

    }]);

})();
