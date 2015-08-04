'use strict';

var objectType = 'mntner';
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
                    return { then: function(s) { s(OBJECT_REFERENCES_RESPONSE);} }; // pretend to be a promise
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

        expect($scope.referencesInfo).toEqual(OBJECT_REFERENCES_RESPONSE);
    });

    it('should call delete endpoint', function() {
        $scope.reason = 'some reason';

        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.delete();

        expect(RestService.deleteObject).toHaveBeenCalledWith(source, objectType, name, $scope.reason, false);
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

    it('should build url to display a given object reference', function() {
        var ref = OBJECT_REFERENCES_RESPONSE.references[0];
        expect($scope.displayUrl(ref)).toEqual('#/webupdates/display'+'/'+source+'/'+ref.type+'/'+ref.primaryKey[0].value);
    });

    it('should build primary key', function() {
        var ref = OBJECT_REFERENCES_RESPONSE.references[0];

        expect($scope.primaryKey(ref)).toEqual(ref.primaryKey[0].value);

    });

    it('should build composite primary keys', function() {
        var ref = OBJECT_REFERENCES_RESPONSE.references[0];
        ref.primaryKey = [{
                'name' : 'route',
                'value' : '193.0.0.0/21'
            },
            {
                'name' : 'origin',
                'value' : 'AS3333'
            }];

        expect($scope.primaryKey(ref)).toEqual('193.0.0.0/21'+'/'+'AS3333');

    });

    it('should check if reference is itself if type and pkey are the same', function () {
        var reference = {'type':'mntner',  'primaryKey':[
            {
                'value':'TEST-MNT',
                'name':'mntner'
            }]
        };
        expect($scope.isItself(reference, objectType)).toBe(true);
    });

    it('should handle as person/mnt reference if all references are persons', function () {
        var references = [{'type':'person'}];
        expect($scope.isMntPersonReference(references)).toBe(true);
    });

    it('should handle as person/mnt reference if all references are role', function () {
        var references = [{'type':'role'}];
        expect($scope.isMntPersonReference(references)).toBe(true);
    });

    it('should handle as person/mnt reference if all references are itself', function () {
        var references = [{'type':'mntner',  'primaryKey':[
            {
                'value':'TEST-MNT',
                'name':'mntner'
            }]
        }];
        expect($scope.isMntPersonReference(references)).toBe(true);
    });

    it('should handle as deletable if number of references is zero', function () {
        var referencesInfo = {
            'subset':0,
            'total':0,
            'references':[],
            'query':'http://uhuuuu.nl'
        };
        expect($scope.canBeDeleted(referencesInfo)).toBe(true);
    });

    it('should handle as deletable if reference is a isMntPersonReference', function () {
        var referencesInfo = {
            'subset':1,
            'total':1,
            'references':[{'type':'role'}],
            'query':'http://uhuuuu.nl'
        };
        expect($scope.canBeDeleted(referencesInfo)).toBe(true);
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

