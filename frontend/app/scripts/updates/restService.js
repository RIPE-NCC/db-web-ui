/*global _, angular*/
(function () {
    'use strict';

    angular.module('updates')
        .factory('RestService', ['$resource', '$q', '$http', '$templateCache', '$log', '$state', 'WhoisResources',
            function ($resource, $q, $http, $templateCache, $log, $state, WhoisResources) {

                var restService = {};

                restService.fetchParentResource = function (objectType, qs) {
                    // e.g. https://rest.db.ripe.net/search?flags=lr&type-filter=inetnum&query-string=193.0.4.0%20-%20193.0.4.255
                    if (['inetnum', 'inet6num', 'aut-num'].indexOf(objectType) < 0) {
                        $log.error('Only aut-num, inetnum and inet6num supported');
                        return;
                    }
                    return $resource('api/whois/search', {
                        flags: 'lr',
                        'type-filter': objectType,
                        'query-string': qs,
                        ignore404: true
                    });
                };

                restService.fetchResource = function (objectType, qs) {
                    if (['inetnum', 'inet6num', 'aut-num'].indexOf(objectType) < 0) {
                        $log.error('Only aut-num, inetnum and inet6num supported');
                        return;
                    }
                    return $resource('api/whois/search', {
                        flags: 'r',
                        'type-filter': objectType,
                        'query-string': qs,
                        ignore404: true
                    });
                };

                restService.fetchUiSelectResources = function () {
                    return $q.all([
                        // workaround to cope with order of loading problem
                        $http.get('selectize/match-multiple.tpl.html', {cache: $templateCache}),
                        $http.get('selectize/select-multiple.tpl.html', {cache: $templateCache})
                    ]);
                };

                restService.getReferences = function (source, objectType, name, limit) {
                    var deferredObject = $q.defer();

                    $resource('api/references/:source/:objectType/:name', {
                        source: source.toUpperCase(),
                        objectType: objectType,
                        name: encodeURIComponent(name), // NOTE: we perform double encoding of forward slash (%2F ->%252F) to make spring MVC happy
                        limit: limit
                    }).get().$promise.then(function (result) {
                        $log.debug('getReferences success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.debug('getReferences error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    });
                    return deferredObject.promise;
                };

                restService.fetchMntnersForSSOAccount = function () {
                    var deferredObject = $q.defer();

                    $resource('api/user/mntners')
                        .query().$promise.then(function (result) {
                        $log.debug('fetchMntnersForSSOAccount success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.error('fetchMntnersForSSOAccount error:' + JSON.stringify(error));
                        deferredObject.reject(error);
                    });
                    return deferredObject.promise;
                };

                restService.detailsForMntners = function (mntners) {
                    var promises = _.map(mntners, function (item) {
                        return _singleMntnerDetails(item);
                    });
                    return $q.all(promises);
                };

                function _singleMntnerDetails(mntner) {
                    var deferredObject = $q.defer();

                    $resource('api/whois/autocomplete', {
                        query: mntner.key,
                        field: 'mntner',
                        attribute: 'auth',
                        extended: true
                    }).query().$promise.then(function (result) {
                        var found = _.find(result, function (item) {
                            return item.key === mntner.key;
                        });
                        if (_.isUndefined(found)) {
                            // TODO: the  autocomplete service just returns 10 matching records. The exact match might not be part of this set.
                            // So if this happens, perform best guess and just enrich the existing mntner with md5.
                            mntner.auth = ['MD5-PW'];
                            found = mntner;
                        } else {
                            found.mine = mntner.mine;
                        }

                        $log.debug('_singleMntnerDetails success:' + angular.toJson(found));
                        deferredObject.resolve(found);
                    }, function (error) {
                        $log.error('_singleMntnerDetails error:' + angular.toJson(error));
                        deferredObject.reject(error);
                    });

                    return deferredObject.promise;
                }

                var timeoutA;
                restService.autocomplete = function (attrName, query, extended, attrsToBeReturned) {
                    var deferredObject = $q.defer();

                    function debounce() {
                        if (_.isUndefined(query) || query.length < 2) {
                            deferredObject.resolve([]);
                        } else {
                            $resource('api/whois/autocomplete', {
                                field: attrName,
                                attribute: attrsToBeReturned,
                                query: query,
                                extended: extended
                            }).query().$promise.then(function (result) {
                                $log.debug('autocomplete success:' + JSON.stringify(result));
                                deferredObject.resolve(result);
                            }, function (error) {
                                $log.error('autocomplete error:' + JSON.stringify(error));
                                deferredObject.reject(error);
                            });
                        }
                    }

                    if (timeoutA) {
                        clearTimeout(timeoutA);
                    }
                    timeoutA = setTimeout(debounce, 600);
                    return deferredObject.promise;
                };

                var timeoutAA;
                restService.autocompleteAdvanced = function (query, targetObjectTypes) {
                    var deferredObject = $q.defer();

                    function debounce() {
                        if (_.isUndefined(query) || query.length < 2) {
                            deferredObject.resolve([]);
                        } else {
                            var attrsToFilterOn = WhoisResources.getFilterableAttrsForObjectTypes(targetObjectTypes);
                            var attrsToReturn = WhoisResources.getViewableAttrsForObjectTypes(targetObjectTypes); //['person', 'role', 'org-name', 'abuse-mailbox'];

                            $resource('api/whois/autocomplete', {
                                select: attrsToReturn,
                                from: targetObjectTypes,
                                where: attrsToFilterOn,
                                like: query
                            }).query().$promise.then(function (result) {
                                $log.debug('autocompleteAdvanced success:' + JSON.stringify(result));
                                deferredObject.resolve(result);
                            }, function (error) {
                                $log.error('autocompleteAdvanced error:' + JSON.stringify(error));
                                deferredObject.reject(error);
                            });
                        }
                    }

                    if (timeoutAA) {
                        clearTimeout(timeoutAA);
                    }
                    timeoutAA = setTimeout(debounce, 600);

                    return deferredObject.promise;
                };

                restService.authenticate = function (method, source, objectType, objectName, passwords) {
                    var deferredObject = $q.defer();

                    $resource('api/whois/:source/:objectType/:objectName', {
                        source: source.toUpperCase(),
                        objectType: objectType,
                        objectName: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
                        unfiltered: true,
                        password: '@password'
                    }).get({
                        password: passwords
                    }).$promise.then(function (result) {
                        $log.debug('authenticate success:' + JSON.stringify(result));
                        deferredObject.resolve(WhoisResources.wrapSuccess(result));
                    }, function (error) {
                        $log.error('authenticate error:' + JSON.stringify(error));
                        deferredObject.reject(WhoisResources.wrapError(error));
                    });

                    return deferredObject.promise;
                };

                restService.fetchObject = function (source, objectType, objectName, passwords, unformatted) {
                    var deferredObject = $q.defer();

                    $resource('api/whois/:source/:objectType/:name', {
                        source: source.toUpperCase(),
                        objectType: objectType,
                        name: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
                        unfiltered: true,
                        password: '@password',
                        unformatted: unformatted
                    }).get({
                        password: passwords
                    }).$promise.then(function (result) {
                        $log.debug('fetchObject success:' + JSON.stringify(result));
                        var primaryKey = WhoisResources.wrapSuccess(result).getPrimaryKey();
                        if (_.isEqual(objectName, primaryKey)) {
                            deferredObject.resolve(WhoisResources.wrapSuccess(result));
                        } else {
                            $state.transitionTo('webupdates.modify', {
                                source: source,
                                objectType: objectType,
                                name: primaryKey
                            });
                        }
                    }, function (error) {
                        $log.error('fetchObject error:' + JSON.stringify(error));
                        deferredObject.reject(WhoisResources.wrapError(error));
                    });

                    return deferredObject.promise;
                };

                restService.createObject = function (source, objectType, attributes, passwords, overrides, unformatted) {
                    var deferredObject = $q.defer();

                    $resource('api/whois/:source/:objectType', {
                        source: source.toUpperCase(),
                        objectType: objectType,
                        password: '@password',
                        override: '@override',
                        unformatted: '@unformatted'
                    }).save({
                        password: passwords,
                        override: overrides,
                        unformatted: unformatted
                    }, attributes).$promise.then(function (result) {
                        $log.debug('createObject success:' + JSON.stringify(result));
                        deferredObject.resolve(WhoisResources.wrapSuccess(result));
                    }, function (error) {
                        $log.error('createObject error:' + JSON.stringify(error));
                        deferredObject.reject(WhoisResources.wrapError(error));
                    });

                    return deferredObject.promise;
                };

                restService.modifyObject = function (source, objectType, objectName, attributes, passwords, overrides, unformatted) {
                    var deferredObject = $q.defer();

                    /*
                     * A url-parameter starting with an '@' has special meaning in angular.
                     * Since passwords can start with a '@', we need to take special precautions.
                     * The following '@password'-trick  seems to work.
                     * TODO This needs more testing.
                     */
                    $resource('api/whois/:source/:objectType/:name', {
                        source: source.toUpperCase(),
                        objectType: objectType,
                        name: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
                        password: '@password',
                        override: '@override',
                        unformatted: '@unformatted'
                    }, {
                        'update': {method: 'PUT'}
                    }).update({
                        password: passwords,
                        override: overrides,
                        unformatted: unformatted
                    }, attributes).$promise.then(function (result) {
                        $log.debug('modifyObject success:' + JSON.stringify(result));
                        deferredObject.resolve(WhoisResources.wrapSuccess(result));
                    }, function (error) {
                        $log.error('modifyObject error:' + JSON.stringify(error));
                        deferredObject.reject(WhoisResources.wrapError(error));
                    });

                    return deferredObject.promise;
                };

                restService.associateSSOMntner = function (source, objectType, objectName, whoisResources, passwords) {
                    var deferredObject = $q.defer();

                    var req = {
                        method: 'PUT',
                        url: ['api/whois/', source, '/', objectType, '/', objectName, '?password=', encodeURIComponent(passwords)].join(''),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: whoisResources
                    };

                    $http(req).then(function (result) {
                        $log.debug('associateSSOMntner success:' + JSON.stringify(result));
                        deferredObject.resolve(WhoisResources.wrapSuccess(result));
                    }, function (error) {
                        $log.error('associateSSOMntner error:' + JSON.stringify(error));
                        deferredObject.reject(WhoisResources.wrapError(error));
                    });

                    return deferredObject.promise;
                };

                restService.deleteObject = function (source, objectType, name, reason, withReferences, passwords, dryRun) {
                    var deferredObject = $q.defer();

                    var service = withReferences ? 'references' : 'whois';

                    $resource('api/' + service + '/:source/:objectType/:name', {
                        source: source,
                        objectType: objectType,
                        name: name, // Note: double encoding not needed for delete
                        password: '@password',
                        'dry-run': !!dryRun
                    }).delete({
                        password: passwords,
                        reason: reason
                    }).$promise.then(function (result) {
                        $log.debug('deleteObject success:' + JSON.stringify(result));
                        deferredObject.resolve(WhoisResources.wrapSuccess(result));
                    }, function (error) {
                        $log.error('deleteObject error:' + JSON.stringify(error));
                        deferredObject.reject(WhoisResources.wrapError(error));
                    });

                    return deferredObject.promise;
                };

                restService.createPersonMntner = function (source, multipleWhoisObjects) {
                    var deferredObject = $q.defer();

                    $resource('api/references/:source', {
                        source: source.toUpperCase()
                    }).save(multipleWhoisObjects).$promise.then(function (result) {
                        $log.debug('createPersonMntner success:' + JSON.stringify(result));
                        deferredObject.resolve(result);
                    }, function (error) {
                        $log.error('createPersonMntner error:' + JSON.stringify(error));
                        deferredObject.reject(WhoisResources.wrapError(error));
                    });

                    return deferredObject.promise;
                };

                // And finally....
                return restService;
            }
        ]);

})();
