/*global afterEach, beforeEach, describe, expect, inject, it, jasmine, module, spyOn*/
'use strict';

var objectType = 'mntner';
var name = 'TEST-MNT';
var source = 'RIPE';
var ON_CANCEL = 'modify';

describe('webUpdates: primitives of modalDeleteObject', function () {

    var $componentController, param, bindings, ctrl;
    var $log, $state, logger, $httpBackend, restService;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$log_, _$httpBackend_) {
            $state = _$state_;
            $log = _$log_;
            $httpBackend = _$httpBackend_;

            restService = {
                getReferences: function () {
                    return {
                        then: function (s) {
                            s({objectType: 'mntner', primaryKey: 'TEST-MNT'});
                        }
                    }; // pretend to be a promise
                }
            };
            logger = {
                debug: function () {
                    //console.log('debug:'+msg);
                },
                info: function () {
                    //console.log('\tinfo:'+ msg);
                },
                notice: function () {
                    //console.log('test:'+ msg);
                }
            };


            $componentController = _$componentController_;
            param = {
                $state: $state,
                $log: $log,
                RestService: restService
            };
            bindings = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                resolve: {
                    name: 'TEST-MNT',
                    objectType: 'mntner',
                    onCancel: ON_CANCEL,
                    source: 'RIPE'
                }
            };

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should compare objects', function () {
        var ref = {objectType: 'mntner', primaryKey: 'TEST-MNT'};
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        expect(ctrl.isEqualTo('mntner', 'TEST-MNT', ref)).toEqual(true);
        expect(ctrl.isEqualTo('person', 'TEST-MNT', ref)).toEqual(false);
        expect(ctrl.isEqualTo('mntner', 'TEST2-MNT', ref)).toEqual(false);
    });

    it('should compare objects with composite primary keys', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        var ref = {objectType: 'route', primaryKey: '193.0.0.0/21AS3333'};
        expect(ctrl.isEqualTo('route', '193.0.0.0/21AS3333', ref)).toEqual(true);
        expect(ctrl.isEqualTo('person', '193.0.0.0/21AS3333', ref)).toEqual(false);
        expect(ctrl.isEqualTo('route', 'xyz', ref)).toEqual(false);
    });

    it('should be able to compose display url for object', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        var ref = {objectType: 'mntner', primaryKey: 'TEST-MNT'};
        expect(ctrl.displayUrl(ref)).toEqual('#/webupdates/display/RIPE/mntner/TEST-MNT');
    });

    it('should be able to compose display url for object with slash', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        var ref = {objectType: 'route', primaryKey: '193.0.0.0/21AS3333'};
        expect(ctrl.displayUrl(ref)).toEqual('#/webupdates/display/RIPE/route/193.0.0.0%252F21AS3333');
    });

    it('should allow deletion of unreferenced object: undefined refs', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        logger.notice('should allow deletion of unreferenced object: undefined refs');
        var refs = {objectType: 'mntner', primaryKey: 'TEST-MNT'};
        expect(ctrl.isDeletable(refs)).toBe(true);
    });

    it('should allow deletion of unreferenced object: empty refs', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        logger.notice('should allow deletion of unreferenced object: empty refs');
        var refs = {objectType: 'route', primaryKey: '193.0.0.0/21AS3333', incoming: [], outgoing: []};
        expect(ctrl.isDeletable(refs)).toBe(true);
    });

    it('should allow deletion of self-referenced object', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        logger.notice('should allow deletion of self-referenced object');
        var refs = {
            objectType: 'mntner', primaryKey: 'TEST-MNT',
            incoming: [{objectType: 'mntner', primaryKey: 'TEST-MNT'}], outgoing: []
        };
        expect(ctrl.isDeletable(refs)).toBe(true);
    });

    it('should allow deletion of simple mntner-person pair', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        logger.notice('should allow deletion of simple mntner-person pair');
        expect(ctrl.isDeletable(REFS_FOR_TEST_MNT)).toBe(true);
    });

    it('should allow deletion of simple person-mntner pair', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        logger.notice('should allow deletion of simple person-mntner pair');
        expect(ctrl.isDeletable(REFS_FOR_TEST_PERSON)).toBe(true);
    });

    it('should not allow deletion of object with other incoming refs', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        logger.notice('should not allow deletion of object with other incoming refs');
        expect(ctrl.isDeletable(REFS_FOR_UNDELETEABLE_OBJECTS)).toBe(false);
    });

    it('should detect that object has no () incoming refs', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        expect(ctrl.hasNonSelfIncomingRefs('mntner', 'TEST-MNT', [])).toBe(false);
    });

    it('should detect that object has no () incoming refs', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        expect(ctrl.hasNonSelfIncomingRefs('mntner', 'TEST-MNT', [{objectType: 'mntner', primaryKey: 'TEST-MNT'}])).toBe(false);
    });

    it('should detect that object has incoming refs', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        expect(ctrl.hasNonSelfIncomingRefs('mntner', 'TEST-MNT', REFS_FOR_TEST_MNT.incoming)).toBe(true);
    });
});


