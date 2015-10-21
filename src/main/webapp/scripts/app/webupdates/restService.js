'use strict';

angular.module('dbWebApp')
    .factory('RestService', ['$resource', '$q', '$http', '$templateCache', '$log',
        function ($resource, $q, $http, $templateCache, $log) {

            function RestService() {

                this.getReferences = function(source, objectType, name, limit) {
                    var deferredObject = $q.defer();

                    $log.info('getReferences start for objectType: ' + objectType + ' and objectName: ' + name);

                    $resource('api/references/:source/:objectType/:name',
                        {   source: source,
                            objectType: objectType,
                            name: encodeURIComponent(name), // TODO perform double encoding of forward slash (%2F ->%252F) to make spring MVC happy
                            limit:limit
                        }).get()
                        .$promise.then(
                        function(result) {
                            $log.info('getReferences success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function(error) {
                            $log.info('getReferences error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

                this.deleteObject = function(source, objectType, name, reason, withReferences, passwords) {
                    var deferredObject = $q.defer();

                    var service = withReferences ? 'references' : 'whois';

                    $log.info('deleteObject start for service:' + service + ' objectType: ' + objectType + ' and objectName: ' + name +
                        ' reason:' + reason + ' with-refs:' + withReferences);

                    $resource('api/'+service+'/:source/:objectType/:name',
                        {   source: source,
                            objectType: objectType,
                            name: name, // Note: double encoding not needed for delete
                            password: passwords
                        }).delete({reason: reason})
                        .$promise.then(
                        function (result) {
                            $log.info('deleteObject success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('deleteObject error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

                this.createPersonMntner = function(source, multipleWhoisObjects ) {
                    var deferredObject = $q.defer();

                    $log.info('createPersonMntner start for source: ' + source + ' with attrs ' + JSON.stringify(multipleWhoisObjects));

                    $resource('api/references/:source',
                        {source: source})
                        .save(multipleWhoisObjects)
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
                    $log.info('detailsForMntners start for: ' + JSON.stringify(mntners));

                    var promises = _.map(mntners, function (item) {
                        return _mntnerDetails(item);
                    });

                    return $q.all(promises);
                };

                function _mntnerDetails(mntner) {
                    var deferredObject = $q.defer();

                    $log.info('_mntnerDetails start for: ' +  JSON.stringify(mntner));

                    $resource('api/whois/autocomplete',
                        {   query: mntner.key,
                            field: 'mntner',
                            attribute: 'auth',
                            extended:true})
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
                            $log.info('_mntnerDetails success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('_mntnerDetails error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                }

                this.autocomplete = function (objectType, objectName, extended, attrs) {
                    var deferredObject = $q.defer();

                    $log.info('autocomplete start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/autocomplete',
                        {   query: objectName,
                            field: objectType,
                            attribute: attrs,
                            extended: extended})
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

                this.authenticate = function (source, objectType, objectName, passwords) {
                    var deferredObject = $q.defer();

                    $log.info('authenticate start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:objectName',
                        {
                            source: source,
                            objectType: objectType,
                            objectName: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
                            unfiltered: true,
                            password: passwords
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

                this.fetchObject = function (source, objectType, objectName, passwords) {
                    var deferredObject = $q.defer();

                    $log.info('fetchObject start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:name',
                        {   source: source,
                            objectType: objectType,
                            name: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
                            password: passwords,
                            unfiltered: true})
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

                this.createObject = function (source, objectType, attributes, passwords) {
                    var deferredObject = $q.defer();

                    $log.info('createObject start for objectType: ' + objectType);

                    $resource('api/whois/:source/:objectType',
                        {   source: source,
                            objectType: objectType,
                            password: passwords})
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

                this.modifyObject = function (source, objectType, objectName, attributes, passwords) {
                    var deferredObject = $q.defer();

                    $log.info('modifyObject start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:name',
                        {   source: source,
                            objectType: objectType,
                            name: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
                            password: passwords},
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

                this.associateSSOMntner = function (source, objectType, objectName, whoisResources, passwords) {
                    var deferredObject = $q.defer();

                    $log.info('associateSSOMntner start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:name',
                        {   source: source,
                            objectType: objectType,
                            name: objectName,  // only for mntners so no url-decosong applied
                            password: passwords},
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

