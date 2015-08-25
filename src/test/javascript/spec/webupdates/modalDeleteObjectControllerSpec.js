'use strict';

var objectType = 'mntner';
var name = 'TEST-MNT';
var source = 'RIPE';

describe('webUpdates: Test if object can be deleted', function () {

    var $scope, $state;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_) {
            $state = _$state_;
            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            var restService =  {
                getReferences: function() {
                    return { then: function(s) { s(UNDELETABLE_OBJECT_REFS);} }; // pretend to be a promise
                }
            };
            _$controller_('ModalDeleteObjectController', {
                $scope: $scope, $state:$state, $modalInstance: {}, RestService:restService, source:source, objectType:objectType, name:name
            });
        });
    });

    it('should compare objects', function() {
        var ref = { type:'mntner', primaryKey: [{'name' : 'mntner','value' : 'TEST-MNT' }]};
        expect($scope.isEqualTo('mntner', 'TEST-MNT', ref)).toEqual(true);
        expect($scope.isEqualTo( 'person', 'TEST-MNT', ref)).toEqual(false);
        expect($scope.isEqualTo( 'mntner', 'TEST2-MNT', ref)).toEqual(false);
    });

    it('should compare objects with composite primary keys', function() {
        var ref = { type:'route', primaryKey: [{'name' : 'route','value' : '193.0.0.0/21' },{ 'name' : 'origin', 'value' : 'AS3333' }]};
        expect($scope.isEqualTo('route', '193.0.0.0/21AS3333', ref)).toEqual(true);
        expect($scope.isEqualTo( 'person', '193.0.0.0/21AS3333', ref)).toEqual(false);
        expect($scope.isEqualTo( 'route', 'xyz', ref)).toEqual(false);
    });

    it('should be able to handle composite primary keys', function() {
        $scope.referencesInfo = {'subset':0, 'total':0, 'references':[
            {type:'route', primaryKey: [{'name' : 'route','value' : '193.0.0.0/21' },{ 'name' : 'origin', 'value' : 'AS3333' }]}
        ]};
        expect($scope.primaryKey($scope.referencesInfo.references[0])).toEqual('193.0.0.0/21AS3333');
        expect($scope.displayUrl($scope.referencesInfo.references[0])).toEqual('#/webupdates/display/RIPE/route/193.0.0.0%252F21AS3333');
    });

    it('should allow deletion of unreferenced object', function() {
        $scope.referencesInfo = {'subset':0, 'total':0, 'references':[]};
        expect($scope.canBeDeleted('mntner', 'TEST-MNT', $scope.referencesInfo)).toBe(true);
    });

    it('should allow deletion of self-referenced object', function() {
        $scope.referencesInfo = {'subset':1, 'total':1, 'references':[
            { 'type':'mntner','primaryKey':[{ 'value':'TEST-MNT', 'name':'mntner' }]}
        ]};
        expect($scope.canBeDeleted('mntner', 'TEST-MNT', $scope.referencesInfo)).toBe(true);
    });

    it('should allow deletion of simple mntner-person pair', function() {
        $scope.referencesInfo = {'subset':1, 'total':1, 'references':[
            { type:'mntner',primaryKey:[{ value:'ME-RIPE', name:'person' }],attributes:[{name:'mnt-by',value:'TEST-MNT'}]}
        ]};
        expect($scope.canBeDeleted('mntner', 'TEST-MNT', $scope.referencesInfo)).toBe(true);
    });

    it('should allow deletion of simple mntner-role pair', function() {
        $scope.referencesInfo = {'subset':1, 'total':1, 'references':[
            { type:'mntner',primaryKey:[{ value:'ME-RIPE', name:'role' }],attributes:[{name:'mnt-by',value:'TEST-MNT'}]}
        ]};
        expect($scope.canBeDeleted('mntner', 'TEST-MNT', $scope.referencesInfo)).toBe(true);
    });

    it('should allow deletion of simple person-mntner pair', function() {
        $scope.isPartOfSimplePair = true;

        $scope.referencesInfo = {'subset':1, 'total':1, 'references':[
            { type:'mntner',primaryKey:[{ value:'TEST-MNT', name:'mntner' }],attributes:[{name:'admin-c',value:'ME-RIPE'}]}
        ]};
        expect($scope.canBeDeleted('person', 'ME-RIPE', $scope.referencesInfo)).toBe(true);
    });

    it('should allow deletion of simple role-mntner pair', function() {
        $scope.objectType = 'role';
        $scope.name = 'ME-RIPE';
        $scope.isPartOfSimplePair = true;
        $scope.referencesInfo = {'subset':1, 'total':1, 'references':[
            { type:'mntner',primaryKey:[{ value:'TEST-MNT', name:'mntner' }],attributes:[{name:'admin-c',value:'ME-RIPE'}]}
        ]};
        expect($scope.canBeDeleted('mntner', 'TEST-MNT',$scope.referencesInfo)).toBe(true);
    });

    it('should not allow deletion of pair if peer cannot be deleted ', function() {
        $scope.isPartOfSimplePair = false;
        $scope.referencesInfo = {'subset':1, 'total':1, 'references':[
            { type:'mntner',primaryKey:[{ value:'TEST-MNT', name:'mntner' }],attributes:[{name:'admin-c',value:'ME-RIPE'}]}
        ]};
        expect($scope.canBeDeleted('rolw', 'ME-RIPE',$scope.referencesInfo)).toBe(false);
    });

    it('should not allow deletion if object has multiple incoming refs ', function() {
        $scope.referencesInfo = {'subset':2, 'total':2, 'references':[
            { type:'mntner',primaryKey:[{ value:'TEST-MNT', name:'mntner' }],attributes:[{name:'admin-c',value:'ME-RIPE'}]},
            { type:'mntner',primaryKey:[{ value:'TEST2-MNT', name:'mntner' }],attributes:[{name:'admin-c',value:'ME-RIPE'}]}
        ]};
        expect($scope.canBeDeleted('role', 'ME-RIPE',$scope.referencesInfo)).toBe(false);
    });
});

