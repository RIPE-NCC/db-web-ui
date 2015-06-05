'use strict';

angular.module('interceptors')
  .factory('AuthenticationInterceptor', function ($rootScope, $q, $location, $window, LOGIN_URL) {

    return {
        responseError: function (response) {
            if(response.status === 401) {
                var redirectLocation = LOGIN_URL;
                if (!_.isUndefined($location.absUrl())) {
                    redirectLocation += '?originalUrl=' + $location.absUrl();
                }

                $window.location.href = redirectLocation;
            }
            return $q.reject(response);
        }

    }})
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthenticationInterceptor');
  });