describe('webUpdates: ModalDeleteObjectComponent undeletable object', function () {

    var $componentController, param, bindings, ctrl;
    var $log, $state, $httpBackend, restService;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$log_, _$httpBackend_) {

            $state = _$state_;
            $log = _$log_;
            $httpBackend = _$httpBackend_;

            restService = {
                deleteObject: function () {
                    return {
                        then: function (s) {
                            s();
                        }
                    }; // pretend to be a promise
                },
                getReferences: function () {
                    return {
                        then: function (s) {
                            s(REFS_FOR_UNDELETEABLE_OBJECTS);
                        }
                    }; // pretend to be a promise
                }
            };

            spyOn(restService, 'getReferences').and.callThrough();

            $componentController = _$componentController_;
            param = {
                $state: $state,
                $log: $log,
                RestService: restService
            };
            bindings = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                resolve: {
                    source: 'RIPE',
                    objectType: 'mntner',
                    name: 'TEST-MNT',
                    onCancel: ON_CANCEL
                }
            };

            $httpBackend.whenGET(/.*.html/).respond(200);

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should query for last object revision references', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        expect(restService.getReferences).toHaveBeenCalledWith(bindings.resolve.source, bindings.resolve.objectType, bindings.resolve.name, ctrl.MAX_REFS_TO_SHOW);
    });

    it('should select referencesInfo if any', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        expect(ctrl.incomingReferences.length).toEqual(1);
        expect(ctrl.incomingReferences[0].objectType).toEqual('person');
        expect(ctrl.incomingReferences[0].primaryKey).toEqual('ME-RIPE');
    });

    it('should decide that object cannot be deleted ', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();
        expect(ctrl.canBeDeleted).toBe(false);
    });

    it('should not call delete endpoint', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        ctrl.reason = 'some reason';

        spyOn(restService, 'deleteObject').and.callThrough();

        ctrl.delete();

        expect(restService.deleteObject).not.toHaveBeenCalled();
    });

    it('should close the modal and return to modify when canceled', function () {

        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        ctrl.resolve.onCancel = 'webupdates.modify';
        ctrl.cancel();
        expect(ctrl.close).toHaveBeenCalled();

        $httpBackend.flush();
    });

    it('should close the modal and return to force delete when canceled', function () {

        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        ctrl.resolve.onCancel = 'webupdates.forceDelete';
        ctrl.cancel();
        expect(ctrl.close).toHaveBeenCalled();
    });

});


