'use strict';

describe('textUpdates: TextMultiController', function () {

    var $scope, $state, $stateParams, $httpBackend, $window;
    var WhoisResources;
    var AlertService;
    var SOURCE = 'RIPE';
    var doSetupController;
    var $q;
    var initialState;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_,
                         _WhoisResources_, _AlertService_, _$q_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            $q = _$q_;

            var logger = {
                debug: function (msg) {
                    //console.log('info:' + msg);
                },
                info: function (msg) {
                    //console.log('info:' + msg);
                },
                error: function (msg) {
                    //console.log('error:' + msg);
                }
            };

            doSetupController = function () {

                $stateParams.source = SOURCE;

                _$controller_('TextMultiController', {
                    $scope: $scope, $state: $state, $log: logger, $stateParams: $stateParams
                });
                initialState = $state.current.name;
            }

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should switch to pre-view', function () {
        doSetupController();

        $scope.textMode = true;
        $scope.objects.rpsl = '';

        $scope.setWebMode();

        expect($scope.textMode).toBe(false);
    });

    it('should switch back to text-view', function () {
        doSetupController();

        $scope.textMode = false;
        $scope.objects.rpsl = 'I don\'t care';
        $scope.objects.objects = [{}, {}, {}];

        $scope.setTextMode();

        expect($scope.textMode).toBe(true);
        expect($scope.objects.objects.length).toBe(0);
    });

    it('should extract the rpsl, type and name for each object', function () {
        doSetupController();

        $scope.textMode = false;
        $scope.objects.rpsl =
            'person: Me\n' +
            '\n' +
            'mntner: Him\n';

        $scope.setWebMode();

        expect($scope.objects.objects.length).toBe(2);

        expect($scope.objects.objects[0].type).toBe('person');
        expect($scope.objects.objects[0].name).toBeUndefined();
        expect($scope.objects.objects[0].rpsl).toBe('person: Me\n');

        expect($scope.objects.objects[1].type).toBe('mntner');
        expect($scope.objects.objects[1].name).toBeUndefined();
        expect($scope.objects.objects[1].rpsl).toBe('mntner: Him\n');
    });

    it('should report a syntactically invalid object: unknown attribute', function () {
        doSetupController();

        $scope.textMode = false;
        $scope.objects.rpsl =
            'person: Me\n' +
            'bibaboe: xyz\n';

        $scope.setWebMode();

        expect($scope.objects.objects.length).toBe(1);
        expect($scope.objects.objects[0].type).toBe('person')
        expect($scope.objects.objects[0].name).toBeUndefined();
        expect($scope.objects.objects[0].status).toBe('Invalid syntax');
        expect($scope.objects.objects[0].success).toBe(false);

        expect($scope.objects.objects[0].errors.length).toBe(1);
        expect($scope.objects.objects[0].errors[0].plainText).toBe('bibaboe: Unknown attribute');
    });

    it('should report a syntactically invalid objec: missing mandatory attribute', function () {
        doSetupController();

        $scope.textMode = false;
        $scope.objects.rpsl =
            'person: Me Me\n' +
            'address: xyz\n' +
            'phone:+316\n' +
            'mnt-by: TEST-MMT';
        ;

        $scope.setWebMode();

        expect($scope.objects.objects.length).toBe(1);
        expect($scope.objects.objects[0].type).toBe('person')
        expect($scope.objects.objects[0].name).toBeUndefined();
        expect($scope.objects.objects[0].status).toBe('Invalid syntax');
        expect($scope.objects.objects[0].success).toBe(false);

        expect($scope.objects.objects[0].errors.length).toBe(2);
        expect($scope.objects.objects[0].errors[0].plainText).toBe('nic-hdl: Missing mandatory attribute');
        expect($scope.objects.objects[0].errors[1].plainText).toBe('source: Missing mandatory attribute');
    });

    it('should determine the action for a non existing valid "AUTO-1"-object without a fetch', function () {
        doSetupController();

        $scope.textMode = false;
        $scope.objects.rpsl =
            'person: Me Me\n' +
            'address: xyz\n' +
            'phone:+316\n' +
            'nic-hdl: AUTO-1\n' +
            'mnt-by: TEST-MMT\n' +
            'source: RIPE\n';
        ;

        $scope.setWebMode();

        expect($scope.objects.objects.length).toBe(1);
        expect($scope.objects.objects[0].type).toBe('person');
        expect($scope.objects.objects[0].name).toBe('AUTO-1');
        expect($scope.objects.objects[0].errors.length).toBe(0);

        // Not expect fetch returning 404: help this system to resolve the promise
        $scope.$apply();

        expect($scope.objects.objects[0].success).toBeUndefined();
        expect($scope.objects.objects[0].status).toBe('-');
        expect($scope.objects.objects[0].action).toBe('Create');
        expect($scope.objects.objects[0].displayUrl).toBeUndefined();
        expect($scope.objects.objects[0].textupdatesUrl).toBe('/db-web-ui/#/textupdates/create/RIPE/person?noRedirect=true&rpsl=person%3A%20Me%20Me%0Aaddress%3A%20xyz%0Aphone%3A%2B316%0Anic-hdl%3A%20AUTO-1%0Amnt-by%3A%20TEST-MMT%0Asource%3A%20RIPE%0A');

    });

    it('should determine the action for a pre-existing valid object (uses fetch)', function () {
        doSetupController();

        $scope.textMode = false;
        $scope.objects.rpsl =
            'person: Me Me\n' +
            'address: xyz\n' +
            'phone:+316\n' +
            'nic-hdl: MM1-RIPE\n' +
            'mnt-by: TEST-MMT\n' +
            'source: RIPE\n';
        ;

        $scope.setWebMode();

        expect($scope.objects.objects.length).toBe(1);
        expect($scope.objects.objects[0].type).toBe('person');
        expect($scope.objects.objects[0].name).toBe('MM1-RIPE');
        expect($scope.objects.objects[0].status).toBe('Fetching');
        expect($scope.objects.objects[0].errors.length).toBe(0);

        // expect fetch returning 404
        $httpBackend.whenGET('api/whois/RIPE/person/MM1-RIPE?unfiltered=true&unformatted=true').respond(successResponse);
        $httpBackend.flush();

        expect($scope.objects.objects[0].success).toBeUndefined();
        expect($scope.objects.objects[0].action).toBe('Modify');
        expect($scope.objects.objects[0].displayUrl).toBe('/db-web-ui/#/webupdates/display/RIPE/person/MM1-RIPE');
        expect($scope.objects.objects[0].textupdatesUrl).toBe('/db-web-ui/#/textupdates/modify/RIPE/person/MM1-RIPE?noRedirect=true&rpsl=person%3A%20Me%20Me%0Aaddress%3A%20xyz%0Aphone%3A%2B316%0Anic-hdl%3A%20MM1-RIPE%0Amnt-by%3A%20TEST-MMT%0Asource%3A%20RIPE%0A');
        expect($scope.objects.objects[0].status).toBe('-');

    });

    it('should mark object as failed when non 404 is returned', function () {
        doSetupController();

        $scope.textMode = false;
        $scope.objects.rpsl =
            'person: Me Me\n' +
            'address: xyz\n' +
            'phone:+316\n' +
            'nic-hdl: MM1-RIPE\n' +
            'mnt-by: TEST-MMT\n' +
            'source: RIPE\n';
        ;

        $scope.setWebMode();

        expect($scope.objects.objects.length).toBe(1);
        expect($scope.objects.objects[0].type).toBe('person');
        expect($scope.objects.objects[0].name).toBe('MM1-RIPE');
        expect($scope.objects.objects[0].status).toBe('Fetching');
        expect($scope.objects.objects[0].errors.length).toBe(0);

        // Non 404
        $httpBackend.whenGET('api/whois/RIPE/person/MM1-RIPE?unfiltered=true&unformatted=true').respond(400, errorResponse);
        $httpBackend.flush();

        expect($scope.objects.objects[0].success).toBe(false);
        expect($scope.objects.objects[0].action).toBeUndefined();
        expect($scope.objects.objects[0].displayUrl).toBeUndefined();
        expect($scope.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($scope.objects.objects[0].status).toBe('Error fetching');
        expect($scope.objects.objects[0].errors.length).toBe(1);
        expect($scope.objects.objects[0].errors[0].plainText).toBe('Not authenticated');
    });

    it('should determine the action for non-existing valid object (uses fetch)', function () {
        doSetupController();

        $scope.textMode = false;
        $scope.objects.rpsl =
            'person: Me Me\n' +
            'address: Amsterdam\n' +
            'phone:+316\n' +
            'nic-hdl: MM1-RIPE\n' +
            'mnt-by: TEST-MMT\n' +
            'source: RIPE\n';
        ;

        $scope.setWebMode();

        expect($scope.objects.objects.length).toBe(1);
        expect($scope.objects.objects[0].type).toBe('person');
        expect($scope.objects.objects[0].name).toBe('MM1-RIPE');
        expect($scope.objects.objects[0].status).toBe('Fetching');
        expect($scope.objects.objects[0].errors.length).toBe(0);

        $httpBackend.whenGET('api/whois/RIPE/person/MM1-RIPE?unfiltered=true&unformatted=true').respond(404, errorResponse);
        $httpBackend.flush();

        expect($scope.objects.objects[0].success).toBeUndefined();
        expect($scope.objects.objects[0].action).toBe('Create');
        expect($scope.objects.objects[0].displayUrl).toBeUndefined();
        expect($scope.objects.objects[0].textupdatesUrl).toBe('/db-web-ui/#/textupdates/create/RIPE/person?noRedirect=true&rpsl=person%3A%20Me%20Me%0Aaddress%3A%20Amsterdam%0Aphone%3A%2B316%0Anic-hdl%3A%20MM1-RIPE%0Amnt-by%3A%20TEST-MMT%0Asource%3A%20RIPE%0A');
        expect($scope.objects.objects[0].status).toBe('-');
    });

    it('should not perform an update for syntactically failed objects', function () {
        doSetupController();

        $scope.objects.objects = [];
        $scope.objects.objects.push({
            action: undefined,
            type: 'person',
            name: undefined,
            status: 'Invalid syntax',
            success: false,
            errors: [{},{},{}]
        });

        $scope.submit();

        // No update performed
    });

    it('should perform a create for non-existing objects', function () {
        doSetupController();

        $scope.objects.objects = [];
        $scope.objects.objects.push({
            action: 'Create',
            type: 'person',
            name: 'AUTO-1',
            success: true,
            errors:[]
        });

        $scope.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person?unformatted=true').respond(successResponse);
        $httpBackend.flush();

        expect($scope.objects.objects[0].displayUrl).toBe('/db-web-ui/#/webupdates/display/RIPE/person/TP-RIPE');
        expect($scope.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($scope.objects.objects[0].status).toBe('Created successfully');
    });

    it('should report an error upon create-failure', function () {
        doSetupController();

        $scope.objects.objects = [];
        $scope.objects.objects.push({
            action: 'Create',
            type: 'person',
            name: 'AUTO-1',
            success: true,
            errors:[]
        });

        $scope.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person?unformatted=true').respond(400, errorResponse);
        $httpBackend.flush();

        expect($scope.objects.objects[0].displayUrl).toBeUndefined();
        expect($scope.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($scope.objects.objects[0].status).toBe('Error creating');
        expect($scope.objects.objects[0].errors.length).toBe(1);
        expect($scope.objects.objects[0].errors[0].plainText).toBe('Not authenticated');

    });

    it('should perform a modify for existing objects', function () {
        doSetupController();

        $scope.objects.objects = [];
        $scope.objects.objects.push({
            action: 'Modify',
            type: 'person',
            name: 'MM1-RIPE',
            success: true,
            errors:[]
        });

        $scope.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/MM1-RIPE?unformatted=true').respond(successResponse);
        $httpBackend.flush();

        expect($scope.objects.objects[0].displayUrl).toBe('/db-web-ui/#/webupdates/display/RIPE/person/MM1-RIPE');
        expect($scope.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($scope.objects.objects[0].status).toBe('Modified successfully');
    });

    it('should report an error upon modify-failure', function () {
        doSetupController();

        $scope.objects.objects = [];
        $scope.objects.objects.push( {
            action: 'Modify',
            type: 'person',
            name: 'MM1-RIPE',
            success: true,
            errors:[]
        });

        $scope.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/MM1-RIPE?unformatted=true').respond(403,errorResponse);
        $httpBackend.flush();

        expect($scope.objects.objects[0].displayUrl).toBe('/db-web-ui/#/webupdates/display/RIPE/person/MM1-RIPE');
        expect($scope.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect($scope.objects.objects[0].status).toBe('Error modifying');
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
                    'primary-key': {attribute: [{name: 'nic-hdl', value: 'TP-RIPE'}]},
                    attributes: {
                        attribute: [
                            {name: 'person', value: 'Me Me'},
                            {name: 'address', value: 'Amsterdam'},
                            {name: 'phone', value: '+316'},
                            {name: 'nic-hdl', value: 'MM1-RIPE'},
                            {name: 'mnt-by', value: 'TEST-MNT'},
                            {name: 'source', value: 'RIPE'}
                        ]
                    }
                }
            ]
        }
    }
});
