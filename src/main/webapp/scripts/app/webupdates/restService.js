'use strict';

angular.module('dbWebApp')
    .factory('RestService', ['$resource', '$q', '$http', '$templateCache', '$log',
        function ($resource, $q, $http, $templateCache, $log) {

            function RestService() {

                this.getVersions = function(source, objectType, name) {
                    return {then: function(f) {f({data:OBJECT_VERSIONS_RESPONSE})}};
                };

                this.getReferences = function(source, objectType, name, version) {
                    return {then: function(f) {f({data:OBJECT_REFERENCES_RESPONSE})}};

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


var OBJECT_VERSIONS_RESPONSE = {'versions':[ {
    'type' : 'AUT-NUM',
    'pkey' : 'AS3333',
    'revision' : 1,
    'from' : '2002-08-13T14:58:13+02:00',
    'to' : '2003-01-20T14:08:30+01:00',
    'link' : {
        'type' : 'locator',
        'href' : 'https://int.db.ripe.net/rnd/ripe/AUT-NUM/AS3333/versions/1'
    }
}, {
    'type': 'AUT-NUM',
    'pkey': 'AS3333',
    'revision': 2,
    'from': '2003-01-20T14:08:30+01:00',
    'to': '2003-01-20T14:43:13+01:00',
    'link': {
        'type': 'locator',
        'href': 'https://int.db.ripe.net/rnd/ripe/AUT-NUM/AS3333/versions/2'
    }
}],
    'terms-and-conditions' : {
        'type' : 'locator',
        'href' : 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
    }
};

var OBJECT_REFERENCES_RESPONSE = {"object" : {
    "attributes" : {
        "attribute" : [ {
            "name" : "aut-num",
            "value" : "AS3333"
        }, {
            "name" : "source",
            "value" : "RIPE",
            "comment" : "Filtered"
        }]
    }
},
    "version" : {
        "type" : "AUT-NUM",
        "pkey" : "AS3333",
        "revision" : 1,
        "from" : "2003-03-17T11:34:38+01:00",
        "to" : "2003-04-25T17:39:17+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/AUT-NUM/AS3333/versions/5"
        }
    },
    "incoming" : [ {
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    },{
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    },{
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    },{
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    },{
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    },{
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    },{
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    },{
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    },{
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    },{
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    } ],
    "outgoing" : [ {
        "type" : "ROLE",
        "pkey" : "OPS4-RIPE",
        "revision" : 2,
        "from" : "2003-04-12T08:25:25+02:00",
        "to" : "2003-05-22T13:20:02+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROLE/OPS4-RIPE/versions/2"
        }
    }, {
        "type" : "ROLE",
        "pkey" : "OPS4-RIPE",
        "revision" : 1,
        "from" : "2002-09-16T12:35:19+02:00",
        "to" : "2003-04-12T08:25:25+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROLE/OPS4-RIPE/versions/1"
        }
    } ],
    "terms-and-conditions" : {
        "type" : "locator",
        "href" : "http://www.ripe.net/db/support/db-terms-conditions.pdf"
    }
};
