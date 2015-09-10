angular.module('dbWebApp')
    .service('ErrorReporterService', ['$log','$location','$analytics', function ($log, $location, $analytics) {
        this.log = function (operation, objectType, globalErrors, attributes) {
            //$analytics.pageTrack('/my/url');
            //$analytics.eventTrack('virtualPageView', { category: 'categoryName' });
            _.each(globalErrors, function(item) {
                $log.error('url:'+ $location.path() + ', operation:' + operation + ', objectType: ' + objectType + ', description: ' + item.plainText);
                $analytics.eventTrack('Form Validation Error', { category: objectType, label: item.$$error });
            });
            _.each(attributes, function(item) {
                if( !_.isUndefined(item.$$error)) {
                    $log.error('url:'+ $location.path() + ', operation:' + operation + ', objectType: ' + objectType + ', attributeType: ' + item.name +  ', description: ' + item.$$error);
                    $analytics.eventTrack('Form Validation Error', { category: objectType + '.' + item.name, label: item.$$error });
                }
            });
        }
    }]);
