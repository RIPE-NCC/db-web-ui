'use strict';

angular.module('dbWebApp', [
    'ui.router',
    'ngResource',
    'ngSanitize',
    'webUpdates',
    'interceptors',
    'angulartics',
    'angulartics.google.tagmanager',
    'diff-match-patch',
    'ui.bootstrap',
    'ui.select'])
.config(['$stateProvider', '$analyticsProvider', '$httpProvider', function ($stateProvider, $analyticsProvider, $httpProvider) {
        $stateProvider
        .state('error', {
            url: '/public/error',
            templateUrl: 'scripts/app/views/error.html'
        })
        .state('notFound', {
            url: '/public/not-found',
            templateUrl: 'scripts/app/views/notFound.html'
        });

        //$analyticsProvider.developerMode(true);
        //$analyticsProvider.firstPageview(true);

        // Always tell server if request was made using ajax
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

    }])
.run(['$rootScope', '$state', '$window', '$location', '$log', 'ERROR_EVENTS', 'LOGIN_URL',
        function ($rootScope, $state, $window, $location, $log, ERROR_EVENTS, LOGIN_URL) {

    $rootScope.$on(ERROR_EVENTS.stateTransitionError, function (event, toState, toParams, fromState, fromParams, err) {
        $log.error('Error transitioning to state:' + JSON.stringify(toState) + ' due to error ' + JSON.stringify(err) );

        if( err.status === 403 ) {
            // redirect to crowd login screen
            var returnUrl = $location.absUrl().split('#')[0] + $state.href(toState, toParams);
            var crowdUrl = LOGIN_URL + '?originalUrl=' + encodeURI(returnUrl);
            $log.info('Force crowd login:' + crowdUrl );
            $window.location.href = crowdUrl;
        }
    });

    $rootScope.$on(ERROR_EVENTS.serverError, function () {
        $state.go('error');
    });

    $rootScope.$on(ERROR_EVENTS.notFound, function () {
        $state.go('notFound');
    });

    $rootScope.$on(ERROR_EVENTS.authenticationError, function () {
        $log.error('Authentication error' );
    });

}]);
