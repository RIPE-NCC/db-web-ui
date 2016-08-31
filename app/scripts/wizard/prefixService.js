/*global Address4, Address6, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp').service('PrefixService', function() {

        this.isValidIp4Cidr = function(str) {
            var bigSubnets = ['/9', '/10', '/11', '/12', '/13', '/14', '/15'];
            var ip4 = new Address4(str);
            return ip4.isValid() && bigSubnets.indexOf(ip4.subnet) === -1;
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
        this.validatePrefix = function(str) {
            return this.isValidIp4Cidr(str) || this.isValidIp6Cidr(str);
        };

        /**
         * Calculate the list of rDNS names for a prefix.
         *
         * @param prefix
         * @returns {*} Array of strings which are the rDNS names for the prefix
         */
        this.getReverseDnsZones = function(prefix) {
            var i, zoneName, zones = [];

            if (this.validatePrefix(prefix)) {

                var ipv4 = new Address4(prefix);
                if (ipv4.isValid()) {
                    var startThirdOctet = ipv4.startAddress().address.split('.').slice(2, 3);
                    var endThirdOctet = ipv4.endAddress().address.split('.').slice(2, 3);
                    var reverseBNet = ipv4.addressMinusSuffix.split('.').reverse().slice(2).join('.');

                    for (i = startThirdOctet; i <= endThirdOctet; i++) {
                        zoneName = i + '.' + reverseBNet + '.in-addr.arpa';
                        zones.push({ name: zoneName });
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
                            zones.push({ name: zoneName });
                        }
                    }
                }
            }
            return zones;
        };
    });
})();
