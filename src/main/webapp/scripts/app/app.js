'use strict';

angular.module('dbWebApp', ['ngRoute'])
.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/whoisobject/select', {
        templateUrl: 'scripts/app/select.html',
        controller: 'SelectController'
      }).
      when('/whoisobject/create/:objectType/:source', {
        templateUrl: 'scripts/app/create.html',
        controller: 'CreateController'
      }).
      when('/whoisobject/modify/:objectType/:objectUid', {
        templateUrl: 'modify.html',
        controller: 'ModifyController'
      }).
      when('/whoisobject/display/:objectType/:objectUid', {
        templateUrl: 'scripts/app/display.html',
        controller: 'DisplayController'
      }).
      otherwise({
        redirectTo: '/whoisobject/select'
      });
  }]);