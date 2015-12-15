'use strict';

describe('webUpdates: TextCreateController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var AlertService;
    var SOURCE = 'RIPE';
    var OBJECT_TYPE = 'inetnum';
    var doCreateController;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_,_MessageStore_, _WhoisResources_,_AlertService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;

            var SOURCE = 'RIPE';

            doCreateController = function(objectType) {
                if(_.isUndefined(objectType)) {
                    objectType = OBJECT_TYPE;
                }
                $stateParams.source = SOURCE;
                $stateParams.objectType = objectType;
                $stateParams.name = undefined;

                _$controller_('TextCreateController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams, AlertService:AlertService
                });
            }

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get parameters from url', function () {
        doCreateController();

        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();

        expect($scope.object.source).toBe(SOURCE);
        expect($scope.object.type).toBe(OBJECT_TYPE);
    });

    it('should fetch and populate sso mntners', function() {
        doCreateController();

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key':'TEST-MNT', 'type':'mntner','auth':['SSO'],'mine':true}
        ]);
        $httpBackend.flush();

        expect($scope.object.rpsl).toEqual(
            'INETNUM:       \n' +
            'NETNAME:       \n' +
            'DESCR:         \n' +
            'COUNTRY:       \n' +
            'geoloc:        \n' +
            'language:      \n' +
            'org:           \n' +
            'sponsoring-org:\n' +
            'ADMIN-C:       \n' +
            'TECH-C:        \n' +
            'STATUS:        \n' +
            'remarks:       \n' +
            'notify:        \n' +
            'MNT-BY:        TEST-MNT\n' +
            'mnt-lower:     \n' +
            'mnt-domains:   \n' +
            'mnt-routes:    \n' +
            'mnt-irt:       \n' +
            'changed:       \n' +
            'created:       \n' +
            'last-modified: \n' +
            'SOURCE:        RIPE\n');
    });

    it('should handle error fetching sso mntners', function() {
        doCreateController();

        $httpBackend.whenGET('api/user/mntners').respond(404);
        $httpBackend.flush();

        expect($scope.object.rpsl).toEqual(
            'INETNUM:       \n' +
            'NETNAME:       \n' +
            'DESCR:         \n' +
            'COUNTRY:       \n' +
            'geoloc:        \n' +
            'language:      \n' +
            'org:           \n' +
            'sponsoring-org:\n' +
            'ADMIN-C:       \n' +
            'TECH-C:        \n' +
            'STATUS:        \n' +
            'remarks:       \n' +
            'notify:        \n' +
            'MNT-BY:        \n' +
            'mnt-lower:     \n' +
            'mnt-domains:   \n' +
            'mnt-routes:    \n' +
            'mnt-irt:       \n' +
            'changed:       \n' +
            'created:       \n' +
            'last-modified: \n' +
            'SOURCE:        RIPE\n');

        expect(AlertService.getErrors().length).toEqual(1);
        expect(AlertService.getErrors()).toEqual( [ { plainText: 'Error fetching maintainers associated with this SSO account' } ]);
    });


    it('should populate an empty person rpsl, mandatory attrs uppercase and optional lowercase', function() {
        doCreateController('person');
        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();
        expect($scope.object.rpsl).toEqual(
            'PERSON:        \n' +
            'ADDRESS:       \n' +
            'PHONE:         \n' +
            'fax-no:        \n' +
            'e-mail:        \n' +
            'org:           \n' +
            'NIC-HDL:       AUTO-1\n' +
            'remarks:       \n' +
            'notify:        \n' +
            'abuse-mailbox: \n' +
            'MNT-BY:        \n' +
            'changed:       \n' +
            'created:       \n' +
            'last-modified: \n' +
            'SOURCE:        RIPE\n');
    });
});
