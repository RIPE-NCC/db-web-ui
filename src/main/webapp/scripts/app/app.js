'use strict';

angular.module('dbWebApp', [
    'ui.router',
    'ngResource',
    'webUpdates',
    'interceptors'])
.config(function ($stateProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $stateProvider
        .state('error', {
            url: '/public/error',
            templateUrl: 'scripts/app/views/error.html'
        });
})
.run(function ($rootScope, $state, ERROR_EVENTS) {
    $rootScope.$on(ERROR_EVENTS.serverError, function () {
        $state.go('error');
    });
})
.factory('MessageBus', function(){
    var messages = {};

    messages.add = function(key, value){
        messages[key] = value;
    };

    messages.get = function(key){
        var value = messages[key];
        delete messages[key];
        return value;
    };

    return messages;
});

