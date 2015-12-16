'use strict';

describe('textUpdates: TextCreateController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var AlertService;
    var ModalService;
    var SOURCE = 'RIPE';
    var doCreateController;
    var $q;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_, _MessageStore_, _WhoisResources_, _AlertService_, _ModalService_,_$q_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            ModalService = _ModalService_;
            $q = _$q_;

            var SOURCE = 'RIPE';

            var logger = {
                debug: function (msg) {
                    //console.log('info:' + msg);
                },
                info: function (msg) {
                    //console.log('info:' + msg);
                },
                error: function(msg) {
                    //console.log('error:'+ msg);
                }
            };

            doCreateController = function(objectType) {

                $stateParams.source = SOURCE;
                $stateParams.objectType = objectType;
                $stateParams.name = undefined;

                _$controller_('TextCreateController', {
                    $scope: $scope, $state: $state, $log: logger, $stateParams: $stateParams, AlertService: AlertService, ModalService:ModalService
                });
            }

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get parameters from url', function () {
        doCreateController('inetnum');

        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();

        expect($scope.object.source).toBe(SOURCE);
        expect($scope.object.type).toBe('inetnum');
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

    it('should fetch and populate sso mntners', function () {
        doCreateController('inetnum');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
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

        expect(AlertService.getErrors().length).toEqual(0);
    });

    it('should handle empty sso mntners', function () {
        doCreateController('inetnum');

        $httpBackend.whenGET('api/user/mntners').respond([]);
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
        expect(AlertService.getErrors().length).toEqual(0);
    });

    it('should handle error fetching sso mntners', function () {
        doCreateController('inetnum');

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

        expect(AlertService.getErrors()).toEqual([{plainText: 'Error fetching maintainers associated with this SSO account'}]);
    });

    var person_correct =
        'person:        Tester X\n' +
        'address:       Singel, Amsterdam\n' +
        'phone:         +316\n' +
        'nic-hdl:       AUTO-1\n' +
        'mnt-by:        grol129-mnt\n' +
        'mnt-by:        TEST-MNT\n' +
        'source:        RIPE\n';

    it('should present password popup upon submit when no sso mnt-by is used', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TESTSSO-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $scope.object.rpsl = person_correct;

        $scope.submit();

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();
    });

    it('should navigate to display after successfull submit', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $scope.object.rpsl = person_correct;

        $scope.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person').respond({
            objects: {
                object: [
                    {
                        'primary-key': {attribute: [{name: 'nic-hdl', value: 'TX01-RIPE'}]},
                        attributes: {
                            attribute: [
                                {name: 'person', value: 'Tester X'},
                                {name: 'address', value: 'Singel, Amsterdam'},
                                {name: 'phone', value: '+316'},
                                {name: 'nic-hdl', value: 'TX01-RIPE'},
                                {name: 'mnt-by', value: 'TEST-MNT'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            }
        });
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('person');
        expect($stateParams.name).toBe('TX01-RIPE');

        expect(ModalService.openAuthenticationModal).not.toHaveBeenCalled();
    });

    it('should extract password from rpsl', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $scope.object.rpsl = person_correct + 'password:secret\n';

        $scope.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person?password=secret').respond({
            objects: {
                object: [
                    {
                        'primary-key': {attribute: [{name: 'person', value: 'TX01-RIPE'}]},
                        attributes: {
                            attribute: [
                                {name: 'person', value: 'Tester X'},
                                {name: 'address', value: 'Singel, Amsterdam'},
                                {name: 'phone', value: '+316'},
                                {name: 'nic-hdl', value: 'TX01-RIPE'},
                                {name: 'mnt-by', value: 'TEST-MNT'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            }
        });
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('person');
        expect($stateParams.name).toBe('TX01-RIPE');

        expect(ModalService.openAuthenticationModal).not.toHaveBeenCalled();
    });

    it('should extract override from rpsl', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $scope.object.rpsl = person_correct + 'override:me,secret,because\n';

        $scope.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person?override=me,secret,because').respond({
            objects: {
                object: [
                    {
                        'primary-key': {attribute: [{name: 'person', value: 'TX01-RIPE'}]},
                        attributes: {
                            attribute: [
                                {name: 'person', value: 'Tester X'},
                                {name: 'address', value: 'Singel, Amsterdam'},
                                {name: 'phone', value: '+316'},
                                {name: 'nic-hdl', value: 'TX01-RIPE'},
                                {name: 'mnt-by', value: 'TEST-MNT'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            }
        });
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('person');
        expect($stateParams.name).toBe('TX01-RIPE');

        expect(ModalService.openAuthenticationModal).not.toHaveBeenCalled();
    });

    it('should show errors after submit failure ', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        var stateBefore = $state.current.name;

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $scope.object.rpsl = person_correct;

        $scope.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person').respond(400,{
            objects: {
                object: [
                    {
                        'primary-key': {attribute: [{name: 'person', value: 'TX01-RIPE'}]},
                        attributes: {
                            attribute: [
                                {name: 'person', value: 'Tester X'},
                                {name: 'address', value: 'Singel, Amsterdam'},
                                {name: 'phone', value: '+316'},
                                {name: 'nic-hdl', value: 'TX01-RIPE'},
                                {name: 'mnt-by', value: 'TEST-MNT'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            },
            errormessages: {
                errormessage: [
                    {
                        severity: 'Error',
                        text: 'Unrecognized source: %s',
                        'args': [{value: 'INVALID_SOURCE'}]
                    },
                    {
                        severity: 'Warning',
                        text: 'Not authenticated'
                    }, {
                        severity: 'Error',
                        attribute: {
                            name: 'person',
                            value: 'Tester X'
                        },
                        text: '\'%s\' is not valid for this object type',
                        args: [{value: 'Tester X'}]
                    }
                ]
            },
        });
        $httpBackend.flush();

        expect(AlertService.getErrors().length).toEqual(2);
        var plaintextErrors = _.map(AlertService.getErrors(), function(item) {
            return {plainText:item.plainText};
        });
        expect(plaintextErrors).toEqual([
            {plainText: 'Unrecognized source: INVALID_SOURCE'},
            {plainText: 'person: \'Tester X\' is not valid for this object type'}
        ]);

        expect(AlertService.getWarnings().length).toEqual(1);
        var plaintextWarnings = _.map(AlertService.getWarnings(), function(item) {
            return {plainText:item.plainText};
        });
        expect(plaintextWarnings).toEqual([
            {plainText: 'Not authenticated'}
        ]);

        expect($scope.object.rpsl).toEqual(person_correct);

        expect($state.current.name).toBe(stateBefore);

        expect(ModalService.openAuthenticationModal).not.toHaveBeenCalled();
    });

});
