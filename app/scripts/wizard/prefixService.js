/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).factory('PrefixService', [function () {

        /**
         * Validates that a prefix is a valid ipV4 or ipV6 prefix.
         *
         * @param str
         * @returns {boolean}
         */
        function validatePrefix(str) {
            // Validate a prefix
            return !!str;
        }

        /**
         * Calculate the list of rDNS names for a prefix.
         *
         * @param prefix
         * @returns {*} Array of strings which are the rDNS names for the prefix
         */
        function getReverseDnsZones(prefix) {
            if (validatePrefix(prefix)) {
                return [{
                    name: '42.23.194.in-addr.arpa'
                }, {
                    name: '43.23.194.in-addr.arpa'
                }];
            } else {
                return [];
            }
        }

        return {
            validatePrefix: validatePrefix,
            getReverseDnsZones: getReverseDnsZones
        };

    }]);

})();
