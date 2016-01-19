'use strict';

var objectType = 'mntner';
var name = 'TEST-MNT';
var source = 'RIPE';
var ON_CANCEL = 'modify';

describe('webUpdates: primitives of ModalDeleteObjectController', function () {

    var $scope, $state, logger, $httpBackend;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_,_$state_, _$httpBackend_) {
            var $rootScope = _$rootScope_;
            $state = _$state_;
            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;

            var restService =  {
                getReferences: function() {
                    return { then: function(s) { s( {objectType:'mntner', primaryKey: 'TEST-MNT' });} }; // pretend to be a promise
                }
            };
            logger = {
                debug: function(msg) {
                    //console.log('debug:'+msg);
                },
                info: function(msg) {
                    //console.log('\tinfo:'+ msg);
                },
                notice: function(msg) {
                    //console.log('test:'+ msg);
                },
            };

            _$controller_('ModalDeleteObjectController', {
                $scope: $scope, $state:$state, $log:logger, $modalInstance: {}, RestService:restService,
                    source:source, objectType:objectType, name:name, onCancel:ON_CANCEL
            });

            $httpBackend.whenGET(/.*.html/).respond(200);
            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should compare objects', function() {
        var ref = {objectType : 'mntner','primaryKey' : 'TEST-MNT' };
        expect($scope.isEqualTo('mntner', 'TEST-MNT', ref)).toEqual(true);
        expect($scope.isEqualTo( 'person', 'TEST-MNT', ref)).toEqual(false);
        expect($scope.isEqualTo( 'mntner', 'TEST2-MNT', ref)).toEqual(false);
    });

    it('should compare objects with composite primary keys', function() {
        var ref = {objectType:'route', primaryKey: '193.0.0.0/21AS3333' };
        expect($scope.isEqualTo('route', '193.0.0.0/21AS3333', ref)).toEqual(true);
        expect($scope.isEqualTo( 'person', '193.0.0.0/21AS3333', ref)).toEqual(false);
        expect($scope.isEqualTo( 'route', 'xyz', ref)).toEqual(false);
    });

    it('should be able to compose display url for object', function() {
        var ref = {objectType:'mntner', primaryKey: 'TEST-MNT' };
        expect($scope.displayUrl(ref)).toEqual('#/webupdates/display/RIPE/mntner/TEST-MNT');
    });

    it('should be able to compose display url for object with slash', function() {
        var ref = {objectType:'route', primaryKey: '193.0.0.0/21AS3333' };
        expect($scope.displayUrl(ref)).toEqual('#/webupdates/display/RIPE/route/193.0.0.0%252F21AS3333');
    });

    it('should allow deletion of unreferenced object: undefined refs', function() {
        logger.notice('should allow deletion of unreferenced object: undefined refs');
        var refs = {objectType:'mntner', primaryKey: 'TEST-MNT' };
        expect($scope.isDeletable(refs)).toBe(true);
    });

    it('should allow deletion of unreferenced object: empty refs', function() {
        logger.notice('should allow deletion of unreferenced object: empty refs');
        var refs = {objectType:'route', primaryKey: '193.0.0.0/21AS3333',incoming:[],outgoing:[] };
        expect($scope.isDeletable(refs)).toBe(true);
    });

    it('should allow deletion of self-referenced object', function() {
        logger.notice('should allow deletion of self-referenced object');
        var refs = {objectType:'mntner', primaryKey: 'TEST-MNT',
            incoming:[{objectType:'mntner', primaryKey: 'TEST-MNT'}],outgoing:[] };
        expect($scope.isDeletable(refs)).toBe(true);
    });

    it('should allow deletion of simple mntner-person pair', function() {
        logger.notice('should allow deletion of simple mntner-person pair');
        expect($scope.isDeletable(REFS_FOR_TEST_MNT)).toBe(true);
    });

    it('should allow deletion of simple person-mntner pair', function() {
        logger.notice('should allow deletion of simple person-mntner pair');
        expect($scope.isDeletable(REFS_FOR_TEST_PERSON)).toBe(true);
    });

    it('should not allow deletion of object with other incoming refs', function() {
        logger.notice('should not allow deletion of object with other incoming refs');
        expect($scope.isDeletable(REFS_FOR_UNDELETEABLE_OBJECTS)).toBe(false);
    });

    it('should detect that object has no () incoming refs', function() {
        expect($scope.hasNonSelfIncomingRefs('mntner', 'TEST-MNT',[])).toBe(false);
    });

    it('should detect that object has no () incoming refs', function() {
        expect($scope.hasNonSelfIncomingRefs('mntner', 'TEST-MNT', [{objectType:'mntner', primaryKey:"TEST-MNT"}])).toBe(false);
    });

    it('should detect that object has incoming refs', function() {
        expect($scope.hasNonSelfIncomingRefs('mntner', 'TEST-MNT', REFS_FOR_TEST_MNT.incoming)).toBe(true);
    });

});


