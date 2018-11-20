/*global afterEach, beforeEach, describe, expect, inject, it, module*/
'use strict';

describe('webUpdates: CreatePersonMntnerPair', function () {

    var $state, $stateParams, $httpBackend, $log;
    var MessageStore;
    var WhoisResources;
    var AlertService;
    var RestService;
    var UserInfoService;

    var SOURCE = 'RIPE';
    var PERSON_NAME = 'Titus Tester';
    var PERSON_UID = 'tt-ripe';
    var MNTNER_NAME = 'aardvark-mnt';
    var SSO_EMAIL = 'tester@ripe.net';
    var personMntnerPair;
    var userInfoData;
    var createController;
    var $ctrl;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$log_, _$state_, _$stateParams_, _$httpBackend_, _UserInfoService_, _MessageStore_, _WhoisResources_, _AlertService_, _RestService_) {

            $log = _$log_;
            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            RestService = _RestService_;
            UserInfoService = _UserInfoService_;

            personMntnerPair = WhoisResources.wrapWhoisResources({
                objects: {
                    object: [
                        {
                            'primary-key': {attribute: [{name: 'person', value: PERSON_UID}]},
                            attributes: {
                                attribute: [
                                    {name: 'person', value: PERSON_NAME},
                                    {name: 'mnt-by', value: MNTNER_NAME},
                                    {name: 'nic-hdl', value: PERSON_UID},
                                    {name: 'source', value: SOURCE}
                                ]
                            }
                        },
                        {
                            'primary-key': {attribute: [{name: 'mntner', value: MNTNER_NAME}]},
                            attributes: {
                                attribute: [
                                    {name: 'mntner', value: MNTNER_NAME},
                                    {name: 'admin-c', value: PERSON_UID},
                                    {name: 'mnt-by', value: MNTNER_NAME},
                                    {name: 'source', value: SOURCE}
                                ]
                            }
                        }
                    ]
                }
            });

            userInfoData = {
                user: {
                    'username': SSO_EMAIL,
                    'displayName': 'Tester X',
                    'uuid': '93efb5ac-81f7-40b1-aac7-f2ff497b00e7',
                    'active': true
                }
            };

            UserInfoService.clear();

            createController = function () {

                $stateParams.source = SOURCE;

                $ctrl = _$componentController_('createPersonMntnerPair', {
                    $state: $state, $log: $log, $stateParams: $stateParams,
                    WhoisResources: WhoisResources, AlertService: AlertService, UserInfoService: UserInfoService,
                    RestService: RestService, MessageStore: MessageStore
                });
            };

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should extract data from url', function () {
        createController();

        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function () {
            return [200, userInfoData, {}];
        });
        $httpBackend.flush();

        expect($ctrl.source).toBe(SOURCE);
    });

    it('should be able to handle failing user-info-service', function () {
        createController();

        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function () {
            return [403, whoisObjectWithErrors, {}];
        });
        $httpBackend.flush();

        $ctrl.submit();

        expect($ctrl.AlertService.getErrors()[0].plainText).toEqual('Error fetching SSO information');

        expect($state.current.name).toBe('webupdates.select');

    });


    it('should validate before submitting', function () {
        var stateBefore = $ctrl.$state.current.name;

        createController();

        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function () {
            return [200, userInfoData, {}];
        });
// just submit
        $httpBackend.flush();

        $ctrl.submit();

        expect($ctrl.personAttributes.getSingleAttributeOnName('person').$$error).toEqual('Mandatory attribute not set');
        expect($ctrl.personAttributes.getSingleAttributeOnName('address').$$error).toEqual('Mandatory attribute not set');
        expect($ctrl.personAttributes.getSingleAttributeOnName('phone').$$error).toEqual('Mandatory attribute not set');
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('mntner').$$error).toEqual('Mandatory attribute not set');

        expect($ctrl.$state.current.name).toBe(stateBefore);
        expect($ctrl.source).toBe(SOURCE);

