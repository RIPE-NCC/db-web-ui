(function() {
    
'use strict';

angular.module('dbWebApp')
    .service('ResourceStatus', [function () {
        var states = {
            inetnum: {
                ALLOCATED_PI: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'}
                ],
                ALLOCATED_PA: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'}
                ],
                ALLOCATED_UNSPECIFIED: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'}
                ],
                LIR_PARTITIONED_PA: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PA',          value: 'ALLOCATED PA'},
                    {key: 'LIR-PARTITIONED PA',    value: 'LIR-PARTITIONED PA'},
                    {key: 'SUB-ALLOCATED PA',      value: 'SUB-ALLOCATED PA'},
                    {key: 'EARLY-REGISTRATION',    value: 'EARLY-REGISTRATION'}
                ],
                LIR_PARTITIONED_PI: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PI',          value: 'ALLOCATED PI'},
                    {key: 'LIR-PARTITIONED PI',    value: 'LIR-PARTITIONED PI'},
                    {key: 'EARLY-REGISTRATION',    value: 'EARLY-REGISTRATION'}
                ],
                SUB_ALLOCATED_PA: [
                    {key: 'ALLOCATED PA',          value: 'ALLOCATED PA'},
                    {key: 'LIR-PARTITIONED PA',    value: 'LIR-PARTITIONED PA'},
                    {key: 'SUB-ALLOCATED PA',      value: 'SUB-ALLOCATED PA'},
                    {key: 'EARLY-REGISTRATION',    value: 'EARLY-REGISTRATION'}
                ],
                ASSIGNED_PA: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PA',          value: 'ALLOCATED PA'},
                    {key: 'LIR-PARTITIONED PA',    value: 'LIR-PARTITIONED PA'},
                    {key: 'SUB-ALLOCATED PA',      value: 'SUB-ALLOCATED PA'},
                    {key: 'EARLY-REGISTRATION',    value: 'EARLY-REGISTRATION'},
                    {key: 'ASSIGNED PA',           value: 'ASSIGNED PA'}
                ],
                ASSIGNED_ANYCAST: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PI',          value: 'ALLOCATED PI'}
                ],
                EARLY_REGISTRATION: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'EARLY-REGISTRATION',    value: 'EARLY-REGISTRATION'}
                ],
                ASSIGNED_PI: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PI',          value: 'ALLOCATED PI'},
                    {key: 'LIR-PARTITIONED PI',    value: 'LIR-PARTITIONED PI'},
                    {key: 'EARLY-REGISTRATION',    value: 'EARLY-REGISTRATION'},
                    {key: 'ASSIGNED PI',           value: 'ASSIGNED PI'}
                ],
                LEGACY: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'LEGACY',                value: 'LEGACY'}
                ]
            }
        };
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
                    {key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA'},
                    {key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI'},
                    {key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA'},
                    {key: 'ASSIGNED PA', value: 'ASSIGNED PA'},
                    {key: 'ASSIGNED PI', value: 'ASSIGNED PI'},
                    {key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST'},
                    {key: 'EARLY-REGISTRATION', value: 'EARLY-REGISTRATION'},
                    {key: 'NOT-SET', value: 'NOT-SET'},
                    {key: 'LEGACY', value: 'LEGACY'}
                ],
                'ALLOCATED PI': [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'}
                ],
                'ALLOCATED PA': [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'}
                ],
                'ALLOCATED UNSPECIFIED': [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'}
                ],
                'LIR-PARTITIONED PA': [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PA', value: 'ALLOCATED PA'},
                    {key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA'},
                    {key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA'},
                    {key: 'EARLY-REGISTRATION', value: 'EARLY-REGISTRATION'}
                ],
                'LIR-PARTITIONED PI': [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PI', value: 'ALLOCATED PI'},
                    {key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI'},
                    {key: 'EARLY-REGISTRATION', value: 'EARLY-REGISTRATION'}
                ],
                'SUB_ALLOCATED PA': [
                    {key: 'ALLOCATED PA', value: 'ALLOCATED PA'},
                    {key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA'},
                    {key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA'},
                    {key: 'EARLY-REGISTRATION', value: 'EARLY-REGISTRATION'}
                ],
                'ASSIGNED PA': [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PA', value: 'ALLOCATED PA'},
                    {key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA'},
                    {key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA'},
                    {key: 'EARLY-REGISTRATION', value: 'EARLY-REGISTRATION'},
                    {key: 'ASSIGNED PA', value: 'ASSIGNED PA'}
                ],
                'ASSIGNED ANYCAST': [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PI', value: 'ALLOCATED PI'}
                ],
                'EARLY-REGISTRATION': [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'EARLY-REGISTRATION', value: 'EARLY-REGISTRATION'}
                ],
                'ASSIGNED PI': [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'ALLOCATED PI', value: 'ALLOCATED PI'},
                    {key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI'},
                    {key: 'EARLY-REGISTRATION', value: 'EARLY-REGISTRATION'},
                    {key: 'ASSIGNED PI', value: 'ASSIGNED PI'}
                ],
                LEGACY: [
                    {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                    {key: 'LEGACY', value: 'LEGACY'}
                ]
            },
            inet6num: {
                default: [
                    {key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR'},
                    {key: 'ALLOCATED-BY-LIR', value: 'ALLOCATED-BY-LIR'},
                    {key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR'},
                    {key: 'ASSIGNED', value: 'ASSIGNED'},
                    {key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST'},
                    {key: 'ASSIGNED PI', value: 'ASSIGNED PI'}
                ],
                'ALLOCATED-BY-RIR': [
                    {key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR'}
                ],
                'ALLOCATED-BY-LIR': [
                    {key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR'},
                    {key: 'ALLOCATED-BY-LIR', value: 'ALLOCATED-BY-LIR'}
                ],
                'AGGREGATED-BY-LIR': [
                    {key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR'},
                    {key: 'ALLOCATED-BY-LIR', value: 'ALLOCATED-BY-LIR'},
                    {key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR'}
                ],
                ASSIGNED: [
                    {key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR'},
                    {key: 'ALLOCATED-BY-LIR', value: 'ALLOCATED-BY-LIR'},
                    {key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR'}
                ],
                'ASSIGNED ANYCAST': [
                    {key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR'}
                ],
                'ASSIGNED PI': [
                    {key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR'}
                ]
            }
        };
        
        this.get = function (objectType, parentState) {
            if (!objectType || !statuses[objectType]) {
                return [];
            }
            var list = statuses[objectType][parentState || 'default'];
            if (!list) {
                $log.warn('No list of states found for ' + objectType + ' with parent ' + parentState);
                // if no match on parentState then return default
                list = statuses[objectType]['default'] || [];
            }
            return list;
        }
    }]);

})();