describe('webUpdates: ModalDeleteObjectController undeletable object', function () {

    var $scope, $state, $httpBackend, modalInstance, RestService, CredentialsService, logger;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$httpBackend_, _CredentialsService_) {

            $state = _$state_;
            CredentialsService = _CredentialsService_;
            $httpBackend= _$httpBackend_;

            RestService =  {
                deleteObject: function() {
                    return { then: function(s) { s();} }; // pretend to be a promise
                },
                getReferences: function() {
                    return { then: function(s) { s(REFS_FOR_UNDELETEABLE_OBJECTS);} }; // pretend to be a promise
                }
            };

            spyOn(RestService, 'getReferences').and.callThrough();

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss')
            };
            logger = {
                debug: function(msg) {
                    //console.log(msg);
                },
                info: function(msg) {
                    //console.log(msg);
                }
            };
            _$controller_('ModalDeleteObjectController', {
                $scope: $scope, $state:$state, $log:logger, $modalInstance: modalInstance, RestService:RestService, CredentialsService:CredentialsService,
                        source:source, objectType:objectType, name:name, onCancel:ON_CANCEL
            });

            $httpBackend.whenGET(/.*.html/).respond(200);
            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should query for last object revision references', function() {
        expect(RestService.getReferences).toHaveBeenCalledWith(source, objectType, name, $scope.MAX_REFS_TO_SHOW);
    });

    it('should select referencesInfo if any', function() {
        expect($scope.incomingReferences.length).toEqual(1);
        expect($scope.incomingReferences[0].objectType).toEqual('person');
        expect($scope.incomingReferences[0].primaryKey).toEqual('ME-RIPE');
    });

    it('should decide that object cannot be deleted ', function() {
        expect($scope.canBeDeleted).toBe(false);
    });

    it('should not call delete endpoint', function() {
        $scope.reason = 'some reason';

        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.doDelete();

        expect(RestService.deleteObject).not.toHaveBeenCalled();
    });

    it('should close the modal and return to modify when canceled', function () {

        $scope.onCancel = 'webupdates.modify';
        $scope.doCancel();
        expect(modalInstance.close).toHaveBeenCalled();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.modify');
    });

    it('should close the modal and return to force-delete when canceled', function () {

        $scope.onCancel = 'webupdates.forceDelete';
        $scope.doCancel();
        expect(modalInstance.close).toHaveBeenCalled();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.forceDelete');
    });

});


