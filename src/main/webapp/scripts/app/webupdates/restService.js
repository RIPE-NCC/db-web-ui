'use strict';

angular.module('dbWebApp')
    .factory('RestService', ['$resource', '$q', '$http', '$templateCache', function ($resource, $q, $http, $templateCache) {
        function RestService() {

            this.fetchUiSelectResources = function () {
                return $q.all([
                    // workaround to cope with order of loading problem
                    $http.get('selectize/match-multiple.tpl.html', {cache: $templateCache}),
                    $http.get('selectize/select-multiple.tpl.html', {cache: $templateCache})
                ]);
            };

            this.getMntner = function () {
                var deferredObject = $q.defer();

                $resource('api/user/mntners')
                    .query()
                    .$promise
                    .then(function (result) {
                        console.log("getMntner success:" + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        console.log("getMntner error:" + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.mntnerDetails = function (mntnerName) {
                var deferredObject = $q.defer();

                $resource('api/whois/autocomplete',
                    {query: mntnerName, field: 'mntner', attribute: 'auth'})
                    .query()
                    .$promise
                    .then(function (result) {
                        console.log("autocomplete success:" + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        console.log("autocomplete error:" + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );
                return deferredObject.promise;
            };

            this.autocomplete = function (objectType, objectName, attrs) {
                var deferredObject = $q.defer();

                $resource('api/whois/autocomplete',
                    {query: objectName, field: objectType, attribute: attrs, extended: true})
                    .query()
                    .$promise
                    .then(function (result) {
                        console.log("autocomplete success:" + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        console.log("autocomplete error:" + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );
                return deferredObject.promise;
            };

            this.authenticate = function (source, objectType, objectName, password) {
                var deferredObject = $q.defer();

                $resource('api/whois/:source/:objectType/:objectName',
                    {
                        source: source,
                        objectType: objectType,
                        objectName: objectName,
                        unfiltered: true,
                        password: password
                    }).get()
                    .$promise
                    .then(function (result) {
                        console.log("authenticate success:" + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        console.log("authenticate error:" + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.fetchObject = function (source, objectType, objectName) {
                var deferredObject = $q.defer();

                $resource('api/whois/:source/:objectType/:name',
                    {source: source, objectType: objectType, name: objectName, unfiltered: true})
                    .get()
                    .$promise
                    .then(function (result) {
                        console.log("createObject success:" + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        console.log("createObject error:" + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.createObject = function (source, objectType, attributes) {
                var deferredObject = $q.defer();

                $resource('api/whois/:source/:objectType',
                    {source: source, objectType: objectType, password: password})
                    .save(attributes)
                    .$promise
                    .then(function (result) {
                        console.log("createObject success:" + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        console.log("createObject error:" + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.modifyObject = function (source, objectType, objectName, attributes, password) {
                var deferredObject = $q.defer();

                $resource('api/whois/:source/:objectType/:name',
                    {source: source, objectType: objectType, name: objectName, password: password},
                    {'update': {method: 'PUT'}})
                    .update(attributes)
                    .$promise
                    .then(function (result) {
                        console.log("modifyObject success:" + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        console.log("modifyObject error:" + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.associateSSOMntner = function (source, objectType, objectName, password) {
                var deferredObject = $q.defer();

                $resource('api/whois/:source/:objectType/:name',
                    {source: source, objectType: objectType, name: objectName, password: password},
                    {'update': {method: 'PUT'}})
                    .update()
                    .$promise
                    .then(function (result) {
                        console.log("Autocomplete success:" + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        console.log("Autocomplete error:" + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );
                return deferredObject.promise;

            };
        }

        return new RestService();
}]);
