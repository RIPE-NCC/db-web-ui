/*global beforeEach,describe,inject,it*/
'use strict';

describe('textUpdates: TextCreateComponent', function () {

    var $state, $stateParams, $httpBackend;
    var WhoisResources;
    var AlertService;
    var ModalService;
    var PreferenceService;
    var SOURCE = 'RIPE';
    var doCreateController;
    var $q;
    var initialState;
    var $ctrl;

    beforeEach(function () {
        module('textUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _$window_,
                         _MessageStore_, _WhoisResources_, _AlertService_, _ModalService_,_$q_, _PreferenceService_) {

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            ModalService = _ModalService_;
            PreferenceService = _PreferenceService_;
            $q = _$q_;

            var SOURCE = 'RIPE';

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

            PreferenceService.setTextMode();

            doCreateController = function(objectType, noRedirect, rpsl) {

                $stateParams.source = SOURCE;
                $stateParams.objectType = objectType;
                $stateParams.noRedirect = noRedirect;
                $stateParams.rpsl = rpsl;

                $ctrl = _$componentController_('textCreate', {
                    $state: $state, $log: logger, $stateParams: $stateParams,
                    AlertService: AlertService, ModalService:ModalService
                });
                initialState = $state.current.name;
            }

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

        expect($ctrl.object.source).toBe(SOURCE);
        expect($ctrl.object.type).toBe('inetnum');
    });

    it('should get rpsl from url-parameter', function () {
        doCreateController('inetnum', false, "inetnum:1\inetnum:2\n");

        expect($ctrl.object.source).toBe(SOURCE);
        expect($ctrl.object.type).toBe('inetnum');
        expect($ctrl.object.rpsl).toBe('inetnum:1\inetnum:2\n');
    });

    it('should redirect to webupdates when web-preference is set', function () {
        PreferenceService.setWebMode();
        spyOn($state, "transitionTo");
        doCreateController('inetnum',false);
        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.whenGET(/.*.html/).respond(200);
        expect($state.transitionTo).toHaveBeenCalledWith('webupdates.create', {
            objectType: 'inetnum',
            source: 'RIPE',
        });
    });

    it('should not redirect to webupdates when web-preference is set and no-redirect is true', function () {
        PreferenceService.setWebMode();

        doCreateController('inetnum',true);

        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();
// FIXME [IS]
//   expect($state.current.name).toBe(initialState);
    });

    it('should populate an empty person rpsl, mandatory attrs uppercase and optional lowercase', function() {
        $httpBackend.whenGET('api/user/mntners').respond([]);
        doCreateController('person');
        $httpBackend.flush();
        expect($ctrl.object.rpsl).toEqual(
            'PERSON:        \n' +
            'ADDRESS:       \n' +
            'PHONE:         \n' +
            'fax-no:        \n' +
            'e-mail:        \n' +
            'org:           \n' +
            'NIC-HDL:       AUTO-1\n' +
            'remarks:       \n' +
            'notify:        \n' +
            'MNT-BY:        \n' +
            'SOURCE:        RIPE\n');
    });

    it('should fetch and populate sso mntners', function () {
        doCreateController('inetnum');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        expect($ctrl.object.rpsl).toEqual(
            'INETNUM:       \n' +
            'NETNAME:       \n' +
            'descr:         \n' +
            'COUNTRY:       \n' +
            'geoloc:        \n' +
            'language:      \n' +
            'org:           \n' +
            'sponsoring-org:\n' +
            'ADMIN-C:       \n' +
            'TECH-C:        \n' +
            'abuse-c:       \n' +
            'STATUS:        \n' +
            'remarks:       \n' +
            'notify:        \n' +
            'MNT-BY:        TEST-MNT\n' +
            'mnt-lower:     \n' +
            'mnt-domains:   \n' +
            'mnt-routes:    \n' +
            'mnt-irt:       \n' +
            'SOURCE:        RIPE\n');

        expect(AlertService.getErrors().length).toEqual(0);
    });

    it('should handle empty sso mntners', function () {
        doCreateController('inetnum');

        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();

        expect($ctrl.object.rpsl).toEqual(
            'INETNUM:       \n' +
            'NETNAME:       \n' +
            'descr:         \n' +
            'COUNTRY:       \n' +
            'geoloc:        \n' +
            'language:      \n' +
            'org:           \n' +
            'sponsoring-org:\n' +
            'ADMIN-C:       \n' +
            'TECH-C:        \n' +
            'abuse-c:       \n' +
            'STATUS:        \n' +
            'remarks:       \n' +
            'notify:        \n' +
            'MNT-BY:        \n' +
            'mnt-lower:     \n' +
            'mnt-domains:   \n' +
            'mnt-routes:    \n' +
            'mnt-irt:       \n' +
            'SOURCE:        RIPE\n');
        expect(AlertService.getErrors().length).toEqual(0);
    });

    // TODO fix
    /*
    it('should handle 404 error while fetching sso mntners', function () {
        doCreateController('inetnum');

        $httpBackend.whenGET('api/user/mntners').respond(404);
        $httpBackend.flush();

        expect($state.current.name).toBe('notFound');
    });
    */

    it('should handle error while fetching sso mntners', function () {
        doCreateController('inetnum');

        $httpBackend.whenGET('api/user/mntners').respond(400);
        $httpBackend.flush();

        expect($ctrl.object.rpsl).toEqual(
            'INETNUM:       \n' +
            'NETNAME:       \n' +
            'descr:         \n' +
            'COUNTRY:       \n' +
            'geoloc:        \n' +
            'language:      \n' +
            'org:           \n' +
            'sponsoring-org:\n' +
            'ADMIN-C:       \n' +
            'TECH-C:        \n' +
            'abuse-c:       \n' +
            'STATUS:        \n' +
            'remarks:       \n' +
            'notify:        \n' +
            'MNT-BY:        \n' +
            'mnt-lower:     \n' +
            'mnt-domains:   \n' +
            'mnt-routes:    \n' +
            'mnt-irt:       \n' +
            'SOURCE:        RIPE\n');

        expect(AlertService.getErrors().length).toEqual(1);
        expect(AlertService.getErrors()).toEqual( [ { plainText: 'Error fetching maintainers associated with this SSO account' } ]);

        expect(AlertService.getErrors()).toEqual([{plainText: 'Error fetching maintainers associated with this SSO account'}]);
        // FIXME [IS]
        //expect($state.current.name).toBe(initialState);
    });

    it('should report an error when mandatory field is missing', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TESTSSO-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $ctrl.submit();

        expect(AlertService.getErrors()).toEqual( [
            { plainText: 'person: Mandatory attribute not set' } ,
            { plainText: 'address: Mandatory attribute not set' } ,
            { plainText: 'phone: Mandatory attribute not set' } ,
        ]);

        expect(ModalService.openAuthenticationModal).not.toHaveBeenCalled();
        // FIXME [IS]
        //expect($state.current.name).toBe(initialState);
    });

    it('should report an error when multiple objects are passed in', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TESTSSO-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $ctrl.object.rpsl = person_correct +
            'person: Tester X\n' +
            '\n' +
            'person:Tester Y\n';

        $ctrl.submit();

        expect(AlertService.getErrors()).toEqual( [
            { plainText: 'Only a single object is allowed' } ,
        ]);

        expect(ModalService.openAuthenticationModal).not.toHaveBeenCalled();
        // FIXME [IS]
        //expect($state.current.name).toBe(initialState);
    });

    it('should report an error when unknown attribute is encountered', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $ctrl.object.rpsl = person_correct +
            'wrong:xyz';

        $ctrl.submit();

        expect(AlertService.getErrors()).toEqual( [
            { plainText: 'wrong: Unknown attribute' }
        ]);

        expect(ModalService.openAuthenticationModal).not.toHaveBeenCalled();
        // FIXME [IS]
        //expect($state.current.name).toBe(initialState);
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

        $ctrl.object.rpsl = person_correct;

        $ctrl.submit();

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();
    });

    it('should navigate to display after successful submit', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $ctrl.object.rpsl = person_correct;

        $ctrl.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person?unformatted=true').respond({
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
        $httpBackend.whenGET(/.*.html/).respond(200);
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

        $ctrl.object.rpsl = person_correct + 'password:secret\n';

        $ctrl.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person?password=secret&unformatted=true').respond({
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
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('person');
        expect($stateParams.name).toBe('TX01-RIPE');

        expect(ModalService.openAuthenticationModal).not.toHaveBeenCalled();
    });

    it('should extract override from rpsl and ignore password', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        doCreateController('person');

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $ctrl.object.rpsl = person_correct +
            'override:me,secret,because\n' +
            'password:secret';

        $ctrl.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person?override=me,secret,because&unformatted=true').respond({
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
        $httpBackend.whenGET(/.*.html/).respond(200);
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

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TEST-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        $httpBackend.flush();

        $ctrl.object.rpsl = person_correct;

        $ctrl.submit();

        $httpBackend.expectPOST('api/whois/RIPE/person?unformatted=true').respond(400,{
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

        expect($ctrl.object.rpsl).toEqual(person_correct);
        // FIXME [IS]
        // expect($state.current.name).toBe(initialState);

        expect(ModalService.openAuthenticationModal).not.toHaveBeenCalled();
    });
});