//        $httpBackend.flush();
    });

    it('should pre-populate and submit ok', function () {

        createController();

        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function () {
            return [200, userInfoData, {}];
        });
        $httpBackend.flush();

        $ctrl.personAttributes.setSingleAttributeOnName('person', PERSON_NAME);
        $ctrl.personAttributes.setSingleAttributeOnName('phone', '+316');
        $ctrl.personAttributes.setSingleAttributeOnName('address', 'home');
        $ctrl.mntnerAttributes.setSingleAttributeOnName('mntner', MNTNER_NAME);

        $ctrl.submit();

        expect($ctrl.personAttributes.getSingleAttributeOnName('person').value).toBe(PERSON_NAME);
        expect($ctrl.personAttributes.getSingleAttributeOnName('phone').value).toBe('+316');
        expect($ctrl.personAttributes.getSingleAttributeOnName('address').value).toBe('home');
        expect($ctrl.personAttributes.getSingleAttributeOnName('nic-hdl').value).toEqual('AUTO-1');
        expect($ctrl.personAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(MNTNER_NAME);
        expect($ctrl.personAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('mntner').value).toEqual(MNTNER_NAME);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('admin-c').value).toEqual('AUTO-1');
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('auth').value).toEqual('SSO ' + SSO_EMAIL);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('upd-to').value).toEqual(SSO_EMAIL);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(MNTNER_NAME);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        $httpBackend.expectPOST('api/references/RIPE').respond(function () {
            return [200, personMntnerPair, {}];
        });
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.flush();

        var cachedPerson = WhoisResources.wrapWhoisResources(MessageStore.get(PERSON_UID));
        var personAttrs = WhoisResources.wrapAttributes(cachedPerson.getAttributes());
        expect(personAttrs.getSingleAttributeOnName('person').value).toEqual(PERSON_NAME);
        expect(personAttrs.getSingleAttributeOnName('nic-hdl').value).toEqual(PERSON_UID);

        var cachedMntner = WhoisResources.wrapWhoisResources(MessageStore.get(MNTNER_NAME));
        var mntnerAttrs = WhoisResources.wrapAttributes(cachedMntner.getAttributes());
        expect(mntnerAttrs.getSingleAttributeOnName('mntner').value).toEqual(MNTNER_NAME);

        expect($state.current.name).toBe('webupdates.displayPersonMntnerPair');
        expect($stateParams.person).toBe(PERSON_UID);
        expect($stateParams.mntner).toBe(MNTNER_NAME);

    });

    it('should handle submit failure', function () {
        createController();

        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function () {
            return [200, userInfoData, {}];
        });
        $httpBackend.flush();

        $ctrl.personAttributes.setSingleAttributeOnName('person', 'Titus Tester');
        $ctrl.personAttributes.setSingleAttributeOnName('phone', '+316');
        $ctrl.personAttributes.setSingleAttributeOnName('address', 'home');
        $ctrl.mntnerAttributes.setSingleAttributeOnName('mntner', MNTNER_NAME);

        $ctrl.submit();

        expect($ctrl.personAttributes.getSingleAttributeOnName('person').value).toBe(PERSON_NAME);
        expect($ctrl.personAttributes.getSingleAttributeOnName('nic-hdl').value).toEqual('AUTO-1');
        expect($ctrl.personAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(MNTNER_NAME);
        expect($ctrl.personAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('mntner').value).toEqual(MNTNER_NAME);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('auth').value).toEqual('SSO ' + SSO_EMAIL);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('admin-c').value).toEqual('AUTO-1');
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('upd-to').value).toEqual(SSO_EMAIL);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(MNTNER_NAME);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        $httpBackend.expectPOST('api/references/RIPE').respond(function () {
            return [400, whoisObjectWithErrors, {}];
        });
        $httpBackend.flush();

        expect($ctrl.AlertService.getErrors()[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect($ctrl.AlertService.getWarnings()[0].plainText).toEqual('Not authenticated');
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('mntner').$$error).toEqual('\'' + MNTNER_NAME + '\' is not valid for this object type');

        expect($state.current.name).toBe('webupdates.select');

    });

    var whoisObjectWithErrors = {
        objects: {
            object: [{
                attributes: {
                    attribute: [
                        {name: 'person', value: PERSON_NAME},
                        {name: 'mnt-by', value: MNTNER_NAME},
                        {name: 'source', value: SOURCE}
                    ]
                }
            }, {
                attributes: {
                    attribute: [
                        {name: 'mntner', value: MNTNER_NAME},
                        {name: 'admin-c', value: PERSON_UID},
                        {name: 'mnt-by', value: MNTNER_NAME},
                        {name: 'source', value: SOURCE}
                    ]
                }
            }]
        },
        errormessages: {
            errormessage: [{
                severity: 'Error',
                text: 'Unrecognized source: %s',
                'args': [{value: 'INVALID_SOURCE'}]
            }, {
                severity: 'Warning',
                text: 'Not authenticated'
            }, {
                severity: 'Error',
                attribute: {
                    name: 'mntner',
                    value: MNTNER_NAME
                },
                text: '\'%s\' is not valid for this object type',
                args: [{value: MNTNER_NAME}]
            }]
        }
    };


});
