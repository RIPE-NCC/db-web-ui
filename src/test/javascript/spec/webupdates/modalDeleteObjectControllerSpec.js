'use strict';

var objectType = 'MNT';
var name = 'TEST-MNT';
var source = 'RIPE';

describe('webUpdates: ModalDeleteObjectController loading success', function () {

    var $scope, $state, modalInstance, RestService, WhoisResources;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _WhoisResources_) {

            $state = _$state_;
            WhoisResources = _WhoisResources_;
            RestService =  {
                deleteObject: function() {
                    return { then: function(s) { s();} }; // pretend to be a promise
                },
                getReferences: function() {
                    return { then: function(s) { s({data:OBJECT_REFERENCES_RESPONSE});} }; // pretend to be a promise
                }
            };

            spyOn(RestService, 'getReferences').and.callThrough();

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss')
            };

            _$controller_('ModalDeleteObjectController', {
                $scope: $scope, $state:$state, $modalInstance: modalInstance, RestService:RestService, source:source, objectType:objectType, name:name
            });

        });
    });

    it('should query for last object revision references', function() {

        expect(RestService.getReferences).toHaveBeenCalledWith(source, objectType, name);
    });

    it('should select references if any', function() {

        expect($scope.references).toEqual(OBJECT_REFERENCES_RESPONSE.references);
    });

    it('should call delete endpoint', function() {
        $scope.reason = 'some reason';

        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.delete();

        expect(RestService.deleteObject).toHaveBeenCalledWith(source, objectType, name, $scope.reason);
    });

    it('should close modal after delete object', function() {
        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.delete();

        expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal after error deleting object', function() {
        spyOn(RestService, 'deleteObject').and.returnValue({then: function(s, f) { f({data:'error'}); }});

        $scope.delete();

        expect(modalInstance.dismiss).toHaveBeenCalledWith('error');
    });

    it('should redirect to succes delete page after delete object', function() {
        spyOn($state, 'transitionTo');

        $scope.delete();

        expect($state.transitionTo).toHaveBeenCalledWith('deleted', {source:source, objectType:objectType, name:name});
    });

    it('should close the modal and return error when canceled', function () {
        $scope.cancel();
        expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should make the transition to display a given object reference', function() {
        var ref = {
            "type": "ROUTE",
            "pkey": "193.0.0.0/21AS3333",
            "revision": 1,
            "from": "2001-09-22T11:33:24+02:00",
            "to": "2008-09-10T13:31:33+02:00",
            "link": {
                "type": "locator",
                "href": "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
            }
        };
        spyOn($state, 'transitionTo');

        $scope.display(ref);

        expect($state.transitionTo).toHaveBeenCalledWith('display', {
            source: source,
            objectType: ref.type,
            name: ref.pkey
        });


    });

});

describe('webUpdates: ModalDeleteObjectController loading references failures ', function () {

    var $scope, $state, modalInstance, RestService, WhoisResources;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _WhoisResources_) {

            $state = _$state_;
            WhoisResources = _WhoisResources_;
            RestService =  {
                getReferences: function () {
                    return { then: function(s, f) { f({data:'error'});} }; // pretend to be a promise
                }
            };

            spyOn(RestService, 'getReferences').and.callThrough();

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            modalInstance = {
                dismiss: jasmine.createSpy('modalInstance.dismiss')
            };

            $scope.objectType = 'MNT';
            $scope.name = 'TEST-MNT';
            $scope.source = 'RIPE';

            _$controller_('ModalDeleteObjectController', {
                $scope: $scope, $state:$state, $modalInstance: modalInstance, RestService:RestService, source:source, objectType:objectType, name:name
            });

        });
    });

    it('should dismiss modal after error getting object references', function() {

        expect(modalInstance.dismiss).toHaveBeenCalledWith('error');
    });

});



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

