/*global afterEach, beforeEach, describe, expect, inject, it*/
'use strict';

describe('textUpdates: TextMultiComponent', function () {
    var $scope;
    var $state, $stateParams, $httpBackend, $window;
    var WhoisResources;
    var AlertService;
    var AutoKeyLogicService;
    var SerialExecutor;
    var SOURCE = 'RIPE';
    var doSetupController;
    var $q;
    var initialState;
    var $ctrl;

    beforeEach(function () {
        module('textUpdates');

        inject(function (_$rootScope_, _$componentController_, _$state_, _$stateParams_, _$httpBackend_, _$window_,
                         _WhoisResources_, _AlertService_, _$q_, _AutoKeyLogicService_, _SerialExecutor_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            AutoKeyLogicService = _AutoKeyLogicService_;
            SerialExecutor = _SerialExecutor_;
            $q = _$q_;

            var logger = {
                debug: function () {
                    //console.log('info:' + msg);
                },
                info: function () {
                    //console.log('info:' + msg);
                },
                error: function () {
                    //console.log('error:' + msg);
                }
            };

            doSetupController = function () {

                $stateParams.source = SOURCE;

                $ctrl = _$componentController_('textMulti', {
                    $state: $state, $log: logger, $stateParams: $stateParams
                });
                initialState = $state.current.name;
            };

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should switch to switch to pre-view when rpsl objects are found', function () {
        doSetupController();

        $ctrl.textMode = true;
        $ctrl.objects.rpsl = 'person: test person\n';

        $ctrl.setWebMode();

        expect($ctrl.textMode).toBe(false);
    });

    it('should not switch to switch to pre-view when no rpsl objects where found', function () {
        doSetupController();

        $ctrl.textMode = true;
        $ctrl.objects.rpsl = '';

        $ctrl.setWebMode();

        expect($ctrl.textMode).toBe(true);
        expect(AlertService.getErrors()[0].plainText).toEqual('No valid RPSL found');
    });

    it('should switch back to text-view', function () {
        doSetupController();

        $ctrl.textMode = false;
        $ctrl.objects.rpsl = 'I don\'t care';
        $ctrl.objects.objects = [{}, {}, {}];

        $ctrl.setTextMode();

        expect($ctrl.textMode).toBe(true);
        expect($ctrl.objects.objects.length).toBe(0);
    });

    it('should extract the rpsl, type and name for each object indepent of capitalisation', function () {
        doSetupController();

        $ctrl.textMode = false;
        $ctrl.objects.rpsl =
            'person: Me\n' +
            '\n' +
            'MNTNER: Him\n';

        $ctrl.setWebMode();

        expect($ctrl.objects.objects.length).toBe(2);

        expect($ctrl.objects.objects[0].type).toBe('person');
        expect($ctrl.objects.objects[0].name).toBeUndefined();
        expect($ctrl.objects.objects[0].rpsl).toBe('person: Me\n');

        expect($ctrl.objects.objects[1].type).toBe('mntner');
        expect($ctrl.objects.objects[1].name).toBeUndefined();
        expect($ctrl.objects.objects[1].rpsl).toBe('mntner: Him\n');
    });

    it('should report a syntactically invalid object: unknown attribute', function () {
        doSetupController();

        $ctrl.textMode = false;
        $ctrl.objects.rpsl =
            'person: Me\n' +
            'bibaboe: xyz\n';

        $ctrl.setWebMode();

        expect($ctrl.objects.objects.length).toBe(1);
        expect($ctrl.objects.objects[0].type).toBe('person');
        expect($ctrl.objects.objects[0].name).toBeUndefined();
        expect($ctrl.objects.objects[0].status).toBe('Invalid syntax');
        expect($ctrl.objects.objects[0].success).toBe(false);

        expect($ctrl.objects.objects[0].errors.length).toBe(1);
        expect($ctrl.objects.objects[0].errors[0].plainText).toBe('bibaboe: Unknown attribute');
    });

    it('should report a syntactically invalid objec: missing mandatory attribute', function () {
        doSetupController();

        $ctrl.textMode = false;
        $ctrl.objects.rpsl =
            'person: Me Me\n' +
            'address: xyz\n' +
            'phone:+316\n' +
            'mnt-by: TEST-MMT';

        $ctrl.setWebMode();

        expect($ctrl.objects.objects.length).toBe(1);
        expect($ctrl.objects.objects[0].type).toBe('person');
        expect($ctrl.objects.objects[0].name).toBeUndefined();
        expect($ctrl.objects.objects[0].status).toBe('Invalid syntax');
        expect($ctrl.objects.objects[0].success).toBe(false);

        expect($ctrl.objects.objects[0].errors.length).toBe(2);
        expect($ctrl.objects.objects[0].errors[0].plainText).toBe('nic-hdl: Missing mandatory attribute');
        expect($ctrl.objects.objects[0].errors[1].plainText).toBe('source: Missing mandatory attribute');
    });

    it('should determine the action for a non existing valid "AUTO-1"-object without a fetch', function () {
        doSetupController();

        $ctrl.textMode = false;
        $ctrl.objects.rpsl =
            'person: Me Me\n' +
            'address: xyz\n' +
            'phone:+316\n' +
            'nic-hdl: AUTO-1\n' +
            'mnt-by: TEST-MMT\n' +
            'source: RIPE\n';

        $ctrl.setWebMode();

        expect($ctrl.objects.objects.length).toBe(1);
        expect($ctrl.objects.objects[0].type).toBe('person');
        expect($ctrl.objects.objects[0].name).toBe('AUTO-1');
        expect($ctrl.objects.objects[0].errors.length).toBe(0);

        // Not expect fetch returning 404: help this system to resolve the promise
        $scope.$apply();

        expect($ctrl.objects.objects[0].success).toBeUndefined();
        expect($ctrl.objects.objects[0].status).toBe('Object does not yet exist');
        expect($ctrl.objects.objects[0].action).toBe('create');
        expect($ctrl.objects.objects[0].displayUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].textupdatesUrl).toBe('#/textupdates/create/RIPE/person?noRedirect=true&rpsl=person%3A%20Me%20Me%0Aaddress%3A%20xyz%0Aphone%3A%2B316%0Anic-hdl%3A%20AUTO-1%0Amnt-by%3A%20TEST-MMT%0Asource%3A%20RIPE%0A');

    });

    it('should determine the action for a pre-existing valid object (uses fetch)', function () {
        doSetupController();

        $ctrl.textMode = false;
        $ctrl.objects.rpsl =
            'person: Me Me\n' +
            'address: xyz\n' +
            'phone:+316\n' +
            'nic-hdl: MM1-RIPE\n' +
            'mnt-by: TEST-MMT\n' +
            'source: RIPE\n';

        $ctrl.setWebMode();

        expect($ctrl.objects.objects.length).toBe(1);
        expect($ctrl.objects.objects[0].type).toBe('person');
        expect($ctrl.objects.objects[0].name).toBe('MM1-RIPE');
        expect($ctrl.objects.objects[0].status).toBe('Fetching');
        expect($ctrl.objects.objects[0].errors.length).toBe(0);

        // expect fetch returning 404
        $httpBackend.whenGET('api/whois/RIPE/person/MM1-RIPE?unfiltered=true&unformatted=true').respond(successResponse);
        $httpBackend.flush();

        expect($ctrl.objects.objects[0].rpslOriginal).toBeDefined();
        expect($ctrl.objects.objects[0].success).toBeUndefined();
        expect($ctrl.objects.objects[0].action).toBe('modify');
        expect($ctrl.objects.objects[0].displayUrl).toBe('#/webupdates/display/RIPE/person/MM1-RIPE');
        expect($ctrl.objects.objects[0].textupdatesUrl).toBe('#/textupdates/modify/RIPE/person/MM1-RIPE?noRedirect=true&rpsl=person%3A%20Me%20Me%0Aaddress%3A%20xyz%0Aphone%3A%2B316%0Anic-hdl%3A%20MM1-RIPE%0Amnt-by%3A%20TEST-MMT%0Asource%3A%20RIPE%0A');
        expect($ctrl.objects.objects[0].status).toBe('Object exists');

    });

    it('should mark object as failed when non 404 is returned', function () {
        doSetupController();

        $ctrl.textMode = false;
        $ctrl.objects.rpsl =
            'person: Me Me\n' +
            'address: xyz\n' +
            'phone:+316\n' +
            'nic-hdl: MM1-RIPE\n' +
            'mnt-by: TEST-MMT\n' +
            'source: RIPE\n';

        $ctrl.setWebMode();

        expect($ctrl.objects.objects.length).toBe(1);
        expect($ctrl.objects.objects[0].type).toBe('person');
        expect($ctrl.objects.objects[0].name).toBe('MM1-RIPE');
        expect($ctrl.objects.objects[0].status).toBe('Fetching');
        expect($ctrl.objects.objects[0].errors.length).toBe(0);

        // Non 404
        $httpBackend.whenGET('api/whois/RIPE/person/MM1-RIPE?unfiltered=true&unformatted=true').respond(400, errorResponse);
        $httpBackend.flush();

        expect($ctrl.objects.objects[0].rpslOriginal).toBeUndefined();
        expect($ctrl.objects.objects[0].success).toBe(false);
        expect($ctrl.objects.objects[0].exists).toBe(undefined);
        expect($ctrl.objects.objects[0].action).toBe('create');
        expect($ctrl.objects.objects[0].displayUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].status).toBe('Error fetching');
        expect($ctrl.objects.objects[0].errors.length).toBe(1);
        expect($ctrl.objects.objects[0].errors[0].plainText).toBe('Not authenticated');
    });

    it('should determine the action for non-existing valid object (uses fetch)', function () {
        doSetupController();

        $ctrl.textMode = false;
        $ctrl.objects.rpsl =
            'person: Me Me\n' +
            'address: Amsterdam\n' +
            'phone:+316\n' +
            'nic-hdl: MM1-RIPE\n' +
            'mnt-by: TEST-MMT\n' +
            'source: RIPE\n';

        $ctrl.setWebMode();

        expect($ctrl.objects.objects.length).toBe(1);
        expect($ctrl.objects.objects[0].type).toBe('person');
        expect($ctrl.objects.objects[0].name).toBe('MM1-RIPE');
        expect($ctrl.objects.objects[0].status).toBe('Fetching');
        expect($ctrl.objects.objects[0].errors.length).toBe(0);

        $httpBackend.whenGET('api/whois/RIPE/person/MM1-RIPE?unfiltered=true&unformatted=true').respond(404, errorResponse);
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.flush();

        expect($ctrl.objects.objects[0].rpslOriginal).toBeUndefined();
        expect($ctrl.objects.objects[0].success).toBeUndefined();
        expect($ctrl.objects.objects[0].action).toBe('create');
        expect($ctrl.objects.objects[0].displayUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].textupdatesUrl).toBe('#/textupdates/create/RIPE/person?noRedirect=true&rpsl=person%3A%20Me%20Me%0Aaddress%3A%20Amsterdam%0Aphone%3A%2B316%0Anic-hdl%3A%20MM1-RIPE%0Amnt-by%3A%20TEST-MMT%0Asource%3A%20RIPE%0A');
        expect($ctrl.objects.objects[0].status).toBe('Object does not yet exist');
    });

    it('should not perform an update for syntactically failed objects', function () {
        // spyOn(SerialExecutor, 'execute').and.callFake(function() { return $q.defer().promise; });
        doSetupController();

        $ctrl.objects.objects = [];
        $ctrl.objects.objects.push({
            action: undefined,
            type: 'person',
            name: undefined,
            status: 'Invalid syntax',
            success: false,
            errors: [{},{},{}]
        });

        $ctrl.submit();

        // No update performed
    });

    it('should perform a create for non-existing objects', function () {
        doSetupController();

        $ctrl.objects.objects = [];
        $ctrl.objects.objects.push({
            action: 'create',
            exists:false,
            type: 'person',
            name: 'AUTO-1',
            attributes: WhoisResources.wrapAndEnrichAttributes('person', [ {name: 'person', value: 'Me Me'}, {name:'nic-hdl', value:'AUTO-1'}]),
            success: undefined,
            errors:[]
        });
        $httpBackend.expectPOST('api/whois/RIPE/person?unformatted=true').respond(successResponse);
        // spyOn(SerialExecutor, 'execute').and.callFake(function() { return $q.defer().promise; });
        $ctrl.submit();
        $httpBackend.flush();

        expect($ctrl.objects.objects[0].status).toBe('Create success');
        expect($ctrl.objects.objects[0].displayUrl).toBe('#/webupdates/display/RIPE/person/MM1-RIPE');
        expect($ctrl.objects.objects[0].textupdatesUrl).toBeUndefined();
        // verify RPSL is rewritten to prevent second create
        expect($ctrl.objects.objects[0].rpsl).toBe(
            'person:Me Me\n'+
            'address:Amsterdam\n'+
            'phone:+316\n'+
            'nic-hdl:MM1-RIPE\n'+
            'mnt-by:TEST-MNT\n'+
            'created:2015-12-28T09:10:20Z\n'+
            'last-modified:2015-12-28T09:12:25Z\n'+
            'source:RIPE\n');
        expect($ctrl.objects.objects[0].showDiff).toBeFalsy();

    });

    it('should report an error upon create-failure', function () {
        doSetupController();

        $ctrl.objects.objects = [];
        $ctrl.objects.objects.push({
            action: 'create',
            exists: false,
            type: 'person',
            name: 'AUTO-1',
            attributes: WhoisResources.wrapAndEnrichAttributes('person', [ {name: 'person', value: 'Me Me'}, {name:'nic-hdl', value:'AUTO-1'}]),
            success: undefined,
            errors:[]
        });
        $ctrl.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person?unformatted=true').respond(400, errorResponse);
        $httpBackend.flush();

        expect($ctrl.objects.objects[0].status).toBe('Create error');
        expect($ctrl.objects.objects[0].displayUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].errors.length).toBe(1);
        expect($ctrl.objects.objects[0].errors[0].plainText).toBe('Not authenticated');
        expect($ctrl.objects.objects[0].showDiff).toBeFalsy();

    });

    it('should perform a modify for existing objects', function () {
        doSetupController();

        $ctrl.objects.objects = [];
        $ctrl.objects.objects.push({
            action: 'modify',
            type: 'person',
            name: 'MM1-RIPE',
            attributes: WhoisResources.wrapAndEnrichAttributes('person', [ {name: 'person', value: 'Me Me'}, {name:'nic-hdl', value:'MM1-RIPE'}]),
            success: undefined,
            errors:[]
        });
        $ctrl.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/MM1-RIPE?unformatted=true').respond(successResponse);
        $httpBackend.flush();

        expect($ctrl.objects.objects[0].status).toBe('Modify success');
        expect($ctrl.objects.objects[0].displayUrl).toBe('#/webupdates/display/RIPE/person/MM1-RIPE');
        expect($ctrl.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].showDiff).toBe(true);
        expect($ctrl.objects.objects[0].rpsl).toBe(
            'person:Me Me\n'+
            'address:Amsterdam\n'+
            'phone:+316\n'+
            'nic-hdl:MM1-RIPE\n'+
            'mnt-by:TEST-MNT\n'+
            'created:2015-12-28T09:10:20Z\n'+
            'last-modified:2015-12-28T09:12:25Z\n'+
            'source:RIPE\n');
    });

    it('should report an error upon modify-failure', function () {
        doSetupController();

        $ctrl.objects.objects = [];
        $ctrl.objects.objects.push( {
            action: 'modify',
            type: 'person',
            name: 'MM1-RIPE',
            attributes: WhoisResources.wrapAndEnrichAttributes('person', [ {name: 'person', value: 'Me Me'}, {name:'nic-hdl', value:'MM1-RIPE'}]),
            success: undefined,
            errors:[]
        });
        $ctrl.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/MM1-RIPE?unformatted=true').respond(403,errorResponse);
        $httpBackend.flush();

        expect($ctrl.objects.objects[0].status).toBe('Modify error');
        expect($ctrl.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].displayUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].showDiff).toBeFalsy();

    });


    it('should perform a delete for existing object', function () {
        doSetupController();

        $ctrl.objects.objects = [];
        $ctrl.objects.objects.push({
            action: 'modify',
            type: 'person',
            name: 'MM1-RIPE',
            attributes: WhoisResources.wrapAndEnrichAttributes('person', [ {name: 'person', value: 'Me Me'}, {name:'nic-hdl', value:'MM1-RIPE'}]),
            success: undefined,
            deleteReason:'just because',
            passwords:['secret'],
            errors:[]
        });
        $ctrl.submit();

        $httpBackend.expectDELETE('api/whois/RIPE/person/MM1-RIPE?dry-run=false&password=secret&reason=just+because').respond(successResponse);
        $httpBackend.flush();

        expect($ctrl.objects.objects[0].status).toBe('Delete success');
        expect($ctrl.objects.objects[0].displayUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].showDiff).toBeFalsy();
        expect($ctrl.objects.objects[0].rpsl).toBe(
            'person:Me Me\n'+
            'address:Amsterdam\n'+
            'phone:+316\n'+
            'nic-hdl:MM1-RIPE\n'+
            'mnt-by:TEST-MNT\n'+
            'created:2015-12-28T09:10:20Z\n'+
            'last-modified:2015-12-28T09:12:25Z\n'+
            'source:RIPE\n' +
            'delete:just because\n' +
            'password:secret\n');
    });

    it('should report an error upon delete-failure', function () {
        doSetupController();

        $ctrl.objects.objects = [];
        $ctrl.objects.objects.push( {
            action: 'modify',
            type: 'person',
            name: 'MM1-RIPE',
            attributes: WhoisResources.wrapAndEnrichAttributes('person', [ {name: 'person', value: 'Me Me'}, {name:'nic-hdl', value:'MM1-RIPE'}]),
            success: undefined,
            deleteReason:'just because',
            passwords:['secret'],
            errors:[]
        });
        $ctrl.submit();

        $httpBackend.expectDELETE('api/whois/RIPE/person/MM1-RIPE?dry-run=false&password=secret&reason=just+because').respond(403,errorResponse);
        $httpBackend.flush();

        expect($ctrl.objects.objects[0].status).toBe('Delete error');
        expect($ctrl.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].displayUrl).toBeUndefined();
        expect($ctrl.objects.objects[0].showDiff).toBeFalsy();

    });


    var errorResponse = {
        errormessages: {
            errormessage: [
                {severity: 'Error', text: 'Not authenticated'}
            ]
        }
    };

    var successResponse = {
        objects: {
            object: [
                {
                    'primary-key': {attribute: [{name: 'nic-hdl', value: 'MM1-RIPE'}]},
                    attributes: {
                        attribute: [
                            {name: 'person',  value: 'Me Me'},
                            {name: 'address', value: 'Amsterdam'},
                            {name: 'phone',   value: '+316'},
                            {name: 'nic-hdl', value: 'MM1-RIPE'},
                            {name: 'mnt-by',  value: 'TEST-MNT'},
                            {name: 'created',  value: '2015-12-28T09:10:20Z'},
                            {name: 'last-modified',  value: '2015-12-28T09:12:25Z'},
                            {name: 'source',  value: 'RIPE'}
                        ]
                    }
                }
            ]
        }
    };
});
