'use strict';

angular.module('dbWebApp', [
    'ui.router',
    'ngResource',
    'webUpdates'])
.config(function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});

