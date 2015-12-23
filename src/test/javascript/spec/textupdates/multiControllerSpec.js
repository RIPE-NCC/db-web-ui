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

            doSetupController = function() {

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

    it('should switch to preview with the rspl in text-area', function() {
        doSetupController();

        expect($scope.textMode).toBe(true);

        $scope.objects.rpsl = '';

        $scope.setWebMode();

        expect($scope.textMode).toBe(false);
    });

    it('should extract the rpsl, type and name for each object', function () {
        doSetupController();

        expect($scope.textMode).toBe(true);

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

        expect($scope.textMode).toBe(true);

        $scope.objects.rpsl =
            'person: Me\n' +
            'bibaboe: xyz\n';

        $scope.setWebMode();

        expect($scope.objects.objects.length).toBe(1);
        expect($scope.objects.objects[0].type).toBe('person')
        expect($scope.objects.objects[0].name).toBeUndefined();
        expect($scope.objects.objects[0].status).toBe('Invalid syntax');
        expect($scope.objects.objects[0].errors.length).toBe(1);
        expect($scope.objects.objects[0].errors[0].plainText).toBe('bibaboe: Unknown attribute');
    });

    it('should report a syntactically invalid objec: missing mandatory attribute', function () {
        doSetupController();

        expect($scope.textMode).toBe(true);

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
        expect($scope.objects.objects[0].errors.length).toBe(2);
        expect($scope.objects.objects[0].errors[0].plainText).toBe('nic-hdl: Missing mandatory attribute');
        expect($scope.objects.objects[0].errors[1].plainText).toBe('source: Missing mandatory attribute');
    });

    it('should determine the action for each valid object (requires fetch)', function () {
        doSetupController();

        expect($scope.textMode).toBe(true);

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
        expect($scope.objects.objects[0].status).toBe('Fetching');
        expect($scope.objects.objects[0].errors.length).toBe(0);

        // TODO expect fetch
    });

    it('should perform a create for non-existing objects', function () {
        // TODO
    });

    it('should report an error upon create-failure', function () {
        // TODO
    });

    it('should navigate to create single-object in textupdates when right link is clicked', function () {
        // TODO
    });

    it('should perform a modify for existing objects', function () {
        // TODO
    });

    it('should report an error upon modify-failure', function () {
        // TODO
    });

    it('should navigate to modify single-object in textupdates when right link is clicked', function () {
        // TODO
    });

});
