'use strict';

angular.module('fmp', ['dbWebApp'])
    .constant(
        'FMP_STATE', {
            FMP_FIND: 'fmp.find',
            FMP_VOLUNTARY: 'fmp.voluntary',
            FMP_LEGACY: 'fmp.legacy',
            FMP_CONFIRM: 'fmp.confirm'
        });
