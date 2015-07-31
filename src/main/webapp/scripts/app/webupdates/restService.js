'use strict';

angular.module('dbWebApp')
    .factory('RestService', ['$resource', '$q', '$http', '$templateCache', '$log',
        function ($resource, $q, $http, $templateCache, $log) {

            function RestService() {

                this.getReferences = function(source, objectType, name) {
                    return $resource('api/references/:source/:objectType/:name',
                        {source: source, objectType: objectType, name: name}).get().$promise;

                };

                this.deleteObject = function(source, objectType, name, reason) {
                    return $resource('api/whois/:source/:objectType/:name',
                        {source: source, objectType: objectType, name: name}).delete({reason: reason}).$promise;
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


var OBJECT_REFERENCES_RESPONSE = {
    'subset':5,
    'total':11,
    'references':[
        {
            'link':{
                'type':'locator',
                'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO2-MNT'
            },
            'source':{
                'id':'ripe'
            },
            'primaryKey':[
                {
                    'value':'THIAGO2-MNT',
                    'name':'mntner'
                }
            ],
            'attributes':[
                {
                    'value':'THIAGO2-MNT',
                    'name':'mntner'
                },
                {
                    'value':'test',
                    'name':'descr'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/person/DW-RIPE'
                    },
                    'value':'DW-RIPE',
                    'referencedType':'person',
                    'name':'admin-c'
                },
                {
                    'value':'MD5-PW',
                    'name':'auth',
                    'comment':'Filtered'
                },
                {
                    'value':'SSO',
                    'name':'auth',
                    'comment':'Filtered'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO1-MNT'
                    },
                    'value':'THIAGO1-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/WHOISTEST-MNT'
                    },
                    'value':'WHOISTEST-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO-MNT'
                    },
                    'value':'THIAGO-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'value':'2015-07-28T11:21:29Z',
                    'name':'created'
                },
                {
                    'value':'2015-07-29T13:03:12Z',
                    'name':'last-modified'
                },
                {
                    'value':'RIPE',
                    'name':'source',
                    'comment':'Filtered'
                }
            ],
            'type':'mntner'
        },
        {
            'link':{
                'type':'locator',
                'href':'http://rest-dev.db.ripe.net/ripe/person/AA28627-RIPE'
            },
            'source':{
                'id':'ripe'
            },
            'primaryKey':[
                {
                    'value':'AA28627-RIPE',
                    'name':'nic-hdl'
                }
            ],
            'attributes':[
                {
                    'value':'asd asd',
                    'name':'person'
                },
                {
                    'value':'Singel 258',
                    'name':'address'
                },
                {
                    'value':'+31681054583',
                    'name':'phone'
                },
                {
                    'value':'AA28627-RIPE',
                    'name':'nic-hdl'
                },
                {
                    'value':'2015-06-17T10:11:41Z',
                    'name':'created'
                },
                {
                    'value':'2015-06-17T10:11:41Z',
                    'name':'last-modified'
                },
                {
                    'value':'RIPE',
                    'name':'source'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO-MNT'
                    },
                    'value':'THIAGO-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                }
            ],
            'type':'person'
        },
        {
            'link':{
                'type':'locator',
                'href':'http://rest-dev.db.ripe.net/ripe/person/AA28629-RIPE'
            },
            'source':{
                'id':'ripe'
            },
            'primaryKey':[
                {
                    'value':'AA28629-RIPE',
                    'name':'nic-hdl'
                }
            ],
            'attributes':[
                {
                    'value':'asdf asdf',
                    'name':'person'
                },
                {
                    'value':'asdf',
                    'name':'address'
                },
                {
                    'value':'+31',
                    'name':'phone'
                },
                {
                    'value':'AA28629-RIPE',
                    'name':'nic-hdl'
                },
                {
                    'value':'2015-06-22T16:16:31Z',
                    'name':'created'
                },
                {
                    'value':'2015-06-22T16:16:31Z',
                    'name':'last-modified'
                },
                {
                    'value':'RIPE',
                    'name':'source'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/TPOLYCHNIA2-MNT'
                    },
                    'value':'TPOLYCHNIA2-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/TPOLYCHNIA-MNT'
                    },
                    'value':'TPOLYCHNIA-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO-MNT'
                    },
                    'value':'THIAGO-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                }
            ],
            'type':'person'
        },
        {
            'link':{
                'type':'locator',
                'href':'http://rest-dev.db.ripe.net/ripe/person/AA28650-RIPE'
            },
            'source':{
                'id':'ripe'
            },
            'primaryKey':[
                {
                    'value':'AA28650-RIPE',
                    'name':'nic-hdl'
                }
            ],
            'attributes':[
                {
                    'value':'a a',
                    'name':'person'
                },
                {
                    'value':'193.0.10.*',
                    'name':'address'
                },
                {
                    'value':'+31681054583',
                    'name':'phone'
                },
                {
                    'value':'AA28650-RIPE',
                    'name':'nic-hdl'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO1-MNT'
                    },
                    'value':'THIAGO1-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/WHOISTEST-MNT'
                    },
                    'value':'WHOISTEST-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO-MNT'
                    },
                    'value':'THIAGO-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'value':'2015-07-29T12:00:37Z',
                    'name':'created'
                },
                {
                    'value':'2015-07-29T12:00:37Z',
                    'name':'last-modified'
                },
                {
                    'value':'RIPE',
                    'name':'source'
                }
            ],
            'type':'person'
        },
        {
            'link':{
                'type':'locator',
                'href':'http://rest-dev.db.ripe.net/ripe/person/AA28652-RIPE'
            },
            'source':{
                'id':'ripe'
            },
            'primaryKey':[
                {
                    'value':'AA28652-RIPE',
                    'name':'nic-hdl'
                }
            ],
            'attributes':[
                {
                    'value':'a a',
                    'name':'person'
                },
                {
                    'value':'Singel 258',
                    'name':'address'
                },
                {
                    'value':'+31681054583',
                    'name':'phone'
                },
                {
                    'value':'AA28652-RIPE',
                    'name':'nic-hdl'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO2-MNT'
                    },
                    'value':'THIAGO2-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO1-MNT'
                    },
                    'value':'THIAGO1-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/WHOISTEST-MNT'
                    },
                    'value':'WHOISTEST-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'link':{
                        'type':'locator',
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/THIAGO-MNT'
                    },
                    'value':'THIAGO-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                },
                {
                    'value':'2015-07-29T14:01:22Z',
                    'name':'created'
                },
                {
                    'value':'2015-07-29T14:01:22Z',
                    'name':'last-modified'
                },
                {
                    'value':'RIPE',
                    'name':'source'
                }
            ],
            'type':'person'
        }
    ],
    'query':'http://db-dev-1.dev.ripe.net:1080/whois/search?inverse-attribute=mr&inverse-attribute=mb&inverse-attribute=md&inverse-attribute=ml&inverse-attribute=mu&inverse-attribute=mz&flags=r&source=RIPE&query-string=thiago-mnt'
};
