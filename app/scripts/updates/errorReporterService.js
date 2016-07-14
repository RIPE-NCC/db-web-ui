/*global angular*/

(function () {
    'use strict';

    angular.module('updates').service('ErrorReporterService', ['$log', '$location', '$analytics', function ($log, $location, $analytics) {
        
        this.log = function (operation, objectType, globalErrors, attributes) {
            _.each(globalErrors, function (item) {
                $log.error('url:' + $location.path() + ', operation:' + operation + ', objectType: ' + objectType + ', description: ' + item.plainText);
                $analytics.eventTrack('FormSubmitAction', {category: 'Form Validation Error', label: objectType, value: item.plainText});

            });
            _.each(attributes, function (item) {
                if (!_.isUndefined(item.$$error)) {
                    $log.error('url:' + $location.path() + ', operation:' + operation + ', objectType: ' + objectType + ', attributeType: ' + item.name + ', description: ' + item.$$error);
                    $analytics.eventTrack('FormSubmitAction', {category: 'Form Validation Error', label: objectType + '.' + item.name, value: item.$$error});
                }
            });
        };

    }]);

})();
