'use strict';
/**
 */
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
            'aut-num': [
                {key: 'ASSIGNED', value: 'ASSIGNED'},
                {key: 'LEGACY',   value: 'LEGACY'},
                {key: 'OTHER',    value: 'OTHER'}
            ],
            inetnum: [
                {key: 'ALLOCATED PA',          value: 'ALLOCATED PA'},
                {key: 'ALLOCATED PI',          value: 'ALLOCATED PI'},
                {key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED'},
                {key: 'LIR-PARTITIONED PA',    value: 'LIR-PARTITIONED PA'},
                {key: 'LIR-PARTITIONED PI',    value: 'LIR-PARTITIONED PI'},
                {key: 'SUB-ALLOCATED PA',      value: 'SUB-ALLOCATED PA'},
                {key: 'ASSIGNED PA',           value: 'ASSIGNED PA'},
                {key: 'ASSIGNED PI',           value: 'ASSIGNED PI'},
                {key: 'ASSIGNED ANYCAST',      value: 'ASSIGNED ANYCAST'},
                {key: 'EARLY-REGISTRATION',    value: 'EARLY-REGISTRATION'},
                {key: 'NOT-SET',               value: 'NOT-SET'},
                {key: 'LEGACY',                value: 'LEGACY'}
            ],
            inet6num: [
                {key: 'ALLOCATED-BY-RIR',  value: 'ALLOCATED-BY-RIR'},
                {key: 'ALLOCATED-BY-LIR',  value: 'ALLOCATED-BY-LIR'},
                {key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR'},
                {key: 'ASSIGNED',          value: 'ASSIGNED'},
                {key: 'ASSIGNED ANYCAST',  value: 'ASSIGNED ANYCAST'},
                {key: 'ASSIGNED PI',       value: 'ASSIGNED PI'}
            ]
        };

        this.get = function (type, parentStatus) {
            if (!parentStatus) {
                return statuses[type];
            } else {
                return states[type][parentStatus];
            }
        }
    }]);
