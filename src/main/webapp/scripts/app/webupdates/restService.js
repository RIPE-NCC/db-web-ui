'use strict';

angular.module('dbWebApp')
    .factory('RestService', ['$resource', '$q', '$http', '$templateCache', '$log',
        function ($resource, $q, $http, $templateCache, $log) {

            function RestService() {

            this.fetchUiSelectResources = function () {
                return $q.all([
                    // workaround to cope with order of loading problem
                    $http.get('selectize/match-multiple.tpl.html', {cache: $templateCache}),
                    $http.get('selectize/select-multiple.tpl.html', {cache: $templateCache})
                ]);
            };

            this.fetchMntnersForSSOAccount = function () {
                var deferredObject = $q.defer();

                $log.info('fetchMntnersForSSOAccount start');

                $resource('api/user/mntners')
                    .query()
                    .$promise
                    .then(function (result) {
                        $log.info('fetchMntnersForSSOAccount success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.info('fetchMntnersForSSOAccount error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.mntnerDetails = function (mntnerName) {
                var deferredObject = $q.defer();

                $log.info('mntnerDetails start for ' + mntnerName);

                $resource('api/whois/autocomplete',
                    {query: mntnerName, field: 'mntner', attribute: 'auth'})
                    .query()
                    .$promise
                    .then(function (result) {
                        $log.info('mntnerDetails success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.info('mntnerDetails error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );
                return deferredObject.promise;
            };

            this.detailsForMultipleMntners = function (mntners) {
                var deferredObject = $q.defer();

                $log.info('detailsForMultipleMntners start for ' + JSON.stringify(mntners));

                var self = this;
                var promises = _.map( mntners, function(item) {
                    $log.info("Fetching for mntner " + item.key);
                    return self.mntnerDetails(item.key);
                })

                return $q.all(promises);
            };

            this.autocomplete = function (objectType, objectName, attrs) {
                var deferredObject = $q.defer();

                $log.info('autocomplete start for objectType' + objectType + ' and objectName ' + objectName);

                $resource('api/whois/autocomplete',
                    {query: objectName, field: objectType, attribute: attrs, extended: true})
                    .query()
                    .$promise
                    .then(function (result) {
                        $log.info('autocomplete success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.info('autocomplete error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );
                return deferredObject.promise;
            };

            this.authenticate = function (source, objectType, objectName, password) {
                var deferredObject = $q.defer();

                $log.info('authenticate start for objectType' + objectType + ' and objectName ' + objectName);

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
                        $log.info('authenticate success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.info('authenticate error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.fetchObject = function (source, objectType, objectName) {
                var deferredObject = $q.defer();

                $log.info('fetchObject start for objectType' + objectType + ' and objectName ' + objectName);

                $resource('api/whois/:source/:objectType/:name',
                    {source: source, objectType: objectType, name: objectName, unfiltered: true})
                    .get()
                    .$promise
                    .then(function (result) {
                        $log.info('createObject success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.info('createObject error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.createObject = function (source, objectType, attributes, password) {
                var deferredObject = $q.defer();

                $log.info('createObject start for objectType' + objectType );

                $resource('api/whois/:source/:objectType',
                    {source: source, objectType: objectType, password: password})
                    .save(attributes)
                    .$promise
                    .then(function (result) {
                        $log.info('createObject success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.info('createObject error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.modifyObject = function (source, objectType, objectName, attributes, password) {
                var deferredObject = $q.defer();

                $log.info('modifyObject start for objectType' + objectType + ' and objectName ' + objectName);

                $resource('api/whois/:source/:objectType/:name',
                    {source: source, objectType: objectType, name: objectName, password: password},
                    {'update': {method: 'PUT'}})
                    .update(attributes)
                    .$promise
                    .then(function (result) {
                        $log.info('modifyObject success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.info('modifyObject error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );

                return deferredObject.promise;
            };

            this.associateSSOMntner = function (source, objectType, objectName, whoisResources, password) {
                var deferredObject = $q.defer();

                $log.info('associateSSOMntner start for objectType' + objectType + ' and objectName ' + objectName);

                $resource('api/whois/:source/:objectType/:name',
                    {source: source, objectType: objectType, name: objectName, password: password},
                    {'update': {method: 'PUT'}})
                    .update(whoisResources)
                    .$promise
                    .then(function (result) {
                        $log.info('associateSSOMntner success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.info('associateSSOMntner error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    }
                );
                return deferredObject.promise;
            };
        }

        return new RestService();
}]);
