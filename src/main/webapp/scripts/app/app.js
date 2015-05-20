'use strict';

angular.module('dbWebuiApp', ['ui.router'])
.config(function ($stateProvider) {

    $stateProvider
        .state('select', {
            url: '/select',
            templateUrl: 'scripts/app/select.html',
            controller: 'CreateController'
        });
});
