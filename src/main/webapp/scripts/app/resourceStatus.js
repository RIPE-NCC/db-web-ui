(function() {

'use strict';

angular.module('dbWebApp')
    .service('ResourceStatus', [function () {
        var statuses = {
            'aut-num': {
                default: [
                    {key: 'ASSIGNED', value: 'ASSIGNED'},
                    {key: 'LEGACY', value: 'LEGACY'},
                    {key: 'OTHER', value: 'OTHER'}
                ]
            },
            inetnum: {
                default: [
                    {key: 'ALLOCATED PA', value: 'ALLOCATED PA'},
                    {key: 'ALLOCATED PI', value: 'ALLOCATED PI'},
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST'},
                    {key: 'ASSIGNED PA', value: 'ASSIGNED PA'},
                    {key: 'ASSIGNED PI', value: 'ASSIGNED PI'},
                    {key: 'EARLY-REGISTRATION', value: 'EARLY-REGISTRATION'},
                    {key: 'LEGACY', value: 'LEGACY'},
                    {key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA'},
                    {key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI'},
                    {key: 'NOT-SET', value: 'NOT-SET'},
                    {key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA'}
                ],
                'ALLOCATED PA': [
                    {key: 'ASSIGNED PA', value: 'ASSIGNED PA'},
                    {key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA'},
                    {key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA'}
                ],
                'ALLOCATED PI': [
                    {key: 'ASSIGNED PI', value: 'ASSIGNED PI'},
                    {key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI'}
                ],
                'ALLOCATED UNSPECIFIED': [
                    {key: 'ALLOCATED PA', value: 'ALLOCATED PA'},
                    {key: 'ALLOCATED PI', value: 'ALLOCATED PI'},
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST'},
                    {key: 'ASSIGNED PA', value: 'ASSIGNED PA'},
                    {key: 'ASSIGNED PI', value: 'ASSIGNED PI'},
                    {key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA'},
                    {key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI'}
                ],
                'ASSIGNED PA': [
                ],
                'ASSIGNED PI': [
                ],
                'EARLY-REGISTRATION': [
                ],
                LEGACY: [
                    {key: 'LEGACY', value: 'LEGACY'}
                ],
                'LIR-PARTITIONED PA': [
                    {key: 'ASSIGNED PA', value: 'ASSIGNED PA'}
                ],
                'LIR-PARTITIONED PI': [
                    {key: 'ASSIGNED PI', value: 'ASSIGNED PI'}
                ],
                'SUB_ALLOCATED PA': [
                    {key: 'ASSIGNED PA', value: 'ASSIGNED PA'}
                ]
            },
            inet6num: {
                default: [
                    {key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR'},
                    {key: 'ALLOCATED-BY-LIR', value: 'ALLOCATED-BY-LIR'},
                    {key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR'},
                    {key: 'ASSIGNED', value: 'ASSIGNED'},
                    {key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST'},
                    {key: 'ASSIGNED PI', value: 'ASSIGNED PI'}
                ],
                'AGGREGATED-BY-LIR': [
                    {key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR'},
                    {key: 'ASSIGNED', value: 'ASSIGNED'}
                ],
                'ALLOCATED-BY-LIR': [
                    {key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR'},
                    {key: 'ASSIGNED', value: 'ASSIGNED'}
                ],
                'ALLOCATED-BY-RIR': [
                    {key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR'},
                    {key: 'ALLOCATED-BY-LIR', value: 'ALLOCATED-BY-LIR'},
                    {key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR'},
                    {key: 'ASSIGNED', value: 'ASSIGNED'},
                    {key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST'},
                    {key: 'ASSIGNED PI', value: 'ASSIGNED PI'}
                ]
            }
        };

        this.get = function (objectType, parentState) {
            if (!objectType || !statuses[objectType]) {
                return [];
            }
            var list = statuses[objectType][parentState || 'default'];
            if (!list) {
                // if no match on parentState then return default
                list = statuses[objectType]['default'] || [];
            }
            return list;
        }
    }]);

})();