describe('webUpdates: ModalDeleteObjectController deleteable object ', function () {

    var $scope, $state, $httpBackend, modalInstance, RestService, CredentialsService;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$httpBackend_, _$log_, _CredentialsService_) {

            $state = _$state_;
            CredentialsService = _CredentialsService_;
            $httpBackend = _$httpBackend_;
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
                debug: function(msg) {
                    //console.log('debug:'+msg);
                },
                info: function(msg) {
                    //console.log('info:'+msg);
                },
                error: function(msg ) {
                    //console.log('error:'+ msg);
                }
            };

            _$controller_('ModalDeleteObjectController', {
                $scope: $scope, $state:$state, $log:logger, $modalInstance: modalInstance, RestService:RestService, CredentialService:CredentialsService,
                    source:source, objectType:objectType, name:name, onCancel: ON_CANCEL
            });

            $httpBackend.whenGET(/.*.html/).respond(200);
            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should query for last object revision references', function() {
        expect(RestService.getReferences).toHaveBeenCalledWith(source, objectType, name, $scope.MAX_REFS_TO_SHOW);
    });

    it('should select referencesInfo if any', function() {
        expect($scope.incomingReferences.length).toEqual(2);
        expect($scope.incomingReferences[0].objectType).toEqual('mntner');
        expect($scope.incomingReferences[0].primaryKey).toEqual('TEST-MNT');
        expect($scope.incomingReferences[1].objectType).toEqual('person');
        expect($scope.incomingReferences[1].primaryKey).toEqual('ME-RIPE');
    });

    it('should decide that object can be deleted ', function() {
        expect($scope.canBeDeleted).toBe(true);
    });

    it('should call delete endpoint without password and close modal', function() {
        $scope.reason = 'some reason';

        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.doDelete();

        expect(RestService.deleteObject).toHaveBeenCalledWith(source, objectType, name, $scope.reason, true, undefined);
        expect(modalInstance.close).toHaveBeenCalled();

    });

    it('should call delete endpoint with password and close modal', function() {
        $scope.reason = 'some reason';

        spyOn(RestService, 'deleteObject').and.callThrough();
        CredentialsService.setCredentials('TEST-MNT','secret');

        $scope.doDelete();

        expect(RestService.deleteObject).toHaveBeenCalledWith(source, objectType, name, $scope.reason, true, 'secret');
        expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal after error deleting object', function() {
        spyOn(RestService, 'deleteObject').and.returnValue({then: function(s, f) { f({data:'error'}); }});

        $scope.doDelete();

        expect(modalInstance.dismiss).toHaveBeenCalledWith({data:'error'});
    });

    it('should redirect to success delete page after delete object', function() {
        spyOn(RestService, 'deleteObject').and.returnValue({then: function(s, f) { s({data:'error'}); }});

        $scope.doDelete();

        expect(modalInstance.close).toHaveBeenCalled();
    });


});


describe('webUpdates: ModalDeleteObjectController loading references failures ', function () {

    var $scope, $state, $httpBackend, modalInstance, RestService, CredentialsService;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$httpBackend_, _CredentialsService_) {

            $state = _$state_;
            CredentialsService = _CredentialsService_;
            $httpBackend = _$httpBackend_;
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
                $scope: $scope, $state:$state, $modalInstance: modalInstance, RestService:RestService, CredentialsService:CredentialsService,
                source:source, objectType:objectType, name:name, onCancel:ON_CANCEL
            });

            $httpBackend.whenGET(/.*.html/).respond(200);
            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should dismiss modal after error getting object references', function() {
        expect(modalInstance.dismiss).toHaveBeenCalledWith('error');
    });

});

var REFS_FOR_UNDELETEABLE_OBJECTS = {
    "primaryKey" : "TEST-MNT",
    "objectType" : "mntner",
    "incoming" : [ {
        "primaryKey" : "ME-RIPE",
        "objectType" : "person",
        "incoming" : [
            {
                "primaryKey" : "TEST-MNT",
                "objectType" : "mntner"
            },
            {
                "primaryKey" : "OWNER-MNT",
                "objectType" : "mntner"
            }
        ],
        "outgoing" : [ ]
    } ],
    "outgoing" : [ ]
}

var REFS_FOR_TEST_MNT = {
    "primaryKey" : "TEST-MNT",
    "objectType" : "mntner",
    "incoming" : [
        {
            "primaryKey" : "TEST-MNT",
            "objectType" : "mntner",
        },
        {
        "primaryKey" : "ME-RIPE",
        "objectType" : "person",
        "incoming" : [ {
            "primaryKey" : "TEST-MNT",
            "objectType" : "mntner"
        } ],
        "outgoing" : [ ]
        } ],
    "outgoing" : [ ]
};

var REFS_FOR_TEST_PERSON = {
    "primaryKey" : "ME-RIPE",
    "objectType" : "person",
    "incoming" : [ {
        "primaryKey" : "TEST-MNT",
        "objectType" : "mntner",
        "incoming" : [ {
            "primaryKey" : "ME-RIPE",
            "objectType" : "person"
        } ],
        "outgoing" : [ ]
    } ],
    "outgoing" : [ ]
};