describe('webUpdates: ModalDeleteObjectComponent deleteable object ', function () {

    var $componentController, param, bindings, ctrl;
    var $log, $state, $httpBackend, restService, credentialsService;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$log_, _$httpBackend_, _CredentialsService_) {

            $state = _$state_;
            $log = _$log_;
            $httpBackend = _$httpBackend_;
            credentialsService = _CredentialsService_;
            restService = {
                deleteObject: function () {
                    return {
                        then: function (s) {
                            s();
                        }
                    }; // pretend to be a promise
                },
                getReferences: function (source, type, name) {
                    if (name === 'TEST-MNT') {
                        return {
                            then: function (s) {
                                s(REFS_FOR_TEST_MNT);
                            }
                        }; // pretend to be a promise
                    }
                }
            };

            spyOn(restService, 'getReferences').and.callThrough();

            $componentController = _$componentController_;
            param = {
                $state: $state,
                $log: $log,
                RestService: restService,
                credentialsService: credentialsService
            };
            bindings = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                resolve: {
                    source: 'RIPE',
                    objectType: 'mntner',
                    name: 'TEST-MNT',
                    onCancel: ON_CANCEL
                }
            };

            $httpBackend.whenGET(/.*.html/).respond(200);

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should query for last object revision references', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        expect(restService.getReferences).toHaveBeenCalledWith(source, objectType, name, ctrl.MAX_REFS_TO_SHOW);
    });

    it('should select referencesInfo if any', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        expect(ctrl.incomingReferences.length).toEqual(2);
        expect(ctrl.incomingReferences[0].objectType).toEqual('mntner');
        expect(ctrl.incomingReferences[0].primaryKey).toEqual('TEST-MNT');
        expect(ctrl.incomingReferences[1].objectType).toEqual('person');
        expect(ctrl.incomingReferences[1].primaryKey).toEqual('ME-RIPE');
    });

    it('should decide that object can be deleted ', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        expect(ctrl.canBeDeleted).toBe(true);
    });

    it('should call delete endpoint without password and close modal', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        ctrl.reason = 'some reason';

        spyOn(restService, 'deleteObject').and.callThrough();

        ctrl.delete();

        expect(restService.deleteObject).toHaveBeenCalledWith(source, objectType, name, ctrl.reason, true, undefined);
        expect(ctrl.close).toHaveBeenCalled();
    });

    it('should call delete endpoint with password and close modal', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        ctrl.reason = 'some reason';

        spyOn(restService, 'deleteObject').and.callThrough();
        credentialsService.setCredentials('TEST-MNT', 'secret');

        ctrl.delete();

        expect(restService.deleteObject).toHaveBeenCalledWith(source, objectType, name, ctrl.reason, true, 'secret');
        expect(ctrl.close).toHaveBeenCalled();
    });

    it('should dismiss modal after error deleting object', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        spyOn(restService, 'deleteObject').and.returnValue({
            then: function (s, f) {
                f({data: 'error'});
            }
        });

        ctrl.delete();

        expect(ctrl.dismiss).toHaveBeenCalledWith({data: 'error'});
    });

    it('should redirect to success delete page after delete object', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        spyOn(restService, 'deleteObject').and.returnValue({
            then: function (s) {
                s({data: 'error'});
            }
        });

        ctrl.delete();

        expect(ctrl.close).toHaveBeenCalled();
    });
});


describe('webUpdates: ModalDeleteObjectComponent loading references failures ', function () {

    var $componentController, param, bindings, ctrl;
    var $log, $state, $httpBackend, restService;


    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$log_, _$httpBackend_) {

            $state = _$state_;
            $log = _$log_;
            $httpBackend = _$httpBackend_;
            restService = {
                getReferences: function () {
                    return {
                        then: function (s, f) {
                            f({data: 'error'});
                        }
                    }; // pretend to be a promise
                }
            };

            spyOn(restService, 'getReferences').and.callThrough();

            $componentController = _$componentController_;
            param = {
                $state: $state,
                $log: $log,
                RestService: restService
            };
            bindings = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                resolve: {
                    source: 'RIPE',
                    objectType: 'MNT',
                    name: 'TEST-MNT',
                    onCancel: ON_CANCEL
                }
            };

            $httpBackend.whenGET(/.*.html/).respond(200);

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should dismiss modal after error getting object references', function () {
        ctrl = $componentController('modalDeleteObject', param, bindings);
        ctrl.$onInit();

        expect(ctrl.dismiss).toHaveBeenCalledWith('error');
    });

});

var REFS_FOR_UNDELETEABLE_OBJECTS = {
    'primaryKey': 'TEST-MNT',
    'objectType': 'mntner',
    'incoming': [{
        'primaryKey': 'ME-RIPE',
        'objectType': 'person',
        'incoming': [
            {
                'primaryKey': 'TEST-MNT',
                'objectType': 'mntner'
            },
            {
                'primaryKey': 'OWNER-MNT',
                'objectType': 'mntner'
            }
        ],
        'outgoing': []
    }],
    'outgoing': []
};

var REFS_FOR_TEST_MNT = {
    'primaryKey': 'TEST-MNT',
    'objectType': 'mntner',
    'incoming': [{
        'primaryKey': 'TEST-MNT',
        'objectType': 'mntner'
    }, {
        'primaryKey': 'ME-RIPE',
        'objectType': 'person',
        'incoming': [{
            'primaryKey': 'TEST-MNT',
            'objectType': 'mntner'
        }],
        'outgoing': []
    }],
    'outgoing': []
};

var REFS_FOR_TEST_PERSON = {
    'primaryKey': 'ME-RIPE',
    'objectType': 'person',
    'incoming': [{
        'primaryKey': 'TEST-MNT',
        'objectType': 'mntner',
        'incoming': [{
            'primaryKey': 'ME-RIPE',
            'objectType': 'person'
        }],
        'outgoing': []
    }],
    'outgoing': []
};