describe('webUpdates: ModalDeleteObjectController undeletable object', function () {

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
                    return { then: function(s) { s(UNDELETABLE_OBJECT_REFS);} }; // pretend to be a promise
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

    it('should select referencesInfo if any', function() {
        expect($scope.referencesInfo).toEqual(UNDELETABLE_OBJECT_REFS);
    });

    it('should not allow deletion of complex referenced object', function() {
        expect($scope.canBeDeleted($scope.objectType, $scope.name, $scope.referencesInfo)).toBe(false);
    });

    it('should not call delete endpoint', function() {
        $scope.reason = 'some reason';

        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.doDelete();

        expect(RestService.deleteObject).not.toHaveBeenCalled();
    });

    it('should close the modal and return error when canceled', function () {
        $scope.doCancel();
        expect(modalInstance.close).toHaveBeenCalled();
    });

});

describe('webUpdates: ModalDeleteObjectController deleteable object ', function () {

    var $scope, $state, modalInstance, RestService, WhoisResources;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$log_, _WhoisResources_) {

            $state = _$state_;
            WhoisResources = _WhoisResources_;
            RestService =  {
                deleteObject: function() {
                    return { then: function(s) { s();} }; // pretend to be a promise
                },
                getReferences: function(source, type, name) {
                    if( name === 'TEST-MNT') {
                        return {
                            then: function (s) {
                                s(REFS_FOR_TEST_MNT);
                            }
                        }; // pretend to be a promise
                    } else if( name === 'ME-RIPE') {
                        return {
                            then: function (s) {
                                s(REFS_FOR_ME_RIPE);
                            }
                        }; // pretend to be a promise
                    }
                }
            };

            spyOn(RestService, 'getReferences').and.callThrough();

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss')
            };
            var logger = {
                info: function(msg) {
                    //console.log(msg);
                }
            };

            _$controller_('ModalDeleteObjectController', {
                $scope: $scope, $state:$state, $log:logger, $modalInstance: modalInstance, RestService:RestService, source:source, objectType:objectType, name:name
            });

        });
    });

    it('should query for last object revision references', function() {
        expect(RestService.getReferences).toHaveBeenCalledWith(source, objectType, name);
        expect(RestService.getReferences).toHaveBeenCalledWith(source, 'person', 'ME-RIPE');
        expect($scope.isPartOfSimplePair).toEqual(true);
    });

    it('should select referencesInfo if any', function() {
        expect($scope.referencesInfo).toEqual(REFS_FOR_TEST_MNT);
    });

    it('should allow deletion of simple cross-referenced pair', function() {
         expect($scope.canBeDeleted($scope.objectType, $scope.name, $scope.referencesInfo)).toBe(true);
    });

    it('should call delete endpoint', function() {
        $scope.reason = 'some reason';

        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.doDelete();

        expect(RestService.deleteObject).toHaveBeenCalledWith(source, objectType, name, $scope.reason, true);
    });

    it('should close modal after delete object', function() {
        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.doDelete();

        expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal after error deleting object', function() {
        spyOn(RestService, 'deleteObject').and.returnValue({then: function(s, f) { f({data:'error'}); }});

        $scope.doDelete();

        expect(modalInstance.dismiss).toHaveBeenCalledWith('error');
    });

    it('should redirect to succes delete page after delete object', function() {
        spyOn($state, 'transitionTo');

        $scope.doDelete();

        expect($state.transitionTo).toHaveBeenCalledWith('deleted', {source:source, objectType:objectType, name:name});
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
                getReferences: function (source, type, name) {
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

var UNDELETABLE_OBJECT_REFS = {
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



var REFS_FOR_TEST_MNT = {
    'subset':1,
    'total':1,
    'references':[
       {
            'link':{
                'type':'locator',
                'href':'http://rest-dev.db.ripe.net/ripe/person/ME-RIPE'
            },
            'source':{
                'id':'ripe'
            },
            'primaryKey':[
                {
                    'value':'ME-RIPE',
                    'name':'nic-hdl'
                }
            ],
            'attributes':[
                {
                    'value':'me engineer',
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
                    'value':'ME-RIPE',
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
                        'href':'http://rest-dev.db.ripe.net/ripe/mntner/TEST-MNT'
                    },
                    'value':'TEST-MNT',
                    'referencedType':'mntner',
                    'name':'mnt-by'
                }
            ],
            'type':'person'
        }
    ],
    'query':'http://db-dev-1.dev.ripe.net:1080/whois/search?inverse-attribute=mr&inverse-attribute=mb&inverse-attribute=md&inverse-attribute=ml&inverse-attribute=mu&inverse-attribute=mz&flags=r&source=RIPE&query-string=test-mnt'
};


var REFS_FOR_ME_RIPE = {
    'subset':1,
    'total':1,
    'references':[
        {
            'link':{
                'type':'locator',
                'href':'http://rest-dev.db.ripe.net/ripe/mntner/TEST-MNT'
            },
            'source':{
                'id':'ripe'
            },
            'primaryKey':[
                {
                    'value':'TEST-MNT',
                    'name':'mntner'
                }
            ],
            'attributes':[
                {
                    'value':'TEST-MNT',
                    'name':'mntner'
                },
                {
                    'value':'TEST-MNT',
                    'name':'mnt-by'
                },
                {
                    'value':'ME-RIPE',
                    'name':'admin-c'
                },
                {
                    'value':'RIPE',
                    'name':'source'
                }
            ],
            'type':'mntner'
        }
    ],
    'query':'http://db-dev-1.dev.ripe.net:1080/whois/search?inverse-attribute=mr&inverse-attribute=mb&inverse-attribute=md&inverse-attribute=ml&inverse-attribute=mu&inverse-attribute=mz&flags=r&source=RIPE&query-string=test-mnt'
};

