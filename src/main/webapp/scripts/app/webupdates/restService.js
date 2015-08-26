'use strict';

angular.module('dbWebApp')
    .factory('RestService', ['$resource', '$q', '$http', '$templateCache', '$log',
        function ($resource, $q, $http, $templateCache, $log) {

            function RestService() {

                this.getReferences = function(source, objectType, name) {
                    return $resource('api/references/:source/:objectType/:name',
                        {source: source, objectType: objectType, name: name}).get().$promise;

                };

                this.deleteObject = function(source, objectType, name, reason, withReferences) {
                    var service = withReferences ? 'references' : 'whois';

                    return $resource('api/'+service+'/:source/:objectType/:name', {source: source, objectType: objectType, name: name}).delete({reason: reason}).$promise;
                };

                this.createPersonMntner = function(source, attributes) {

                    var deferredObject = $q.defer();

                    $log.info('createPersonMntner start for source: ' + source + ' with attrs ' + JSON.stringify(attributes));

                    $resource('api/references/:source',
                        {source: source})
                        .save(attributes)
                        .$promise
                        .then(function (result) {
                            $log.info('createPersonMntner success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('createPersonMntner error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

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
                            $log.error('fetchMntnersForSSOAccount error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

                this.detailsForMntners = function (mntners) {
                    $log.info('detailsForMultipleMntners start for: ' + JSON.stringify(mntners));

                    var promises = _.map(mntners, function (item) {
                        return _mntnerDetails(item);
                    });

                    return $q.all(promises);
                };

                function _mntnerDetails(mntner) {
                    var deferredObject = $q.defer();

                    $log.info('_myMntnerDetails start for: ' +  JSON.stringify(mntner));

                    $resource('api/whois/autocomplete',
                        {query: mntner.key, field: 'mntner', attribute: 'auth', extended:true})
                        .query()
                        .$promise
                        .then(function (result) {
                            // enrich with mine
                            result = _.map(result, function( item ) {
                                if( item.key === mntner.key && mntner.mine === true ) {
                                    item.mine = true;
                                }
                                return item;
                            });
                            if(_.isEmpty(result)) {
                                // better something than nothing:
                                // in case search-index does not yet know this newly created mntner
                                result = [mntner];
                            }
                            $log.info('_myMntnerDetails success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('_myMntnerDetails error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );
                    return deferredObject.promise;
                }

                this.autocomplete = function (objectType, objectName, extended, attrs) {
                    var deferredObject = $q.defer();

                    $log.info('autocomplete start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/autocomplete',
                        {query: objectName, field: objectType, attribute: attrs, extended: extended})
                        .query()
                        .$promise
                        .then(function (result) {
                            $log.info('autocomplete success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('autocomplete error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );
                    return deferredObject.promise;
                };

                this.authenticate = function (source, objectType, objectName, password) {
                    var deferredObject = $q.defer();

                    $log.info('authenticate start for objectType: ' + objectType + ' and objectName: ' + objectName);

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
                            $log.error('authenticate error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

                this.fetchObject = function (source, objectType, objectName, password) {
                    var deferredObject = $q.defer();

                    $log.info('fetchObject start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:name',
                        {source: source, objectType: objectType, name: objectName, password: password, unfiltered: true})
                        .get()
                        .$promise
                        .then(function (result) {
                            $log.info('fetchObject success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('fetchObject error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

                this.createObject = function (source, objectType, attributes, password) {
                    var deferredObject = $q.defer();

                    $log.info('createObject start for objectType: ' + objectType);

                    $resource('api/whois/:source/:objectType',
                        {source: source, objectType: objectType, password: password})
                        .save(attributes)
                        .$promise
                        .then(function (result) {
                            $log.info('createObject success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('createObject error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

                this.modifyObject = function (source, objectType, objectName, attributes, password) {
                    var deferredObject = $q.defer();

                    $log.info('modifyObject start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:name',
                        {source: source, objectType: objectType, name: objectName, password: password},
                        {'update': {method: 'PUT'}})
                        .update(attributes)
                        .$promise
                        .then(function (result) {
                            $log.info('modifyObject success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('modifyObject error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

                this.associateSSOMntner = function (source, objectType, objectName, whoisResources, password) {
                    var deferredObject = $q.defer();

                    $log.info('associateSSOMntner start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:name',
                        {source: source, objectType: objectType, name: objectName, password: password},
                        {'update': {method: 'PUT'}})
                        .update(whoisResources)
                        .$promise
                        .then(function (result) {
                            $log.info('associateSSOMntner success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('associateSSOMntner error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );
                    return deferredObject.promise;
                };
            }

            return new RestService();
        }]);

