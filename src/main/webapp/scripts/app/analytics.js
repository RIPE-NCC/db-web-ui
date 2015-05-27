(function(window, angular) {
    'use strict';
    angular.module('Analytic.module', ['Analytic.services']).
        run(function($rootScope, $window, $location, GoogleTagManager) {
            $rootScope.$on('$viewContentLoaded', function() {
                var path= $location.path(),
                    absUrl = $location.absUrl(),
                    virtualUrl = absUrl.substring(absUrl.indexOf(path));
                GoogleTagManager.push({ event: 'virtualPageView', virtualUrl: virtualUrl });
            });
        });
})(window, window.angular);

(function() {
    angular.module('Analytic.services', []).
        service('GoogleTagManager', function($window) {
            this.push = function(data) {
                try {
                    $window.dataLayer.push(data);
                } catch (e) {}
            };
        });
})();