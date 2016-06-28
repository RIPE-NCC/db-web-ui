'use strict';

angular.module('updates')
    .factory('RestService', ['$resource', '$q', '$http', '$templateCache', '$log', 'WhoisResources', 'WebUpdatesCommons',
        function ($resource, $q, $http, $templateCache, $log, WhoisResources, WebUpdatesCommons) {

            function RestService() {

                this.fetchParentResource = function(objectType, qs) {
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

                this.fetchUiSelectResources = function () {
                    return $q.all([
                        // workaround to cope with order of loading problem
                        $http.get('selectize/match-multiple.tpl.html', {cache: $templateCache}),
                        $http.get('selectize/select-multiple.tpl.html', {cache: $templateCache})
                    ]);
                };

                this.getReferences = function (source, objectType, name, limit) {
                    var deferredObject = $q.defer();

                    $log.debug('getReferences start for objectType: ' + objectType + ' and objectName: ' + name);

                    $resource('api/references/:source/:objectType/:name',
                        {
                            source: source,
                            objectType: objectType,
                            name: encodeURIComponent(name), // NOTE: we perform double encoding of forward slash (%2F ->%252F) to make spring MVC happy
                            limit: limit
                        }).get()
                        .$promise.then(
                        function(result) {
                            $log.debug('getReferences success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function(error) {
                            $log.debug('getReferences error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

                this.fetchMntnersForSSOAccount = function () {
                    var deferredObject = $q.defer();

                    $log.debug('fetchMntnersForSSOAccount start');

                    $resource('api/user/mntners')
                        .query()
                        .$promise
                        .then(function (result) {
                            $log.debug('fetchMntnersForSSOAccount success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('fetchMntnersForSSOAccount error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                };

                this.detailsForMntners = function (mntners) {
                    var promises = _.map(mntners, function (item) {
                        return _singleMntnerDetails(item);
                    });

                    return $q.all(promises);
                };

                function _singleMntnerDetails(mntner) {
                    var deferredObject = $q.defer();

                    $log.debug('_singleMntnerDetails: ' + JSON.stringify(mntner));

                    $resource('api/whois/autocomplete',
                        {
                            query: mntner.key,
                            field: 'mntner',
                            attribute: 'auth',
                            extended: true
                        })
                        .query()
                        .$promise
                        .then(function (result) {
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

                            $log.debug('_singleMntnerDetails success:' + JSON.stringify(found));
                            deferredObject.resolve(found);
                        }, function (error) {
                            $log.error('_singleMntnerDetails error:' + JSON.stringify(error));
                            deferredObject.reject(error);
                        }
                    );

                    return deferredObject.promise;
                }

                this.autocomplete = function ( attrName, query, extended, attrsToBeReturned) {
                    var deferredObject = $q.defer();

                    if( _.isUndefined(query) || query.length < 2 ) {
                        deferredObject.resolve([]);
                    } else {
                        $log.debug('autocomplete start for: ' + attrName + ' that is like ' + query );

                        $resource('api/whois/autocomplete',
                            {
                                field: attrName,
                                attribute: attrsToBeReturned,
                                query: query,
                                extended: extended
                            })
                            .query()
                            .$promise
                            .then(function (result) {
                                $log.debug('autocomplete success:' + JSON.stringify(result));
                                deferredObject.resolve(result);
                            }, function (error) {
                                $log.error('autocomplete error:' + JSON.stringify(error));
                                deferredObject.reject(error);
                            }
                        );
                    }

                    return deferredObject.promise;
                };

                this.autocompleteAdvanced = function (query, targetObjectTypes ) {
                    var deferredObject = $q.defer();

                    if( _.isUndefined(query) || query.length < 2 ) {
                        deferredObject.resolve([]);
                    } else {
                        var attrsToFilterOn = WhoisResources.getFilterableAttrsForObjectTypes(targetObjectTypes);
                        var attrsToReturn = WhoisResources.getViewableAttrsForObjectTypes(targetObjectTypes); //['person', 'role', 'org-name', 'abuse-mailbox'];

                        $log.debug('autocompleteAdvanced start: ' +
                            ' select: ' + JSON.stringify(attrsToReturn) +
                            ' from: '   + JSON.stringify(targetObjectTypes) +
                            ' where: '  + JSON.stringify(attrsToFilterOn) +
                            ' like:'    + JSON.stringify(query));

                        $resource('api/whois/autocomplete',
                            {
                                select: attrsToReturn,
                                from: targetObjectTypes,
                                where: attrsToFilterOn,
                                like: query
                            })
                            .query()
                            .$promise
                            .then(function (result) {
                                $log.debug('autocompleteAdvanced success:' + JSON.stringify(result));
                                deferredObject.resolve(result);
                            }, function (error) {
                                $log.error('autocompleteAdvanced error:' + JSON.stringify(error));
                                deferredObject.reject(error);
                            }
                        );
                    }

                    return deferredObject.promise;
                };

                this.authenticate = function (method, source, objectType, objectName, passwords) {
                    var deferredObject = $q.defer();

                    $log.debug('authenticate start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:objectName',
                        {
                            source: source,
                            objectType: objectType,
                            objectName: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
                            unfiltered: true,
                            password: '@password'
                        }).get({password: passwords})
                        .$promise
                        .then(function (result) {
                            $log.debug('authenticate success:' + JSON.stringify(result));
                            deferredObject.resolve(WhoisResources.wrapSuccess(result));
                        }, function (error) {
                            $log.error('authenticate error:' + JSON.stringify(error));
                            deferredObject.reject(WhoisResources.wrapError(error));
                        }
                    );

                    return deferredObject.promise;
                };

                this.fetchObject = function (source, objectType, objectName, passwords, unformatted) {
                    var deferredObject = $q.defer();

                    $log.debug('fetchObject start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:name',
                        {
                            source: source,
                            objectType: objectType,
                            name: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
                            unfiltered: true,
                            password: '@password',
                            unformatted: unformatted
                        }).get({password: passwords})
                        .$promise
                        .then(function (result) {
                            $log.debug('fetchObject success:' + JSON.stringify(result));

                            var primaryKey = WhoisResources.wrapSuccess(result).getPrimaryKey();
                            if(_.isEqual(objectName, primaryKey)) {
                                deferredObject.resolve(WhoisResources.wrapSuccess(result));
                            } else {
                                WebUpdatesCommons.navigateToEdit(source, objectType, primaryKey);
                            }

                        }, function (error) {
                            $log.error('fetchObject error:' + JSON.stringify(error));
                            deferredObject.reject(WhoisResources.wrapError(error));
                        }
                    );

                    return deferredObject.promise;
                };

                this.createObject = function (source, objectType, attributes, passwords, overrides, unformatted) {
                    var deferredObject = $q.defer();

                    $log.debug('createObject start for objectType: ' + objectType + ' and payload:' + JSON.stringify(attributes));

                    $resource('api/whois/:source/:objectType',
                        {
                            source: source,
                            objectType: objectType,
                            password: '@password',
                            override: '@override',
                            unformatted: '@unformatted'
                        })
                        .save({password: passwords, override: overrides, unformatted: unformatted}, attributes)
                        .$promise
                        .then(function (result) {
                            $log.debug('createObject success:' + JSON.stringify(result));
                            deferredObject.resolve(WhoisResources.wrapSuccess(result));
                        }, function (error) {
                            $log.error('createObject error:' + JSON.stringify(error));
                            deferredObject.reject(WhoisResources.wrapError(error));
                        }
                    );

                    return deferredObject.promise;
                };

                this.modifyObject = function (source, objectType, objectName, attributes, passwords, overrides, unformatted) {
                    var deferredObject = $q.defer();

                    $log.debug('modifyObject start for objectType: ' + objectType + ' and objectName: ' + objectName);
                    $log.debug('body: ' + JSON.stringify(attributes));

                    /*
                     * A url-parameter starting with an '@' has special meaning in angular.
                     * Since passwords can start with a '@', we need to take special precautions.
                     * The following '@password'-trick  seems to work.
                     * TODO This needs more testing.
                     */
                    $resource('api/whois/:source/:objectType/:name',
                        {
                            source: source,
                            objectType: objectType,
                            name: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
                            password: '@password',
                            override: '@override',
                            unformatted: '@unformatted'
                        },
                        {'update': {method: 'PUT'}})
                        .update({password: passwords, override: overrides, unformatted: unformatted}, attributes)
                        .$promise
                        .then(function (result) {
                            $log.debug('modifyObject success:' + JSON.stringify(result));
                            deferredObject.resolve(WhoisResources.wrapSuccess(result));
                        }, function (error) {
                            $log.error('modifyObject error:' + JSON.stringify(error));
                            deferredObject.reject(WhoisResources.wrapError(error));
                        }
                    );

                    return deferredObject.promise;
                };

                this.associateSSOMntner = function (source, objectType, objectName, whoisResources, passwords) {
                    var deferredObject = $q.defer();

                    $log.debug('associateSSOMntner start for objectType: ' + objectType + ' and objectName: ' + objectName);

                    $resource('api/whois/:source/:objectType/:name?password=:password',
                        {
                            source: source,
                            objectType: objectType,
                            name: objectName,  // only for mntners so no url-decosong applied
                            password: '@password'
                        },
                        {update: {method: 'PUT'}})
                        .update({password: passwords}, whoisResources)
                        .$promise
                        .then(function (result) {
                            $log.debug('associateSSOMntner success:' + JSON.stringify(result));
                            deferredObject.resolve(WhoisResources.wrapSuccess(result));
                        }, function (error) {
                            $log.error('associateSSOMntner error:' + JSON.stringify(error));
                            deferredObject.reject(WhoisResources.wrapError(error));
                        }
                    );
                    return deferredObject.promise;
                };

                this.deleteObject = function (source, objectType, name, reason, withReferences, passwords, dryRun) {
                    var deferredObject = $q.defer();

                    var service = withReferences ? 'references' : 'whois';
                    if(_.isUndefined(dryRun)) {
                        dryRun = false;
                    }

                    $log.debug('deleteObject start for service:' + service + ' objectType: ' + objectType + ' and objectName: ' + name +
                        ' reason:' + reason + ' with-refs:' + withReferences);

                    $resource('api/' + service + '/:source/:objectType/:name',
                        {
                            source: source,
                            objectType: objectType,
                            name: name, // Note: double encoding not needed for delete
                            password: '@password',
                            'dry-run': dryRun
                        }).delete({password: passwords, reason: reason})
                        .$promise.then(
                        function (result) {
                            $log.debug('deleteObject success:' + JSON.stringify(result));
                            deferredObject.resolve(WhoisResources.wrapSuccess(result));
                        }, function (error) {
                            $log.error('deleteObject error:' + JSON.stringify(error));
                            deferredObject.reject(WhoisResources.wrapError(error));
                        }
                    );

                    return deferredObject.promise;
                };

                this.createPersonMntner = function (source, multipleWhoisObjects) {
                    var deferredObject = $q.defer();

                    $log.debug('createPersonMntner start for source: ' + source + ' with attrs ' + JSON.stringify(multipleWhoisObjects));

                    $resource('api/references/:source',
                        {source: source})
                        .save(multipleWhoisObjects)
                        .$promise
                        .then(function (result) {
                            $log.debug('createPersonMntner success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('createPersonMntner error:' + JSON.stringify(error));
                            deferredObject.reject(WhoisResources.wrapError(error));
                        }
                    );

                    return deferredObject.promise;
                };


            }
            return new RestService();
        }]);

