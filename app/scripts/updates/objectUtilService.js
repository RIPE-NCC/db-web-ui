(function () {
    'use strict';

    angular.module('updates').service('ObjectUtilService', [function () {

        /**
         * Public functions
         *
         * @param attributes
         * @returns {*|boolean}
         */
        this.isLirObject = function(attributes) {
            return isAllocation(attributes) || !!_.find(attributes, {name: 'org-type', value: 'LIR'});
        };

        /**
         * Hide my privates
         *
         * @param attributes
         * @returns {*}
         */
        function isAllocation(attributes) {
            if (!attributes) {
                return false;
            }
            var allocationStatuses = ['ALLOCATED PA', 'ALLOCATED PI', 'ALLOCATED UNSPECIFIED', 'ALLOCATED-BY-RIR'];
            var status = attributes.getSingleAttributeOnName('status');
            return status && _.includes(allocationStatuses, status.value.trim());
        }

    }]);

})();
